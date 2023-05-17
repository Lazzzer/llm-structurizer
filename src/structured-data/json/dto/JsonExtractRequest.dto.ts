import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsObject } from 'class-validator';

class JsonExtractRequestDto {
  @ApiProperty({
    description: 'model to use for data extraction',
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
    description: 'text to extract structured data from',
  })
  @IsNotEmpty()
  text: string;
}

class SchemaRequestDto {
  @ApiPropertyOptional({
    description: 'whether to use refine multi-step extraction',
    default: false,
  })
  refine?: boolean;

  @ApiProperty({
    description: 'json schema to use as model for data extraction',
  })
  @IsJSON()
  jsonSchema: string;
}

class ExampleRequestDto {
  @ApiProperty({
    description: 'example input text',
  })
  @IsNotEmpty()
  exampleInput: string;

  @ApiProperty({
    description: 'example output json',
  })
  @IsJSON()
  exampleOutput: string;
}

export class JsonExtractSchemaRequestDto extends IntersectionType(
  JsonExtractRequestDto,
  SchemaRequestDto,
) {}

export class JsonExtractExampleRequestDto extends IntersectionType(
  JsonExtractRequestDto,
  ExampleRequestDto,
) {}
