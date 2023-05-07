import { ApiProperty } from '@nestjs/swagger';

export class PdfParserResultDto {
  @ApiProperty()
  originalFileName: string;

  @ApiProperty()
  content: string;
}
