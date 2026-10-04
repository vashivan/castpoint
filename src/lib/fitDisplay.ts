/**
 * Font size for a giant display title so its longest word never overflows.
 * `maxWidth` is the column width the title may use on desktop.
 */
export function fitDisplaySize(text: string, maxWidth = 760, maxSize = 170) {
  const longest = Math.max(4, ...text.split(/\s+/).map((w) => w.length));
  const perChar = (0.95 * longest).toFixed(2);
  return `min(${maxSize}px, 11vw, calc(min(92vw, ${maxWidth}px) / ${perChar}))`;
}
