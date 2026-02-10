import {
  Body,
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { DocumentService } from './document.service';
import { IndexDocumentDto } from './dto/document.dto';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'List all documents' })
  async listDocuments() {
    return this.documentService.listDocuments();
  }

  @Post('index')
  @ApiOperation({ summary: 'Index a document for RAG' })
  async indexDocument(@Body() dto: IndexDocumentDto) {
    return this.documentService.indexDocument(dto);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get indexed documents count' })
  async getCount() {
    return this.documentService.getDocumentCount();
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload multiple documents' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const name = file.originalname.replace(ext, '');
          cb(null, `${name}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.md', '.txt', '.pdf', '.doc', '.docx'];
        const ext = extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(ext)) {
          return cb(
            new BadRequestException(
              `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
            ),
            false,
          );
        }

        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.documentService.uploadFiles(files);
  }
}
