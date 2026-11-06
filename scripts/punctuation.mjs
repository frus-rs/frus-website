// The site's text carries no em dashes. The pages come from frus's documentation and doc
// comments, which use them freely, so every script that writes a page passes its text through
// `dropEmDashes`, and `npm run check:dashes` fails the build on any that is left.

const DASH = '—';

// Words after which a dash reads as a comma: "it grows to fit — and never shrinks".
const joining = /^(and|but|or|nor|so|yet|which|who|whose|not|then|though|although|because|while|where|when|whether|unless|until|as|if|than|only|even|just|plus)\b/i;

/** `text` with every em dash replaced by the punctuation that reads the same. */
export function dropEmDashes(text) {
  if (!text.includes(DASH)) return text;
  // A Windows checkout's line ends are put back after.
  if (text.includes('\r\n')) return dropEmDashes(text.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
  let out = text
    // An empty table cell.
    .replace(/(\|[ \t]*)—([ \t]*)(?=\|)/g, '$1$2')
    // A term and what it is, at the start of a list item: "- **term** — what it is".
    .replace(
      /^([ \t]*(?:[-*+]|\d+\.)[ \t]+(?:\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\n]+\)))[ \t]+—[ \t]+/gm,
      '$1: ',
    )
    // An aside between two dashes, inside one sentence: parentheses.
    // It may run over lines and hold a file name's dot, but not end a sentence.
    .replace(
      /[ \t]+—(?:[ \t]+|[ \t]*\n[ \t]*)((?:[^—.!?;|\n]|\.(?=[^\s.])|\n(?![ \t]*\n))+?)[ \t]+—([ \t]+|(?=\n))/g,
      (_, aside, after) => ` (${aside})${after ? ' ' : ''}`,
    );
  // What is left: one dash, a colon or a comma.
  out = out.replace(/([ \t]*)—([ \t]*\n?[ \t]*)(\S*)/g, (whole, before, after, next, offset, all) => {
    const nl = after.includes('\n') ? '\n' : ' ';
    if (next === '' && before === '') return `,${nl}`;
    // The sentence so far, back to the last full stop, table cell or line, without its code.
    const start = Math.max(
      all.lastIndexOf('. ', offset),
      all.lastIndexOf('|', offset),
      all.lastIndexOf('\n', offset - 1),
      0,
    );
    const sentence = all.slice(start, offset).replace(/`[^`]*`/g, '');
    const mark = joining.test(next) || sentence.includes(':') ? ',' : ':';
    return `${mark}${nl}${next}`;
  });
  return out.replace(/,([ \n])(\)|,)/g, '$1$2');
}
