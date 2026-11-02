//! Evaluates a subset of Rust: `let`, `if`, `for`, `while`, arithmetic, strings, closures, and calls
//! into the table of widgets. Anything else is an error that says so, at its line.

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use frus::{Align, Color, IconData, Justify, TextAlign, Variant, Widget};
use syn::spanned::Spanned;
use syn::{BinOp, Expr, Lit, Pat, Stmt, UnOp};

use crate::widgets::{self, Node};

/// An error, and where in the source it is. Lines count from 1, columns from 0.
#[derive(Clone, Debug, PartialEq)]
pub struct Failure {
    pub line: usize,
    pub column: usize,
    pub message: String,
}

impl Failure {
    pub fn at(span: proc_macro2::Span, message: impl Into<String>) -> Self {
        let start = span.start();
        Self {
            line: start.line,
            column: start.column,
            message: message.into(),
        }
    }

    pub fn encode(&self) -> String {
        format!("{}:{}:{}", self.line, self.column, self.message)
    }
}

pub type Res<T> = Result<T, Failure>;
type Span = proc_macro2::Span;

/// What an expression evaluates to.
#[derive(Clone)]
pub enum Value {
    Unit,
    Bool(bool),
    Int(i64),
    Float(f64),
    Str(Rc<str>),
    List(Rc<Vec<Value>>),
    Tuple(Rc<Vec<Value>>),
    Color(Color),
    Icon(IconData),
    Justify(Justify),
    Align(Align),
    Variant(Variant),
    TextAlign(TextAlign),
    Insets(frus::Insets),
    /// What `cx.theme()` gives back; `theme.scheme` is the same value here.
    Theme(Rc<frus::Theme>),
    /// `cx`: only asks for hooks.
    Context,
    /// What `use_state` gives back.
    State(Rc<RefCell<Value>>),
    /// A `&mut` to a value, as `update`'s closure receives.
    Reference(Rc<RefCell<Value>>),
    Closure(Rc<Closure>),
    /// A widget being built: moved out when it is used, like the value it stands for.
    Widget(Rc<RefCell<Option<Node>>>),
}

impl Value {
    pub fn widget(node: Node) -> Self {
        Value::Widget(Rc::new(RefCell::new(Some(node))))
    }

    fn kind(&self) -> &'static str {
        match self {
            Value::Unit => "()",
            Value::Bool(_) => "a bool",
            Value::Int(_) => "an integer",
            Value::Float(_) => "a float",
            Value::Str(_) => "a string",
            Value::List(_) => "a list",
            Value::Tuple(_) => "a tuple",
            Value::Color(_) => "a Color",
            Value::Icon(_) => "an icon",
            Value::Justify(_) => "a Justify",
            Value::Align(_) => "an Align",
            Value::Variant(_) => "a Variant",
            Value::TextAlign(_) => "a TextAlign",
            Value::Insets(_) => "an Insets",
            Value::Theme(_) => "a theme",
            Value::Context => "the build context",
            Value::State(_) => "a state",
            Value::Reference(_) => "a reference",
            Value::Closure(_) => "a closure",
            Value::Widget(_) => "a widget",
        }
    }

    fn display(&self) -> String {
        match self {
            Value::Unit => "()".into(),
            Value::Bool(b) => b.to_string(),
            Value::Int(i) => i.to_string(),
            Value::Float(f) => f.to_string(),
            Value::Str(s) => s.to_string(),
            Value::State(cell) | Value::Reference(cell) => cell.borrow().display(),
            other => format!("<{}>", other.kind()),
        }
    }

    fn resolved(&self) -> Value {
        match self {
            Value::Reference(cell) => cell.borrow().resolved(),
            other => other.clone(),
        }
    }
}

/// A closure and the variables it can see.
pub struct Closure {
    params: Vec<Pat>,
    body: Expr,
    scope: Scope,
}

impl Closure {
    /// Runs it from a widget's handler. An error goes to the page, not to the widget.
    pub fn fire(self: &Rc<Self>, args: Vec<Value>, span: Span) {
        let mut run = Run::new();
        if let Err(failure) = run.call(self, args, span) {
            crate::report_late(failure);
        }
    }
}

/// A chain of scopes. Each variable is a cell, so a closure writes to the one it captured.
#[derive(Clone, Default)]
struct Scope(Option<Rc<ScopeNode>>);

struct ScopeNode {
    name: String,
    cell: Rc<RefCell<Value>>,
    parent: Scope,
}

impl Scope {
    fn with(&self, name: String, value: Value) -> Scope {
        Scope(Some(Rc::new(ScopeNode {
            name,
            cell: Rc::new(RefCell::new(value)),
            parent: self.clone(),
        })))
    }

    fn get(&self, name: &str) -> Option<Rc<RefCell<Value>>> {
        let mut at = self;
        while let Some(node) = &at.0 {
            if node.name == name {
                return Some(node.cell.clone());
            }
            at = &node.parent;
        }
        None
    }
}

thread_local! {
    /// The theme the application is drawn in, once it has told us.
    static THEME: RefCell<Option<Rc<frus::Theme>>> = const { RefCell::new(None) };
    /// `use_state`'s values, in calling order, kept across rebuilds and across edits that leave
    /// the call's text as it was.
    static SLOTS: RefCell<Vec<(String, Rc<RefCell<Value>>)>> = const { RefCell::new(Vec::new()) };
}

/// The application's theme, for `cx.theme()` and for the background behind the preview.
pub fn set_theme(theme: &frus::Theme) {
    THEME.with(|t| *t.borrow_mut() = Some(Rc::new(theme.clone())));
}

fn theme() -> Rc<frus::Theme> {
    THEME.with(|t| t.borrow_mut().get_or_insert_with(|| Rc::new(frus::Theme::light())).clone())
}

/// Source that parsed.
pub struct Program {
    body: Expr,
    context: Option<String>,
}

/// How much a build or a handler may do before it is stopped, so a loop cannot hang the page.
const BUDGET: u64 = 2_000_000;

impl Program {
    /// Accepts a whole file (with `fn app(cx: &BuildContext) -> Box<dyn Widget>`, or the first
    /// function if none has that name), or a bare expression.
    pub fn parse(source: &str) -> Res<Program> {
        match syn::parse_file(source) {
            Ok(file) => Self::from_file(file),
            Err(file_error) => match syn::parse_str::<Expr>(source) {
                Ok(body) => Ok(Program { body, context: None }),
                Err(_) => Err(Failure::at(file_error.span(), file_error.to_string())),
            },
        }
    }

    fn from_file(file: syn::File) -> Res<Program> {
        let mut functions = Vec::new();
        for item in file.items {
            match item {
                syn::Item::Fn(f) => functions.push(f),
                // `use` lines make the file real Rust; here every name is already known.
                syn::Item::Use(_) => {}
                syn::Item::Macro(m) if m.mac.path.segments.last().is_some_and(|s| s.ident == "main") => {}
                other => {
                    return Err(Failure::at(
                        other.span(),
                        "The playground runs one function: structs, impls and other items are not supported yet.",
                    ))
                }
            }
        }
        let index = functions.iter().position(|f| f.sig.ident == "app").or(if functions.is_empty() {
            None
        } else {
            Some(0)
        });
        let Some(index) = index else {
            return Err(Failure {
                line: 1,
                column: 0,
                message: "Write a function, such as `fn app(cx: &BuildContext) -> Box<dyn Widget>`.".into(),
            });
        };
        let function = functions.swap_remove(index);
        let context = function.sig.inputs.first().and_then(|arg| match arg {
            syn::FnArg::Typed(typed) => match &*typed.pat {
                Pat::Ident(ident) => Some(ident.ident.to_string()),
                _ => None,
            },
            _ => None,
        });
        Ok(Program {
            body: Expr::Block(syn::ExprBlock {
                attrs: Vec::new(),
                label: None,
                block: *function.block,
            }),
            context,
        })
    }

    /// Evaluates the function: the widget it returns.
    pub fn build(&self) -> Res<Box<dyn Widget>> {
        let mut run = Run::new();
        let mut scope = Scope::default();
        if let Some(name) = &self.context {
            scope = scope.with(name.clone(), Value::Context);
        }
        let value = run.eval(&self.body, &scope)?;
        let widget = match value {
            Value::Widget(cell) => cell.borrow_mut().take().map(presented),
            _ => None,
        };
        widget.ok_or_else(|| {
            Failure::at(self.body.span(), "This must end with a widget: no `;` after the last expression.")
        })
    }
}

/// What the preview shows, always on the theme's background. Code with its own `Scaffold` decides
/// the layout; anything else is shown centred.
fn presented(node: Node) -> Box<dyn Widget> {
    let inner: Box<dyn Widget> = match node {
        Node::Scaffold(_) => node.into_widget(),
        other => Box::new(frus::Center::new(other.into_widget())),
    };
    Box::new(frus::Scaffold::new().background(theme().background).body(inner))
}

enum Flow {
    Value(Value),
    Return(Value),
}

/// One evaluation.
struct Run {
    steps: Cell<u64>,
    slot: usize,
}

impl Run {
    fn new() -> Self {
        Self {
            steps: Cell::new(0),
            slot: 0,
        }
    }

    fn tick(&self, span: Span) -> Res<()> {
        let steps = self.steps.get() + 1;
        self.steps.set(steps);
        if steps > BUDGET {
            return Err(Failure::at(span, "This code ran for too long, and was stopped."));
        }
        Ok(())
    }

    fn call(&mut self, closure: &Rc<Closure>, args: Vec<Value>, span: Span) -> Res<Value> {
        if closure.params.len() != args.len() {
            return Err(Failure::at(
                span,
                format!("This closure takes {} argument(s), and is given {}.", closure.params.len(), args.len()),
            ));
        }
        let mut scope = closure.scope.clone();
        for (pat, value) in closure.params.iter().zip(args) {
            scope = bind(pat, value, &scope)?;
        }
        if let Expr::Block(block) = &closure.body {
            return match self.block(&block.block, &scope)? {
                Flow::Value(v) | Flow::Return(v) => Ok(v),
            };
        }
        self.eval(&closure.body, &scope)
    }

    fn block(&mut self, block: &syn::Block, scope: &Scope) -> Res<Flow> {
        let mut scope = scope.clone();
        let mut last = Value::Unit;
        for stmt in &block.stmts {
            last = Value::Unit;
            match stmt {
                Stmt::Local(local) => {
                    let init = local
                        .init
                        .as_ref()
                        .ok_or_else(|| Failure::at(local.span(), "Give this `let` a value."))?;
                    let value = self.eval(&init.expr, &scope)?;
                    scope = bind(&local.pat, value, &scope)?;
                }
                Stmt::Expr(Expr::Return(ret), _) => {
                    let value = match &ret.expr {
                        Some(e) => self.eval(e, &scope)?,
                        None => Value::Unit,
                    };
                    return Ok(Flow::Return(value));
                }
                Stmt::Expr(expr, semi) => {
                    let value = self.eval(expr, &scope)?;
                    if semi.is_none() {
                        last = value;
                    }
                }
                Stmt::Macro(m) => {
                    let value = self.mac(&m.mac, &scope)?;
                    if m.semi_token.is_none() {
                        last = value;
                    }
                }
                Stmt::Item(item) => {
                    return Err(Failure::at(item.span(), "Items inside a function are not supported yet."))
                }
            }
        }
        Ok(Flow::Value(last))
    }

    fn eval(&mut self, expr: &Expr, scope: &Scope) -> Res<Value> {
        self.tick(expr.span())?;
        match expr {
            Expr::Lit(lit) => literal(&lit.lit),
            Expr::Paren(e) => self.eval(&e.expr, scope),
            Expr::Group(e) => self.eval(&e.expr, scope),
            Expr::Block(b) => match self.block(&b.block, scope)? {
                Flow::Value(v) | Flow::Return(v) => Ok(v),
            },
            Expr::Tuple(t) => {
                if t.elems.is_empty() {
                    return Ok(Value::Unit);
                }
                let items = t.elems.iter().map(|e| self.eval(e, scope)).collect::<Res<Vec<_>>>()?;
                Ok(Value::Tuple(Rc::new(items)))
            }
            Expr::Array(a) => {
                let items = a.elems.iter().map(|e| self.eval(e, scope)).collect::<Res<Vec<_>>>()?;
                Ok(Value::List(Rc::new(items)))
            }
            Expr::Path(path) => self.path(path, scope),
            Expr::Reference(r) => self.eval(&r.expr, scope),
            Expr::Field(f) => self.field(f, scope),
            Expr::Cast(cast) => self.cast(cast, scope),
            Expr::Unary(u) => self.unary(u, scope),
            Expr::Binary(b) => self.binary(b, scope),
            Expr::Assign(a) => {
                let value = self.eval(&a.right, scope)?.resolved();
                self.assign(&a.left, value, scope)?;
                Ok(Value::Unit)
            }
            Expr::If(i) => self.if_expr(i, scope),
            Expr::While(w) => {
                while self.truth(&w.cond, scope)? {
                    self.tick(w.span())?;
                    self.block(&w.body, scope)?;
                }
                Ok(Value::Unit)
            }
            Expr::ForLoop(f) => self.for_loop(f, scope),
            Expr::Range(r) => self.range(r, scope),
            Expr::Closure(c) => Ok(Value::Closure(Rc::new(Closure {
                params: c.inputs.iter().cloned().collect(),
                body: (*c.body).clone(),
                scope: scope.clone(),
            }))),
            Expr::Call(call) => self.call_expr(call, scope),
            Expr::MethodCall(m) => self.method(m, scope),
            Expr::Macro(m) => self.mac(&m.mac, scope),
            other => Err(Failure::at(other.span(), "The playground does not support this kind of expression yet.")),
        }
    }

    fn path(&mut self, path: &syn::ExprPath, scope: &Scope) -> Res<Value> {
        if let Some(ident) = path.path.get_ident() {
            let name = ident.to_string();
            return scope
                .get(&name)
                .map(|cell| cell.borrow().clone())
                .ok_or_else(|| Failure::at(ident.span(), format!("Nothing is named `{name}` here.")));
        }
        let (ty, name) = last_two(&path.path);
        widgets::constant(&ty, &name)
            .ok_or_else(|| Failure::at(path.span(), format!("The playground does not know `{ty}::{name}` yet.")))
    }

    fn field(&mut self, f: &syn::ExprField, scope: &Scope) -> Res<Value> {
        let value = self.eval(&f.base, scope)?.resolved();
        let name = match &f.member {
            syn::Member::Named(ident) => ident.to_string(),
            syn::Member::Unnamed(index) => index.index.to_string(),
        };
        let Value::Theme(theme) = &value else {
            return Err(Failure::at(f.span(), format!("{} has no field `{name}` here.", value.kind())));
        };
        let scheme = &theme.scheme;
        let color = match name.as_str() {
            "scheme" => return Ok(value.clone()),
            "background" => theme.background,
            "surface" => scheme.surface,
            "on_surface" => scheme.on_surface,
            "primary" => scheme.primary,
            "on_primary" => scheme.on_primary,
            "secondary" => scheme.secondary,
            "outline" => scheme.outline,
            _ => return Err(Failure::at(f.span(), format!("The playground does not offer the theme's `{name}` yet."))),
        };
        Ok(Value::Color(color))
    }

    fn cast(&mut self, cast: &syn::ExprCast, scope: &Scope) -> Res<Value> {
        let value = self.eval(&cast.expr, scope)?.resolved();
        let to = match &*cast.ty {
            syn::Type::Path(p) => p.path.get_ident().map(ToString::to_string).unwrap_or_default(),
            _ => String::new(),
        };
        match (value, to.as_str()) {
            (Value::Int(i), "f32" | "f64") => Ok(Value::Float(i as f64)),
            (Value::Float(f), "f32" | "f64") => Ok(Value::Float(f)),
            (Value::Int(i), _) => Ok(Value::Int(i)),
            (Value::Float(f), _) => Ok(Value::Int(f as i64)),
            (other, _) => Err(Failure::at(cast.span(), format!("{} cannot be cast.", other.kind()))),
        }
    }

    fn unary(&mut self, u: &syn::ExprUnary, scope: &Scope) -> Res<Value> {
        let value = self.eval(&u.expr, scope)?;
        match (&u.op, value.resolved()) {
            (UnOp::Deref(_), v) => Ok(v),
            (UnOp::Not(_), Value::Bool(b)) => Ok(Value::Bool(!b)),
            (UnOp::Neg(_), Value::Int(i)) => Ok(Value::Int(-i)),
            (UnOp::Neg(_), Value::Float(f)) => Ok(Value::Float(-f)),
            (_, other) => Err(Failure::at(u.span(), format!("This operator does not apply to {}.", other.kind()))),
        }
    }

    fn binary(&mut self, b: &syn::ExprBinary, scope: &Scope) -> Res<Value> {
        let compound = match b.op {
            BinOp::AddAssign(_) => Some(BinOp::Add(Default::default())),
            BinOp::SubAssign(_) => Some(BinOp::Sub(Default::default())),
            BinOp::MulAssign(_) => Some(BinOp::Mul(Default::default())),
            BinOp::DivAssign(_) => Some(BinOp::Div(Default::default())),
            BinOp::RemAssign(_) => Some(BinOp::Rem(Default::default())),
            _ => None,
        };
        if let Some(op) = compound {
            let left = self.eval(&b.left, scope)?.resolved();
            let right = self.eval(&b.right, scope)?.resolved();
            let value = arithmetic(&op, left, right, b.span())?;
            self.assign(&b.left, value, scope)?;
            return Ok(Value::Unit);
        }
        match b.op {
            BinOp::And(_) => return Ok(Value::Bool(self.truth(&b.left, scope)? && self.truth(&b.right, scope)?)),
            BinOp::Or(_) => return Ok(Value::Bool(self.truth(&b.left, scope)? || self.truth(&b.right, scope)?)),
            _ => {}
        }
        let left = self.eval(&b.left, scope)?.resolved();
        let right = self.eval(&b.right, scope)?.resolved();
        arithmetic(&b.op, left, right, b.span())
    }

    fn truth(&mut self, e: &Expr, scope: &Scope) -> Res<bool> {
        match self.eval(e, scope)?.resolved() {
            Value::Bool(b) => Ok(b),
            other => Err(Failure::at(e.span(), format!("Expected a bool, found {}.", other.kind()))),
        }
    }

    fn assign(&mut self, target: &Expr, value: Value, scope: &Scope) -> Res<()> {
        match target {
            Expr::Path(path) => {
                let ident = path
                    .path
                    .get_ident()
                    .ok_or_else(|| Failure::at(path.span(), "Assign to a variable."))?;
                let cell = scope
                    .get(&ident.to_string())
                    .ok_or_else(|| Failure::at(ident.span(), format!("Nothing is named `{ident}` here.")))?;
                *cell.borrow_mut() = value;
                Ok(())
            }
            Expr::Unary(syn::ExprUnary {
                op: UnOp::Deref(_),
                expr,
                ..
            }) => match self.eval(expr, scope)? {
                Value::Reference(cell) => {
                    *cell.borrow_mut() = value;
                    Ok(())
                }
                other => Err(Failure::at(expr.span(), format!("{} cannot be dereferenced.", other.kind()))),
            },
            other => Err(Failure::at(other.span(), "The playground can only assign to variables.")),
        }
    }

    fn if_expr(&mut self, i: &syn::ExprIf, scope: &Scope) -> Res<Value> {
        if self.truth(&i.cond, scope)? {
            return match self.block(&i.then_branch, scope)? {
                Flow::Value(v) | Flow::Return(v) => Ok(v),
            };
        }
        match &i.else_branch {
            Some((_, e)) => self.eval(e, scope),
            None => Ok(Value::Unit),
        }
    }

    fn for_loop(&mut self, f: &syn::ExprForLoop, scope: &Scope) -> Res<Value> {
        let items = self.eval(&f.expr, scope)?.resolved();
        let Value::List(items) = items else {
            return Err(Failure::at(f.expr.span(), format!("`for` needs a range or a list, not {}.", items.kind())));
        };
        for item in items.iter() {
            self.tick(f.span())?;
            let inner = bind(&f.pat, item.clone(), scope)?;
            self.block(&f.body, &inner)?;
        }
        Ok(Value::Unit)
    }

    fn range(&mut self, r: &syn::ExprRange, scope: &Scope) -> Res<Value> {
        let start = self.bound(&r.start, r.span(), scope)?;
        let mut end = self.bound(&r.end, r.span(), scope)?;
        if matches!(r.limits, syn::RangeLimits::Closed(_)) {
            end += 1;
        }
        if end - start > 100_000 {
            return Err(Failure::at(r.span(), "This range is too long for the playground."));
        }
        Ok(Value::List(Rc::new((start..end).map(Value::Int).collect())))
    }

    fn bound(&mut self, e: &Option<Box<Expr>>, span: Span, scope: &Scope) -> Res<i64> {
        let Some(e) = e else {
            return Err(Failure::at(span, "A range needs both its ends here."));
        };
        match self.eval(e, scope)?.resolved() {
            Value::Int(i) => Ok(i),
            other => Err(Failure::at(e.span(), format!("A range is made of integers, not {}.", other.kind()))),
        }
    }

    fn args<'a>(&mut self, exprs: impl Iterator<Item = &'a Expr>, scope: &Scope) -> Res<Vec<(Value, Span)>> {
        let mut out = Vec::new();
        for expr in exprs {
            out.push((self.eval(expr, scope)?, expr.span()));
        }
        Ok(out)
    }

    fn call_expr(&mut self, call: &syn::ExprCall, scope: &Scope) -> Res<Value> {
        let Expr::Path(path) = &*call.func else {
            return Err(Failure::at(call.func.span(), "The playground can only call functions by name."));
        };
        let args = self.args(call.args.iter(), scope)?;
        if let Some(ident) = path.path.get_ident() {
            let name = ident.to_string();
            if let Some(cell) = scope.get(&name) {
                let held = cell.borrow().clone();
                if let Value::Closure(closure) = held {
                    return self.call(&closure, args.into_iter().map(|a| a.0).collect(), call.span());
                }
            }
            return widgets::function(&name, Args::new(args, call.span()));
        }
        let (ty, name) = last_two(&path.path);
        if ty == "Box" && name == "new" {
            let mut args = args;
            return match args.len() {
                1 => Ok(args.remove(0).0),
                _ => Err(Failure::at(call.span(), "`Box::new` takes one value.")),
            };
        }
        if ty == "String" && name == "new" {
            return Ok(Value::Str("".into()));
        }
        widgets::constructor(&ty, &name, Args::new(args, call.span()))
    }

    fn method(&mut self, m: &syn::ExprMethodCall, scope: &Scope) -> Res<Value> {
        let name = m.method.to_string();
        let span = m.method.span();
        let receiver = self.eval(&m.receiver, scope)?;
        let args = self.args(m.args.iter(), scope)?;
        match (&receiver, name.as_str()) {
            (Value::Context, "use_state") => return self.use_state(m, args),
            (Value::Context, "theme") => return Ok(Value::Theme(theme())),
            (Value::Context, other) => {
                return Err(Failure::at(span, format!("The playground offers `use_state` and `theme` on `cx`, not `{other}`, yet.")))
            }
            (Value::State(_) | Value::Closure(_) | Value::Reference(_), "clone") => return Ok(receiver),
            (Value::State(cell), "get") => return Ok(cell.borrow().clone()),
            (Value::State(cell), "set") => {
                let value = args.into_iter().next().ok_or_else(|| Failure::at(span, "`set` takes a value."))?;
                *cell.borrow_mut() = value.0.resolved();
                crate::invalidate();
                return Ok(Value::Unit);
            }
            (Value::State(cell), "update") => {
                let Some((Value::Closure(closure), _)) = args.into_iter().next() else {
                    return Err(Failure::at(span, "`update` takes a closure."));
                };
                self.call(&closure, vec![Value::Reference(cell.clone())], span)?;
                crate::invalidate();
                return Ok(Value::Unit);
            }
            _ => {}
        }
        if let Value::Widget(cell) = &receiver {
            let node = cell.borrow_mut().take().ok_or_else(|| {
                Failure::at(m.receiver.span(), "This widget has already been used: it moved, as in Rust.")
            })?;
            return widgets::method(node, &name, Args::new(args, span)).map(Value::widget);
        }
        plain_method(receiver.resolved(), &name, args, span)
    }

    fn use_state(&mut self, m: &syn::ExprMethodCall, args: Vec<(Value, Span)>) -> Res<Value> {
        let Some((Value::Closure(init), _)) = args.into_iter().next() else {
            return Err(Failure::at(m.span(), "`use_state` takes a closure: `cx.use_state(|| 0)`."));
        };
        let text = quote::quote!(#m).to_string();
        let index = self.slot;
        self.slot += 1;
        let kept = SLOTS.with(|s| s.borrow().get(index).filter(|(t, _)| *t == text).map(|(_, c)| c.clone()));
        if let Some(cell) = kept {
            return Ok(Value::State(cell));
        }
        let value = self.call(&init, Vec::new(), m.span())?.resolved();
        let cell = Rc::new(RefCell::new(value));
        SLOTS.with(|s| {
            let mut slots = s.borrow_mut();
            slots.truncate(index);
            slots.push((text, cell.clone()));
        });
        Ok(Value::State(cell))
    }

    fn mac(&mut self, mac: &syn::Macro, scope: &Scope) -> Res<Value> {
        let name = mac.path.segments.last().map(|s| s.ident.to_string()).unwrap_or_default();
        let parts = mac
            .parse_body_with(syn::punctuated::Punctuated::<Expr, syn::Token![,]>::parse_terminated)
            .map_err(|e| Failure::at(e.span(), e.to_string()))?;
        match name.as_str() {
            "vec" => {
                let items = parts.iter().map(|e| self.eval(e, scope)).collect::<Res<Vec<_>>>()?;
                Ok(Value::List(Rc::new(items)))
            }
            "format" => self.format(mac, &parts, scope),
            "row" | "column" => {
                let args = self.args(parts.iter(), scope)?;
                widgets::flex_macro(&name, Args::new(args, mac.span()))
            }
            other => Err(Failure::at(mac.span(), format!("The playground does not know `{other}!` yet."))),
        }
    }

    fn format(
        &mut self,
        mac: &syn::Macro,
        parts: &syn::punctuated::Punctuated<Expr, syn::Token![,]>,
        scope: &Scope,
    ) -> Res<Value> {
        let mut given = parts.iter();
        let Some(Expr::Lit(syn::ExprLit {
            lit: Lit::Str(template),
            ..
        })) = given.next()
        else {
            return Err(Failure::at(mac.span(), "`format!` starts with a string."));
        };
        let text = template.value();
        let mut out = String::new();
        let mut chars = text.chars().peekable();
        while let Some(c) = chars.next() {
            match c {
                '{' if chars.peek() == Some(&'{') => {
                    chars.next();
                    out.push('{');
                }
                '}' if chars.peek() == Some(&'}') => {
                    chars.next();
                    out.push('}');
                }
                '{' => {
                    let mut spec = String::new();
                    for c in chars.by_ref() {
                        if c == '}' {
                            break;
                        }
                        spec.push(c);
                    }
                    let (name, style) = spec.split_once(':').unwrap_or((&spec, ""));
                    let value = if name.is_empty() {
                        let e = given
                            .next()
                            .ok_or_else(|| Failure::at(mac.span(), "`format!` has more `{}` than values."))?;
                        self.eval(e, scope)?
                    } else {
                        scope
                            .get(name)
                            .map(|c| c.borrow().clone())
                            .ok_or_else(|| Failure::at(mac.span(), format!("Nothing is named `{name}` here.")))?
                    };
                    out.push_str(&styled(&value.resolved(), style));
                }
                c => out.push(c),
            }
        }
        Ok(Value::Str(out.into()))
    }
}

fn styled(value: &Value, style: &str) -> String {
    if let (Some(digits), Value::Float(f)) = (style.strip_prefix('.').and_then(|d| d.parse::<usize>().ok()), value) {
        return format!("{f:.digits$}");
    }
    value.display()
}

fn bind(pat: &Pat, value: Value, scope: &Scope) -> Res<Scope> {
    match pat {
        Pat::Ident(ident) => Ok(scope.with(ident.ident.to_string(), value)),
        Pat::Type(typed) => bind(&typed.pat, value, scope),
        Pat::Reference(r) => bind(&r.pat, value.resolved(), scope),
        Pat::Wild(_) => Ok(scope.clone()),
        Pat::Tuple(t) => {
            let Value::Tuple(items) = value.resolved() else {
                return Err(Failure::at(t.span(), "This pattern needs a tuple."));
            };
            if items.len() != t.elems.len() {
                return Err(Failure::at(t.span(), "This tuple has another number of values."));
            }
            let mut scope = scope.clone();
            for (pat, item) in t.elems.iter().zip(items.iter()) {
                scope = bind(pat, item.clone(), &scope)?;
            }
            Ok(scope)
        }
        other => Err(Failure::at(other.span(), "The playground does not support this pattern yet.")),
    }
}

fn literal(lit: &Lit) -> Res<Value> {
    match lit {
        Lit::Str(s) => Ok(Value::Str(s.value().into())),
        Lit::Bool(b) => Ok(Value::Bool(b.value)),
        Lit::Int(i) => i
            .base10_parse::<i64>()
            .map(Value::Int)
            .map_err(|e| Failure::at(i.span(), e.to_string())),
        Lit::Float(f) => f
            .base10_parse::<f64>()
            .map(Value::Float)
            .map_err(|e| Failure::at(f.span(), e.to_string())),
        other => Err(Failure::at(other.span(), "The playground does not support this literal yet.")),
    }
}

fn arithmetic(op: &BinOp, left: Value, right: Value, span: Span) -> Res<Value> {
    use Value::{Bool, Float, Int, Str};
    let by_zero = || Failure::at(span, "Division by zero.");
    Ok(match (op, left, right) {
        (BinOp::Add(_), Int(a), Int(b)) => Int(a.wrapping_add(b)),
        (BinOp::Sub(_), Int(a), Int(b)) => Int(a.wrapping_sub(b)),
        (BinOp::Mul(_), Int(a), Int(b)) => Int(a.wrapping_mul(b)),
        (BinOp::Div(_), Int(a), Int(b)) => Int(a.checked_div(b).ok_or_else(by_zero)?),
        (BinOp::Rem(_), Int(a), Int(b)) => Int(a.checked_rem(b).ok_or_else(by_zero)?),
        (BinOp::Add(_), Float(a), Float(b)) => Float(a + b),
        (BinOp::Sub(_), Float(a), Float(b)) => Float(a - b),
        (BinOp::Mul(_), Float(a), Float(b)) => Float(a * b),
        (BinOp::Div(_), Float(a), Float(b)) => Float(a / b),
        (BinOp::Add(_), Str(a), Str(b)) => Str(format!("{a}{b}").into()),
        (BinOp::Eq(_), Int(a), Int(b)) => Bool(a == b),
        (BinOp::Ne(_), Int(a), Int(b)) => Bool(a != b),
        (BinOp::Lt(_), Int(a), Int(b)) => Bool(a < b),
        (BinOp::Le(_), Int(a), Int(b)) => Bool(a <= b),
        (BinOp::Gt(_), Int(a), Int(b)) => Bool(a > b),
        (BinOp::Ge(_), Int(a), Int(b)) => Bool(a >= b),
        (BinOp::Eq(_), Float(a), Float(b)) => Bool(a == b),
        (BinOp::Ne(_), Float(a), Float(b)) => Bool(a != b),
        (BinOp::Lt(_), Float(a), Float(b)) => Bool(a < b),
        (BinOp::Le(_), Float(a), Float(b)) => Bool(a <= b),
        (BinOp::Gt(_), Float(a), Float(b)) => Bool(a > b),
        (BinOp::Ge(_), Float(a), Float(b)) => Bool(a >= b),
        (BinOp::Eq(_), Str(a), Str(b)) => Bool(a == b),
        (BinOp::Ne(_), Str(a), Str(b)) => Bool(a != b),
        (BinOp::Eq(_), Bool(a), Bool(b)) => Bool(a == b),
        (BinOp::Ne(_), Bool(a), Bool(b)) => Bool(a != b),
        (_, a, b) => {
            return Err(Failure::at(
                span,
                format!(
                    "This operator does not apply to {} and {}. As in Rust, use `as f32` to mix numbers.",
                    a.kind(),
                    b.kind()
                ),
            ))
        }
    })
}

fn plain_method(receiver: Value, name: &str, args: Vec<(Value, Span)>, span: Span) -> Res<Value> {
    match (&receiver, name) {
        (_, "clone" | "to_owned" | "into" | "iter" | "into_iter") => Ok(receiver),
        (_, "to_string") => Ok(Value::Str(receiver.display().into())),
        (Value::List(items), "len") => Ok(Value::Int(items.len() as i64)),
        (Value::Str(s), "len") => Ok(Value::Int(s.len() as i64)),
        (Value::Str(s), "is_empty") => Ok(Value::Bool(s.is_empty())),
        (Value::Str(s), "to_uppercase") => Ok(Value::Str(s.to_uppercase().into())),
        (Value::Str(s), "to_lowercase") => Ok(Value::Str(s.to_lowercase().into())),
        (Value::Str(s), "trim") => Ok(Value::Str(s.trim().into())),
        (Value::Str(_), "as_str") => Ok(receiver),
        (Value::Float(f), "round") => Ok(Value::Float(f.round())),
        (Value::Float(f), "floor") => Ok(Value::Float(f.floor())),
        (Value::Float(f), "ceil") => Ok(Value::Float(f.ceil())),
        (Value::Float(a), "min" | "max") => match args.first() {
            Some((Value::Float(b), _)) => Ok(Value::Float(if name == "min" { a.min(*b) } else { a.max(*b) })),
            _ => Err(Failure::at(span, format!("`{name}` takes a float."))),
        },
        (Value::Int(a), "min" | "max") => match args.first() {
            Some((Value::Int(b), _)) => Ok(Value::Int(if name == "min" { *a.min(b) } else { *a.max(b) })),
            _ => Err(Failure::at(span, format!("`{name}` takes an integer."))),
        },
        _ => Err(Failure::at(
            span,
            format!("The playground does not know the method `{name}` on {}.", receiver.kind()),
        )),
    }
}

fn last_two(path: &syn::Path) -> (String, String) {
    let mut names = path.segments.iter().rev().map(|s| s.ident.to_string());
    let name = names.next().unwrap_or_default();
    let ty = names.next().unwrap_or_default();
    (ty, name)
}

/// A call's arguments, converted in order. Every conversion names what it wanted.
pub struct Args {
    items: std::vec::IntoIter<(Value, Span)>,
    span: Span,
    pub count: usize,
}

impl Args {
    pub fn new(items: Vec<(Value, Span)>, span: Span) -> Self {
        Self {
            count: items.len(),
            items: items.into_iter(),
            span,
        }
    }

    pub fn span(&self) -> Span {
        self.span
    }

    fn next(&mut self, wanted: &str) -> Res<(Value, Span)> {
        self.items
            .next()
            .map(|(v, s)| (v.resolved(), s))
            .ok_or_else(|| Failure::at(self.span, format!("An argument is missing here: {wanted}.")))
    }

    pub fn finish(&mut self) -> Res<()> {
        match self.items.next() {
            Some((_, span)) => Err(Failure::at(span, "One argument too many.")),
            None => Ok(()),
        }
    }

    pub fn f32(&mut self) -> Res<f32> {
        match self.next("a float, such as `12.0`")? {
            (Value::Float(f), _) => Ok(f as f32),
            (Value::Int(i), span) => Err(Failure::at(span, format!("Rust wants a float here: write `{i}.0`."))),
            (other, span) => Err(Failure::at(span, format!("Expected a float, found {}.", other.kind()))),
        }
    }

    pub fn usize(&mut self) -> Res<usize> {
        match self.next("an integer")? {
            (Value::Int(i), span) => usize::try_from(i).map_err(|_| Failure::at(span, "This cannot be negative.")),
            (other, span) => Err(Failure::at(span, format!("Expected an integer, found {}.", other.kind()))),
        }
    }

    pub fn bool(&mut self) -> Res<bool> {
        match self.next("a bool")? {
            (Value::Bool(b), _) => Ok(b),
            (other, span) => Err(Failure::at(span, format!("Expected a bool, found {}.", other.kind()))),
        }
    }

    pub fn string(&mut self) -> Res<String> {
        match self.next("a string")? {
            (Value::Str(s), _) => Ok(s.to_string()),
            (other, span) => Err(Failure::at(span, format!("Expected a string, found {}.", other.kind()))),
        }
    }

    pub fn color(&mut self) -> Res<Color> {
        match self.next("a colour, such as `Colors::RED`")? {
            (Value::Color(c), _) => Ok(c),
            (other, span) => Err(Failure::at(span, format!("Expected a Color, found {}.", other.kind()))),
        }
    }

    pub fn icon(&mut self) -> Res<IconData> {
        match self.next("an icon, such as `Icons::ADD`")? {
            (Value::Icon(i), _) => Ok(i),
            (other, span) => Err(Failure::at(span, format!("Expected an icon, found {}.", other.kind()))),
        }
    }

    pub fn justify(&mut self) -> Res<Justify> {
        match self.next("a `Justify`")? {
            (Value::Justify(v), _) => Ok(v),
            (other, span) => Err(Failure::at(span, format!("Expected a Justify, found {}.", other.kind()))),
        }
    }

    pub fn align(&mut self) -> Res<Align> {
        match self.next("an `Align`")? {
            (Value::Align(v), _) => Ok(v),
            (other, span) => Err(Failure::at(span, format!("Expected an Align, found {}.", other.kind()))),
        }
    }

    pub fn variant(&mut self) -> Res<Variant> {
        match self.next("a `Variant`")? {
            (Value::Variant(v), _) => Ok(v),
            (other, span) => Err(Failure::at(span, format!("Expected a Variant, found {}.", other.kind()))),
        }
    }

    pub fn text_align(&mut self) -> Res<TextAlign> {
        match self.next("a `TextAlign`")? {
            (Value::TextAlign(v), _) => Ok(v),
            (other, span) => Err(Failure::at(span, format!("Expected a TextAlign, found {}.", other.kind()))),
        }
    }

    pub fn insets(&mut self) -> Res<frus::Insets> {
        match self.next("an `Insets`, such as `Insets::uniform(16.0)`")? {
            (Value::Insets(v), _) => Ok(v),
            (other, span) => Err(Failure::at(span, format!("Expected an Insets, found {}.", other.kind()))),
        }
    }

    pub fn widget(&mut self) -> Res<Box<dyn Widget>> {
        match self.next("a widget")? {
            (Value::Widget(cell), span) => cell
                .borrow_mut()
                .take()
                .map(Node::into_widget)
                .ok_or_else(|| Failure::at(span, "This widget has already been used: it moved, as in Rust.")),
            (other, span) => Err(Failure::at(span, format!("Expected a widget, found {}.", other.kind()))),
        }
    }

    fn closure(&mut self) -> Res<(Rc<Closure>, Span)> {
        match self.next("a closure")? {
            (Value::Closure(c), span) => Ok((c, span)),
            (other, span) => Err(Failure::at(span, format!("Expected a closure, found {}.", other.kind()))),
        }
    }

    /// A handler with no argument: `move || ...`.
    pub fn callback(&mut self) -> Res<frus::Callback> {
        let (closure, span) = self.closure()?;
        Ok(frus::Callback::new(move || closure.fire(Vec::new(), span)))
    }

    pub fn on_bool(&mut self) -> Res<impl Fn(bool) -> frus::Callback + 'static> {
        let (closure, span) = self.closure()?;
        Ok(move |v: bool| {
            let closure = closure.clone();
            frus::Callback::new(move || closure.fire(vec![Value::Bool(v)], span))
        })
    }

    pub fn on_f32(&mut self) -> Res<impl Fn(f32) -> frus::Callback + 'static> {
        let (closure, span) = self.closure()?;
        Ok(move |v: f32| {
            let closure = closure.clone();
            frus::Callback::new(move || closure.fire(vec![Value::Float(v as f64)], span))
        })
    }

    pub fn on_string(&mut self) -> Res<impl Fn(String) -> frus::Callback + 'static> {
        let (closure, span) = self.closure()?;
        Ok(move |v: String| {
            let closure = closure.clone();
            let v: Rc<str> = v.into();
            frus::Callback::new(move || closure.fire(vec![Value::Str(v.clone())], span))
        })
    }
}
