export class LLMNotAvailableError extends Error {
  constructor(model = '') {
    super(`Model ${model} is not available.`);
  }
}

export class PromptTemplateFormatError extends Error {
  constructor() {
    super(`Prompt template could not be formatted with provided chain values.`);
  }
}
