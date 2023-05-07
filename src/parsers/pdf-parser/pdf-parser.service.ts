import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Poppler } from 'node-poppler';

@Injectable()
export class PdfParserService {
  constructor(private configService: ConfigService) {}
  async parsePdf(file: Buffer) {
    const poppler = new Poppler(this.configService.get('POPPLER_BIN_PATH'));
    let text = await poppler.pdfToText(file, null, {
      maintainLayout: true,
      quiet: true,
    });

    if (typeof text === 'string') {
      text = this.postProcessText(text);
    }

    return text;
  }

  private postProcessText(text: string) {
    // trim each line
    const lines = text.split('\n').map((line) => line.trim());

    // keep only one line if multiple lines are empty
    const lines2 = lines.filter((line, index) => {
      if (line === '') {
        return lines[index - 1] !== '';
      }
      return true;
    });

    // remove whitespace in lines if there are more than 3 spaces
    const lines3 = lines2.map((line) => {
      return line.replace(/\s{3,}/g, '   ');
    });

    const postProcessedText = lines3.join('\n');
    return postProcessedText;
  }
}
