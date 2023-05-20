import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional } from 'class-validator';
import { DebugReport } from 'src/structured-data/llm/types/types';

export class Analysis {
  @ApiProperty({
    description: 'list of corrections',
  })
  @IsArray()
  corrections: Correction[];
}

export class Correction {
  @ApiProperty({
    description: 'field that needs to be corrected',
  })
  field: string;
  @ApiProperty({
    description: 'issue found in the field',
  })
  issue: string;
  @ApiProperty({
    description: 'description of the issue, reasons for why it is an issue',
  })
  description: string;
  @ApiProperty({
    description: 'suggestion for how to correct the issue',
  })
  suggestion: string;
}

export class JsonAnalyzeResultDto {
  @ApiProperty({
    description: 'model used for analysis',
  })
  model: string;

  @ApiProperty({
    description: 'analysis of the generated json',
  })
  @IsObject()
  analysis: Analysis;

  @ApiPropertyOptional({
    description: 'debug report of the extraction',
  })
  @IsObject()
  @IsOptional()
  debug?: DebugReport;
}
