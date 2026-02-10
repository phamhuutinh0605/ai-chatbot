import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { RagModule } from '../rag/rag.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [RagModule, EmbeddingModule, VectorModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
