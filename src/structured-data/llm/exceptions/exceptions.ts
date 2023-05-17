export class LLMNotAvailableError extends Error {
  constructor(model = '') {
    super(`Model ${model} is not available.`);
  }
}

export class LLMApiKeyMissingError extends Error {
  constructor(model = '') {
    super(`API key for model ${model} is missing.`);
  }
}

export class LLMApiKeyInvalidError extends Error {
  constructor(model = '') {
    super(`API key for model ${model} is invalid.`);
  }
}

export class PromptTemplateFormatError extends Error {
  constructor() {
    super(`Prompt template could not be formatted with provided chain values.`);
  }
}

export class RefinePromptsInputVariablesError extends Error {
  constructor(promptTemplate: string, missingInputVariables: string) {
    super(
      `${promptTemplate} is missing mandatory input variable: ${missingInputVariables}.`,
    );
  }
}

export class RefineReservedChainValuesError extends Error {
  constructor(value: string) {
    super(`Reserved chain value ${value} cannot be used as an input variable.`);
  }
}
