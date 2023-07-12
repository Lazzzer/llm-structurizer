import { DebugReport } from '@/structured-data/llm/dto/debug.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class JsonGenericOutputResultDto {
  @ApiProperty({
    description: 'model used for generic prompt completion',
  })
  model: string;

  @ApiProperty({
    description: 'generic output as string',
  })
  @IsString()
  output: string;

  @ApiPropertyOptional({
    description: 'debug report of the generic prompt completion',
  })
  @IsObject()
  @IsOptional()
  debug?: DebugReport;
}
