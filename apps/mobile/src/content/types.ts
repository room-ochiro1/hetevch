/** A legal page (terms, privacy) as data, rendered by `LegalDocument`. */
export type LegalSection = {
  heading: string;
  /** Shown first. */
  paragraphs?: readonly string[];
  bullets?: readonly string[];
  /** A closing sentence after the bullets. */
  note?: string;
};

export type LegalDoc = {
  /** `YYYY-MM-DD` of the last change; shown at the top. Bump it with every edit. */
  updated: string;
  intro: string;
  sections: readonly LegalSection[];
};

export type FaqEntry = { question: string; answer: string };
