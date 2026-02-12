import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/api/v1/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('chat:send')
  async handleMessage(
    @MessageBody() data: { message: string; conversationId?: string; language?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { message, conversationId, language = 'auto' } = data;
    const messageId = `msg-${Date.now()}`;

    try {
      // Retrieve context from RAG
      const context = await this.chatService.retrieveContext(message);

      // Build prompt with language preference
      const prompt = this.chatService.buildPrompt(message, context, language);

      // Stream response
      const stream = this.chatService.generateStream(prompt);

      for await (const token of stream) {
        client.emit('chat:token', {
          token,
          conversationId: conversationId || 'default',
          messageId,
        });
      }

      // Send done event with sources
      client.emit('chat:done', {
        conversationId: conversationId || 'default',
        messageId,
        sources: context.map((c) => c.metadata),
      });
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      let errorMessage = 'An error occurred while processing your message.';
      
      if (error.message?.includes('fetch failed') || error.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to AI service. Please ensure Ollama is running at http://localhost:11434';
      } else if (error.message?.includes('ChromaDB') || error.message?.includes('8000')) {
        errorMessage = 'Cannot connect to vector database. Please ensure ChromaDB is running at http://localhost:8000';
      }
      
      client.emit('chat:error', {
        conversationId: conversationId || 'default',
        error: errorMessage,
      });
    }
  }

  @SubscribeMessage('chat:ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('chat:pong');
  }
}
