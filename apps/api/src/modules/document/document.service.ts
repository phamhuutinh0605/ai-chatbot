import { Injectable } from '@nestjs/common';
import { ChromaService } from '../vector/chroma.service';
import { IndexDocumentDto } from './dto/document.dto';
import { RagService } from '../rag/rag.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { LogicalException } from '@/middlewares/exception/logical.exception';
import { ErrorCode } from '@/enums/error-code.enum';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentService {
  constructor(
    private readonly ragService: RagService,
    private readonly embeddingService: EmbeddingService,
    private readonly chromaService: ChromaService,
  ) {}

  async indexDocument(dto: IndexDocumentDto) {
    try {
      const { filename, content } = dto;

      // Chunk the document
      const chunks = this.ragService.chunkText(content, filename);

      // Generate embeddings for all chunks
      const embeddings = await this.embeddingService.generateEmbeddings(
        chunks.map((c) => c.content),
      );

      // Store in vector database
      await this.chromaService.addDocuments(chunks, embeddings);

      return {
        message: 'Document indexed successfully',
        filename,
        chunkCount: chunks.length,
      };
    } catch (error) {
      throw new LogicalException(
        ErrorCode.DOCUMENT_UPLOAD_FAILED,
        'Failed to index document',
        error.message,
      );
    }
  }

  async getDocumentCount() {
    const count = await this.chromaService.count();
    return { count };
  }

  async listDocuments() {
    try {
      const documentsPath = path.join(process.cwd(), 'documents');

      // Check if documents folder exists
      if (!fs.existsSync(documentsPath)) {
        return { documents: [] };
      }

      const files = fs.readdirSync(documentsPath);
      const documents = files
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return ['.md', '.txt', '.pdf', '.doc', '.docx'].includes(ext);
        })
        .map((file) => {
          const filePath = path.join(documentsPath, file);
          const stats = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase().slice(1);

          return {
            id: file.replace(/\.[^/.]+$/, ''),
            filename: file,
            type: ext === 'docx' ? 'doc' : ext,
            size: stats.size,
            uploadedAt: stats.mtimeMs,
            chunkCount: 0, // Will be calculated after indexing
            status: 'indexed',
          };
        });

      return { documents };
    } catch (error) {
      throw new LogicalException(
        ErrorCode.DOCUMENT_UPLOAD_FAILED,
        'Failed to list documents',
        error.message,
      );
    }
  }

  async uploadFiles(files: Express.Multer.File[]) {
    try {
      const results = [];

      for (const file of files) {
        // Read file content
        const content = fs.readFileSync(file.path, 'utf-8');

        // Index the document
        const result = await this.indexDocument({
          filename: file.filename,
          content,
        });

        results.push({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          ...result,
        });
      }

      return {
        message: `Successfully uploaded ${files.length} file(s)`,
        files: results,
      };
    } catch (error) {
      throw new LogicalException(
        ErrorCode.DOCUMENT_UPLOAD_FAILED,
        'Failed to upload files',
        error.message,
      );
    }
  }
}
