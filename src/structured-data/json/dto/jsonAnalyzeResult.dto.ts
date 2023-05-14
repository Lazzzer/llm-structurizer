import { ApiProperty } from '@nestjs/swagger';

export class JsonAnalyzeResultDto {
  @ApiProperty({
    description: 'model used for analysis',
  })
  model: string;

  @ApiProperty({
    description: 'analysis of the generated json',
  })
  analysis: string;
}
