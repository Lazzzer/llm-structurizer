import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsJSON, IsNotEmpty } from 'class-validator';

enum Model {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
}

export class JsonExtractRequestDto {
  @ApiProperty({
    enum: Model,
    description: 'model available for data extraction',
  })
  @IsEnum(Model)
  model: Model;

  @ApiPropertyOptional({
    description: 'whether to use refine multi-step extraction',
    default: false,
  })
  refine?: boolean;

  @ApiProperty({
    description: 'text to extract structured data from',
  })
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'json schema to use as model for data extraction',
  })
  @IsJSON()
  jsonSchema: string;
}
