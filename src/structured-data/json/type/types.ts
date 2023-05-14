export type Analysis = {
  corrections: Correction[];
};

export type Correction = {
  field: string;
  issue: string;
  description: string;
  suggestion: string;
};
