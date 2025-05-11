import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { Message, InsertMessage } from '@shared/schema';

interface AuthenticatedClient extends WebSocket {
  userId?: number;
  isAlive: boolean;
}

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  // Map to store active connections by user ID
  const clients = new Map<number, AuthenticatedClient>();
  
  // Handle connection
  wss.on('connection', (ws: AuthenticatedClient) => {
    console.log('WebSocket connection established');
    ws.isAlive = true;
    
    // Handle ping/pong to detect disconnected clients
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    // Handle messages
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication
        if (data.type === 'auth') {
          if (data.userId) {
            ws.userId = data.userId;
            clients.set(data.userId, ws);
            console.log(`User ${data.userId} authenticated`);
          }
          return;
        }
        
        // All other message types require authentication
        if (!ws.userId) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Authentication required'
          }));
          return;
        }
        
        // Handle chat messages
        if (data.type === 'message') {
          const { conversationId, receiverId, content } = data;
          
          if (!conversationId || !receiverId || !content) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid message data'
            }));
            return;
          }
          
          // Save message to database
          const messageData: InsertMessage = {
            conversationId,
            senderId: ws.userId,
            receiverId,
            content,
            status: 'sent'
          };
          
          const newMessage = await storage.createMessage(messageData);
          
          // Send to recipient if they're online
          const recipientWs = clients.get(receiverId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'message',
              message: newMessage
            }));
            
            // Update message status to delivered
            await storage.updateMessageStatus(newMessage.id, 'delivered');
          }
          
          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            messageId: newMessage.id
          }));
        }
        
        // Handle read receipts
        if (data.type === 'read_receipt') {
          const { messageId } = data;
          
          if (!messageId) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid read receipt data'
            }));
            return;
          }
          
          // Update message status
          const message = await storage.getMessage(messageId);
          if (message && message.receiverId === ws.userId) {
            await storage.updateMessageStatus(messageId, 'read');
            
            // Notify sender if they're online
            const senderWs = clients.get(message.senderId);
            if (senderWs && senderWs.readyState === WebSocket.OPEN) {
              senderWs.send(JSON.stringify({
                type: 'read_receipt',
                messageId
              }));
            }
          }
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`User ${ws.userId} disconnected`);
      }
    });
  });
  
  // Ping all clients periodically to check for disconnections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedClient) => {
      if (!ws.isAlive) {
        if (ws.userId) {
          clients.delete(ws.userId);
        }
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  return wss;
}
