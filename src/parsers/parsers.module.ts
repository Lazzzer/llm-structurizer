import { Module } from '@nestjs/common';
import { PdfParserService } from './pdf-parser/pdf-parser.service';
import { ParsersController } from './parsers.controller';
import { PdfParserController } from './pdf-parser/pdf-parser.controller';

@Module({
  imports: [],
  controllers: [ParsersController, PdfParserController],
  providers: [PdfParserService],
})
export class ParsersModule {}