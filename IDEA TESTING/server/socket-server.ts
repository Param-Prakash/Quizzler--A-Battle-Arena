import { Server } from 'socket.io';
import { createServer } from 'http';
import { BattleManager } from './managers/battleManager';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const battleManager = new BattleManager(io);

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Authentication
  socket.on('authenticate', (data: { userId: string; username: string }) => {
    socket.data.userId = data.userId;
    socket.data.username = data.username;
    console.log(`🔐 User authenticated: ${data.username} (${data.userId})`);
  });

  // Create a custom room
  socket.on('create-room', async (data: { topic: string; difficulty: string; questionCount: number }) => {
    try {
      const battle = await battleManager.createBattle(socket, data);
      socket.emit('room-created', battle);
    } catch (error) {
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Join a room
  socket.on('join-room', async (data: { roomCode: string }) => {
    try {
      const result = await battleManager.joinBattle(socket, data.roomCode);
      if (result.success) {
        // Notify both players
        io.to(data.roomCode).emit('player-joined', result.battle);
        
        // If room is full, start battle
        if (result.battle.participants.length === 2) {
          setTimeout(() => {
            battleManager.startBattle(data.roomCode);
          }, 3000); // 3 second countdown
        }
      } else {
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave room
  socket.on('leave-room', async (data: { roomCode: string }) => {
    try {
      await battleManager.leaveBattle(socket, data.roomCode);
      socket.leave(data.roomCode);
      io.to(data.roomCode).emit('player-left', { userId: socket.data.userId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to leave room' });
    }
  });

  // Submit answer
  socket.on('submit-answer', async (data: { 
    roomCode: string; 
    questionIndex: number; 
    answer: number; 
    responseTime: number;
  }) => {
    try {
      const result = await battleManager.submitAnswer(socket, data);
      
      // Send result to the player
      socket.emit('answer-result', {
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        points: result.points,
      });

      // Update scores for both players
      io.to(data.roomCode).emit('score-update', result.scores);

      // Check if both players answered
      if (result.bothAnswered) {
        // Move to next question after delay
        setTimeout(() => {
          battleManager.nextQuestion(data.roomCode);
        }, 2000);
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to submit answer' });
    }
  });

  // Battle ended
  socket.on('battle-ended', async (data: { roomCode: string }) => {
    try {
      const results = await battleManager.endBattle(data.roomCode);
      io.to(data.roomCode).emit('battle-results', results);
    } catch (error) {
      socket.emit('error', { message: 'Failed to end battle' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    battleManager.handleDisconnect(socket);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});
