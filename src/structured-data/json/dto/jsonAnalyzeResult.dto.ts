import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';
import { DebugReport } from '../../llm/dto/debug.dto';

export class Analysis {
  @ApiProperty({
    description: 'list of corrections',
  })
  @IsArray()
  corrections: Correction[];

  @ApiProperty({
    description: 'full textual analysis of the issues',
  })
  @IsString()
  textAnalysis: string;
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
    description: 'debug report of the analysis',
  })
  @IsObject()
  @IsOptional()
  debug?: DebugReport;
}
