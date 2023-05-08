import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class PdfParserRequestDto {
  @ApiProperty()
  @IsUrl()
  url: string;
}
