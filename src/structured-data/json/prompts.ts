import { PromptTemplate } from 'langchain/prompts';

// ##### String Templates #####

const jsonZeroShotSchemaExtractionTemplate = `
You are a highly efficient text processing application.
Your main objective is to accurately parse the user's input text and transform it into a JSON object that complies with the schema provided below.
---------------------
JSON schema:
{jsonSchema}
---------------------
Please generate the output JSON object containing the necessary information and ensure it follows the given schema. 
If the input text contains any attributes not mentioned in the schema, please disregard them.
---------------------
Input:
{context}
---------------------
Output:
`;

const jsonZeroShotSchemaExtractionRefineTemplate = `
You are a highly efficient text processing application.
Your main objective is to accurately parse the user's input text and transform it into a JSON object that complies with the schema provided below.
---------------------
JSON schema:
{jsonSchema}
---------------------
You have provided an existing output: 
{existing_answer}

We have the opportunity to refine the existing output (only if needed) with some more context below.
---------------------
Context:
{context}
---------------------
Given the new context, refine the original output to give a better answer. 
If the context isn't useful, return the existing output.

Please generate the output JSON object containing the necessary information and ensure it follows the given schema. 
If the input text contains any attributes not mentioned in the schema, please disregard them. 
Do not add any fields that are not in the schema.
All output must be in JSON format and follow the schema specified above.
`;

const jsonOneShotExtractionTemplate = `
You are a highly efficient text processing application.
Your main objective is to accurately parse the user's input text and transform it into a JSON object that matches the example output provided below.
A full example of a possible input and desired output is provided below.
---------------------
Example Input:
{exampleInput}

Example Output:
{exampleOutput}
---------------------
Please generate the output JSON object containing the necessary information and ensure it follows the same structure as the example. 
If the input text contains any attributes not mentioned in the example, please disregard them.
---------------------
Input:
{context}
---------------------
Output:
`;

const jsonAnalysisTemplate = `
You are a highly efficient text processing application.

Given the original unstructured text, the JSON schema, and the generated JSON output, analyze and identify any discrepancies, errors, or inconsistencies. 
Specifically, pinpoint the parts in the original text that may have led to incorrect output in the generated JSON. 
Please provide a list of fields in the generated JSON that need to be corrected, and the corresponding suggestions for corrections.
If you think the generated JSON is correct, please do not provide any suggestions.
---------------------
JSON schema:
{jsonSchema}
---------------------
Original text:
{originalText}
---------------------
Generated JSON output:
{jsonOutput}
---------------------

Please output your analysis in the following json format:

{outputFormat}

Your analysis:
`;

// ##### Prompt Templates #####

export const jsonZeroShotSchemaExtraction = new PromptTemplate({
  inputVariables: ['context', 'jsonSchema'],
  template: jsonZeroShotSchemaExtractionTemplate,
});

export const jsonZeroShotSchemaExtractionRefine = new PromptTemplate({
  inputVariables: ['jsonSchema', 'context', 'existing_answer'],
  template: jsonZeroShotSchemaExtractionRefineTemplate,
});

export const jsonOneShotExtraction = new PromptTemplate({
  inputVariables: ['exampleInput', 'exampleOutput', 'context'],
  template: jsonOneShotExtractionTemplate,
});

export const jsonAnalysis = new PromptTemplate({
  inputVariables: ['jsonSchema', 'originalText', 'jsonOutput', 'outputFormat'],
  template: jsonAnalysisTemplate,
});
