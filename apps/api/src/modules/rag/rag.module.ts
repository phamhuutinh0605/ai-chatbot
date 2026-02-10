import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { VectorModule } from '../vector/vector.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [VectorModule, EmbeddingModule],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
