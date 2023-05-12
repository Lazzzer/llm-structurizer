import { Module } from '@nestjs/common';
import { StructuringService } from './structuring.service';

@Module({})
export class StructuredDataModule {
  providers: [StructuringService];
}
