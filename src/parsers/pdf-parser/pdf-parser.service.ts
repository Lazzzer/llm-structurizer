import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Poppler } from 'node-poppler';

@Injectable()
export class PdfParserService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

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

  async loadPdfFromUrl(url: string) {
    const extension = url.split('.').pop();
    if (extension !== 'pdf') {
      throw new BadRequestException('The file extension is not .pdf');
    }

    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    this.checkResponse(response);

    return Buffer.from(response.data, 'binary');
  }

  private postProcessText(text: string) {
    const processedText = text
      .split('\n')
      // trim each line
      .map((line) => line.trim())
      // keep only one line if multiple lines are empty
      .filter((line, index, arr) => line !== '' || arr[index - 1] !== '')
      // remove whitespace in lines if there are more than 3 spaces
      .map((line) => line.replace(/\s{3,}/g, '   '))
      .join('\n');

    return processedText;
  }

  private checkResponse(response: AxiosResponse) {
    if (response.headers['content-length'] > 5 * 1024 * 1024) {
      throw new BadRequestException('The PDF file is larger than 5 MB.');
    }

    if (!this.isPdfBuffer(response.data)) {
      throw new BadRequestException('The file is not a valid PDF.');
    }
  }

  private isPdfBuffer(buffer: Buffer) {
    const pdfMagicNumber = Buffer.from([0x25, 0x50, 0x44, 0x46]); // '%PDF' in hexadecimal
    const bufferStart = buffer.subarray(0, 4);

    return bufferStart.equals(pdfMagicNumber);
  }
}
