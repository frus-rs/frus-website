import {useEffect, useImperativeHandle, useRef, type ReactNode, type Ref} from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import {autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap} from '@codemirror/autocomplete';
import {defaultKeymap, history, historyKeymap, indentWithTab} from '@codemirror/commands';
import {rust} from '@codemirror/lang-rust';
import {bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting} from '@codemirror/language';
import {setDiagnostics} from '@codemirror/lint';
import {Compartment, EditorSelection, EditorState} from '@codemirror/state';
import {oneDark} from '@codemirror/theme-one-dark';
import {drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers} from '@codemirror/view';

import {completions} from './completions';

export type Failure = {line: number; column: number; message: string};
export type EditorHandle = {goTo: (failure: Failure) => void};

// Fills its box, and leaves the colours of the text to the highlight style.
const fill = EditorView.theme({
  '&': {height: '100%', fontSize: '13px', backgroundColor: 'transparent'},
  '.cm-scroller': {fontFamily: 'var(--ifm-font-family-monospace)', lineHeight: '20px', overflow: 'auto'},
  '.cm-gutters': {backgroundColor: 'transparent', border: 'none'},
  '&.cm-focused': {outline: 'none'},
  '.cm-tooltip-autocomplete ul li': {fontFamily: 'var(--ifm-font-family-monospace)'},
  '.cm-completionInfo': {maxWidth: '26rem', whiteSpace: 'pre-wrap', fontFamily: 'var(--ifm-font-family-base)'},
});

const offsetOf = (state: EditorState, failure: Failure) => {
  const line = state.doc.line(Math.min(Math.max(failure.line, 1), state.doc.lines));
  return Math.min(line.from + failure.column, line.to);
};

type Props = {
  value: string;
  failure: Failure | null;
  onChange: (value: string) => void;
  ref?: Ref<EditorHandle>;
};

export default function Editor({value, failure, onChange, ref}: Props): ReactNode {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  const appearance = useRef(new Compartment());
  const {colorMode} = useColorMode();
  const dark = colorMode === 'dark';

  useEffect(() => {
    const created = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          drawSelection(),
          history(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          rust(),
          EditorState.tabSize.of(4),
          autocompletion({override: [completions], icons: false}),
          keymap.of([...closeBracketsKeymap, ...completionKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          fill,
          appearance.current.of(dark ? oneDark : syntaxHighlighting(defaultHighlightStyle)),
          EditorView.contentAttributes.of({'aria-label': 'Rust code'}),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) change.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = created;
    return () => {
      created.destroy();
      view.current = null;
    };
    // Made once: the value and the colours follow through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A value from outside, such as another example.
  useEffect(() => {
    const current = view.current;
    if (current && current.state.doc.toString() !== value) {
      current.dispatch({changes: {from: 0, to: current.state.doc.length, insert: value}});
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({
      effects: appearance.current.reconfigure(dark ? oneDark : syntaxHighlighting(defaultHighlightStyle)),
    });
  }, [dark]);

  useEffect(() => {
    const current = view.current;
    if (!current) return;
    const diagnostics = [];
    if (failure) {
      const from = offsetOf(current.state, failure);
      const line = current.state.doc.lineAt(from);
      diagnostics.push({from, to: Math.max(from + 1, line.to), severity: 'error' as const, message: failure.message});
    }
    current.dispatch(setDiagnostics(current.state, diagnostics));
  }, [failure, value]);

  useImperativeHandle(ref, () => ({
    goTo: (target) => {
      const current = view.current;
      if (!current) return;
      const at = offsetOf(current.state, target);
      current.dispatch({selection: EditorSelection.cursor(at), scrollIntoView: true});
      current.focus();
    },
  }));

  return <div ref={host} style={{height: '100%', minHeight: 0, flex: 1, overflow: 'hidden'}} />;
}
