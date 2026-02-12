import { Injectable } from '@nestjs/common';
import { ChromaService } from '../vector/chroma.service';
import { IndexDocumentDto } from './dto/document.dto';
import { RagService } from '../rag/rag.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { LogicalException } from '@/middlewares/exception/logical.exception';
import { ErrorCode } from '@/enums/error-code.enum';
import * as fs from 'fs';
import * as path from 'path';

interface ParsedDocument {
  filename: string;
  originalName: string;
  content: string;
  metadata: {
    fileType: string;
    fileSize: number;
    parsedAt: number;
    pageCount?: number;
  };
}

@Injectable()
export class DocumentService {
  private readonly UPLOADS_DIR = path.join(process.cwd(), 'documents', 'uploads');
  private readonly RAW_DIR = path.join(this.UPLOADS_DIR, 'raw');
  private readonly PARSED_DIR = path.join(this.UPLOADS_DIR, 'parsed');

  constructor(
    private readonly ragService: RagService,
    private readonly embeddingService: EmbeddingService,
    private readonly chromaService: ChromaService,
  ) {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [this.UPLOADS_DIR, this.RAW_DIR, this.PARSED_DIR].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

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
      const documents = [];

      // List raw files
      if (fs.existsSync(this.RAW_DIR)) {
        const rawFiles = fs.readdirSync(this.RAW_DIR);

        for (const file of rawFiles) {
          const ext = path.extname(file).toLowerCase();
          if (!['.md', '.txt', '.pdf', '.doc', '.docx'].includes(ext)) continue;

          const rawPath = path.join(this.RAW_DIR, file);
          const stats = fs.statSync(rawPath);
          const baseName = file.replace(/\.[^/.]+$/, '');
          const parsedPath = path.join(this.PARSED_DIR, `${baseName}.json`);

          documents.push({
            id: baseName,
            filename: file,
            type: ext.slice(1),
            size: stats.size,
            uploadedAt: stats.mtimeMs,
            status: fs.existsSync(parsedPath) ? 'indexed' : 'pending',
            chunkCount: 0,
          });
        }
      }

      return { documents };
    } catch (error) {
      throw new LogicalException(
        ErrorCode.DOCUMENT_UPLOAD_FAILED,
        'Failed to list documents',
        error.message,
      );
    }
  }

  private async parseDocument(filePath: string, fileType: string): Promise<string> {
    if (fileType === '.pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } else {
      // Text-based files (md, txt)
      return fs.readFileSync(filePath, 'utf-8');
    }
  }

  private async saveParsedDocument(parsed: ParsedDocument): Promise<void> {
    const parsedPath = path.join(
      this.PARSED_DIR,
      `${parsed.filename.replace(/\.[^/.]+$/, '')}.json`,
    );
    fs.writeFileSync(parsedPath, JSON.stringify(parsed, null, 2), 'utf-8');
  }

  async uploadFiles(files: Express.Multer.File[]) {
    try {
      const results = [];

      for (const file of files) {
        const ext = path.extname(file.filename).toLowerCase();

        // 1. Parse document
        const content = await this.parseDocument(file.path, ext);

        if (!content || content.trim().length === 0) {
          console.warn(`No content extracted from ${file.filename}`);
          continue;
        }

        // 2. Save parsed JSON
        const parsed: ParsedDocument = {
          filename: file.filename,
          originalName: file.originalname,
          content,
          metadata: {
            fileType: ext,
            fileSize: file.size,
            parsedAt: Date.now(),
          },
        };

        await this.saveParsedDocument(parsed);

        // 3. Index the document
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
        message: `Successfully uploaded and indexed ${results.length} file(s)`,
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
