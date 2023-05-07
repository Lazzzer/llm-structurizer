import { Test, TestingModule } from '@nestjs/testing';
import { PdfParserService } from './pdf-parser.service';

describe('PdfParserService', () => {
  let service: PdfParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfParserService],
    }).compile();

    service = module.get<PdfParserService>(PdfParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('parsePdf', () => {
  //   it('should return the text of the given PDF file', async () => {
  //     const input = Buffer.from('test');
  //     const expected = 'test';
  //     const actual = await service.parsePdf(input);
  //     expect(actual).toEqual(expected);
  //   });
  // });

  describe('postProcessText', () => {
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
