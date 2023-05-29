import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Poppler } from 'node-poppler';
import {
  PdfExtensionError,
  PdfNotParsedError,
  PdfSizeError,
} from './exceptions/exceptions';
import { ISOLogger } from '../../logger/isoLogger.service';

@Injectable()
export class PdfParserService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private logger: ISOLogger,
  ) {
    this.logger.setContext(PdfParserService.name);
  }

  async parsePdf(file: Buffer) {
    const poppler = new Poppler(this.configService.get('POPPLER_BIN_PATH'));
    const output = await poppler.pdfToText(file, null, {
      maintainLayout: true,
      quiet: true,
    });

    if (output instanceof Error || output.length === 0) {
      this.logger.warn('PDF not parsed');
      throw new PdfNotParsedError();
    }

    this.logger.debug('PDF parsed successfully');
    return this.postProcessText(output);
  }

  async loadPdfFromUrl(url: string) {
    const extension = url.split('.').pop();
    if (extension !== 'pdf') {
      this.logger.warn('PDF extension not valid');
      throw new PdfExtensionError();
    }

    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    if (response.headers['content-length'] > 5 * 1024 * 1024) {
      this.logger.warn('PDF size over 5MB');
      throw new PdfSizeError();
    }

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
}
