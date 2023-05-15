import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsJSON, IsNotEmpty } from 'class-validator';

export enum AnalysisModel {
  GPT_4 = 'gpt-4',
}

export class JsonAnalyzeRequestDto {
  @ApiProperty({
    enum: AnalysisModel,
    description: 'model available for analysis of the generated json',
  })
  @IsEnum(AnalysisModel)
  model: AnalysisModel;

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
