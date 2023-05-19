import { ApiProperty } from '@nestjs/swagger';
import {
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RefineRecap } from '../types/types';

@ValidatorConstraint({ name: 'boolean-or-refineParams', async: false })
class IsBooleanOrRefineRecap implements ValidatorConstraintInterface {
  validate(text: any) {
    if (typeof text === 'boolean') {
      return true;
    }
    if (typeof text === 'object') {
      return (
        typeof text.chunkSize === 'number' &&
        typeof text.overlap === 'number' &&
        typeof text.callCount === 'number' &&
        text.callCount >= 0
      );
    }
  }
}

export class JsonExtractResultDto {
  @ApiProperty({
    description: 'model used for data extraction',
  })
  model: string;

  @ApiProperty({
    oneOf: [
      {
        type: 'boolean',
        description: 'refine technique is not used',
        default: false,
      },
      {
        type: 'object',
        description: 'refine recap',
        properties: {
          chunkSize: {
            type: 'number',
            description: 'size of the chunks',
            default: 2000,
          },
          overlap: {
            type: 'number',
            description: 'overlap between chunks',
            default: 100,
          },
          llmCallCount: {
            type: 'number',
            description: 'number of calls to the model',
          },
        },
      },
    ],
  })
  @Validate(IsBooleanOrRefineRecap)
  refine: false | RefineRecap;

  @ApiProperty({
    description: 'structured data extracted from text as json',
  })
  output: string;
}
