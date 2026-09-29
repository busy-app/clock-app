export type Font = "bold" | "small" | "superscript";

export const ASCENT: Record<Font, number> = { bold: 9, small: 7, superscript: 9 };

export const CAP_TOP = 2;

function advances(groups: Record<number, string>) {
  const map: Record<string, number> = {};

  for (const [advance, glyphs] of Object.entries(groups)) {
    for (const ch of glyphs) map[ch] = Number(advance);
  }

  return map;
}

const ADVANCES: Record<Font, Record<string, number>> = {
  bold: advances({ 2: ":", 7: "0123456789" }),
  small: advances({
    2: " ,.il",
    3: "-/1rt",
    4: "023456789JTabcdeghnopuvy",
    5: "ADFNOPS",
    6: "MW",
  }),
  superscript: advances({ 4: "0123456789" }),
};

export function textWidth(text: string, font: Font) {
  let width = 0;

  for (const ch of text) {
    const advance = ADVANCES[font][ch];
    if (advance === undefined) {
      throw new Error(`no metrics for "${ch}" in font ${font}`);
    }

    width += advance;
  }

  return width;
}
