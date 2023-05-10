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

export class PdfMagicNumberError extends Error {
  constructor() {
    super('The file does not start with the PDF magic number: %PDF');
  }
}

export class PdfNotParsedError extends Error {
  constructor() {
    super('The PDF file could not be parsed');
  }
}
