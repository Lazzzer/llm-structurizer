import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { IsEnum, IsJSON, IsNotEmpty } from 'class-validator';

enum Model {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
}

class JsonExtractRequestDto {
  @ApiProperty({
    enum: Model,
    description: 'model available for data extraction',
  })
  @IsEnum(Model)
  model: Model;

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
