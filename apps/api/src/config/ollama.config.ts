import { registerAs } from '@nestjs/config';

export default registerAs('ollama', () => ({
  baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  chatModel: process.env.OLLAMA_CHAT_MODEL || 'llama3.2:3b', // Smaller model (2GB vs 4.7GB)
  embedModel: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
}));
