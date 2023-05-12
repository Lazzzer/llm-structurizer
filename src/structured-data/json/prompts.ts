import { PromptTemplate } from 'langchain';

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
{inputStr}
---------------------
Output:
`;

export const jsonZeroShotSchemaExtraction = new PromptTemplate({
  inputVariables: ['inputStr', 'jsonSchema'],
  template: jsonZeroShotSchemaExtractionTemplate,
});
