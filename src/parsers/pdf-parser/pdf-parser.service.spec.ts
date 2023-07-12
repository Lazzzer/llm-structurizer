import { Test, TestingModule } from '@nestjs/testing';
import { PdfParserService } from './pdf-parser.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PdfNotParsedError } from './exceptions/exceptions';
import { ISOLogger } from '@/logger/isoLogger.service';

describe('PdfParserService', () => {
  let service: PdfParserService;
  let logger: ISOLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfParserService,
        {
          provide: ISOLogger,
          useValue: {
            debug: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
      imports: [ConfigModule.forRoot(), HttpModule],
    }).compile();

    service = module.get<PdfParserService>(PdfParserService);
    logger = await module.resolve<ISOLogger>(ISOLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parsePdf()', () => {
    it('should return the text of the given PDF file', async () => {
      const url =
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const buffer = await service.loadPdfFromUrl(url);

      const actual = await service.parsePdf(buffer);

      expect(actual).toBeDefined();
    });

    it('should throw an error if the pdf is scanned', async () => {
      const url =
        'https://pub-e0c49d057f644ddd8865f82361396859.r2.dev/test_scanned.pdf';
      const buffer = await service.loadPdfFromUrl(url);
      await expect(service.parsePdf(buffer)).rejects.toThrowError(
        PdfNotParsedError,
      );
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('loadPdfFromUrl()', () => {
    it('should load the pdf from the url and parse it', async () => {
      const url =
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const buffer = await service.loadPdfFromUrl(url);

      const expected = 'Dummy PDF file';
      const actual = await service.parsePdf(buffer);

      expect(actual).toEqual(expected);
    });
  });

  describe('postProcessText()', () => {
    it('should trim the lines and remove excess inner whitespace to keep a maximum of 3', () => {
      const input = '       a            b             c d         ';
      const expected = 'a   b   c d';
      const actual = service['postProcessText'](input);
      expect(actual).toEqual(expected);
    });

    it('should keep only one empty line if multiple lines are empty', () => {
      const input = 'a\n\n\nb\n\n\n\nc\nd';
      const expected = 'a\n\nb\n\nc\nd';
      const actual = service['postProcessText'](input);
      expect(actual).toEqual(expected);
    });
  });
});
