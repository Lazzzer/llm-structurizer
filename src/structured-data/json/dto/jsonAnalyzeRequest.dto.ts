import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsObject } from 'class-validator';

export class JsonAnalyzeRequestDto {
  @ApiProperty({
    description: 'model to use for analysis of the generated json',
    type: 'object',
    properties: {
      apiKey: {
        type: 'string',
        description: 'api key of the model',
        nullable: true,
      },
      name: {
        type: 'string',
        description: 'name of the model',
        default: 'gpt-4',
      },
    },
  })
  @IsObject()
  model: {
    apiKey?: string;
    name: string;
  };

  @ApiProperty({
    description: 'original text from which the json was generated',
  })
  @IsNotEmpty()
  originalText: string;

  @ApiProperty({
    description: 'json output from the data extraction',
  })
  @IsJSON()
  jsonOutput: string;

  @ApiProperty({
    description: 'json schema used as model for data extraction',
  })
  @IsJSON()
  jsonSchema: string;
}
