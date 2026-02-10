import { registerAs } from '@nestjs/config';

export default registerAs('chroma', () => ({
  host: process.env.CHROMA_URL || 'http://localhost:8000',
  collectionName: process.env.CHROMA_COLLECTION || 'shinhan-knowledge-base',
}));
