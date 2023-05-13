import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsJSON } from 'class-validator';

enum Model {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
}

export class JsonExtractRequestDto {
  @ApiProperty({
    description: 'text to extract structured data from',
  })
  text: string;

  @ApiProperty({
    enum: Model,
    description: 'model available for data extraction',
  })
  @IsEnum(Model)
  model: Model;

  @ApiProperty({
    description: 'json schema to use as model for data extraction',
  })
  @IsJSON()
  jsonSchema: string;

  @ApiPropertyOptional({
    description: 'whether to use refine multi-step extraction',
    default: false,
  })
  refine?: boolean;
}
