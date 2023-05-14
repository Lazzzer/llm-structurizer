import { ApiProperty } from '@nestjs/swagger';
import {} from 'class-validator';

export class JsonExtractResultDto {
  @ApiProperty({
    description: 'model used for data extraction',
  })
  model: string;

  @ApiProperty({
    description: 'if refine was used for multi-step extraction',
    default: false,
  })
  refine: boolean;

  @ApiProperty({
    description: 'structured data extracted from text as json',
  })
  output: string;
}
