import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RagModule } from '../rag/rag.module';
import { OllamaClient } from '@/shared/ollama/ollama.client';

@Module({
  imports: [RagModule],
  providers: [ChatGateway, ChatService, OllamaClient],
})
export class ChatModule {}
