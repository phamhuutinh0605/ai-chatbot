import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class IndexDocumentDto {
  @ApiProperty({ example: 'product-guide.md' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: '# Product Guide\n\nThis is a guide...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
