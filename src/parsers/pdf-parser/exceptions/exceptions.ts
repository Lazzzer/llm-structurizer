export class PdfExtensionError extends Error {
  constructor() {
    super('The file extension is not .pdf');
  }
}

export class PdfSizeError extends Error {
  constructor() {
    super('The PDF file is larger than 5 MB');
  }
}

export class PdfNotParsedError extends Error {
  constructor() {
    super(
      'The PDF file could not be parsed. It may not contain plain text or information in text format.',
    );
  }
}
