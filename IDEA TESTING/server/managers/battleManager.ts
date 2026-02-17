import { Server, Socket } from 'socket.io';
import { PrismaClient, Difficulty, BattleStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface BattleRoom {
  battleId: string;
  roomCode: string;
  players: Map<string, PlayerData>;
  questions: any[];
  currentQuestionIndex: number;
  answers: Map<string, Map<number, AnswerData>>; // userId -> questionIndex -> answer
  status: BattleStatus;
}

interface PlayerData {
  userId: string;
  username: string;
  socketId: string;
  score: number;
  correctAnswers: number;
}

interface AnswerData {
  answer: number;
  isCorrect: boolean;
  responseTime: number;
}

export class BattleManager {
  private io: Server;
  private activeBattles: Map<string, BattleRoom>;

  constructor(io: Server) {
    this.io = io;
    this.activeBattles = new Map();
  }

  async createBattle(
    socket: Socket,
    data: { topic: string; difficulty: string; questionCount: number }
  ) {
    const userId = socket.data.userId;
    const username = socket.data.username;

    if (!userId || !username) {
      throw new Error('User not authenticated');
    }

    // Generate unique room code
    const roomCode = this.generateRoomCode();

    // Get random questions
    const questions = await prisma.question.findMany({
      where: {
        topic: data.topic,
        difficulty: data.difficulty as Difficulty,
      },
      take: data.questionCount,
    });

    if (questions.length < data.questionCount) {
      throw new Error('Not enough questions available for this topic/difficulty');
    }

    // Create battle in database
    const battle = await prisma.battle.create({
      data: {
        roomCode,
        topic: data.topic,
        difficulty: data.difficulty as Difficulty,
        questionCount: data.questionCount,
        status: BattleStatus.WAITING,
        participants: {
          create: {
            userId: userId,
          },
        },
        questions: {
          create: questions.map((q, index) => ({
            questionId: q.id,
            orderIndex: index,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                level: true,
                avatar: true,
              },
            },
          },
        },
        questions: {
          include: {
            question: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    // Create room in memory
    const battleRoom: BattleRoom = {
      battleId: battle.id,
      roomCode,
      players: new Map([
        [
          userId,
          {
            userId,
            username,
            socketId: socket.id,
            score: 0,
            correctAnswers: 0,
          },
        ],
      ]),
      questions: battle.questions.map((bq) => bq.question),
      currentQuestionIndex: 0,
      answers: new Map([[userId, new Map()]]),
      status: BattleStatus.WAITING,
    };

    this.activeBattles.set(roomCode, battleRoom);
    socket.join(roomCode);

    console.log(`🎮 Battle room created: ${roomCode}`);

    return {
      roomCode,
      battle,
      isCreator: true,
    };
  }

  async joinBattle(socket: Socket, roomCode: string) {
    const userId = socket.data.userId;
    const username = socket.data.username;

    if (!userId || !username) {
      return { success: false, message: 'User not authenticated' };
    }

    const room = this.activeBattles.get(roomCode);

    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (room.players.size >= 2) {
      return { success: false, message: 'Room is full' };
    }

    if (room.status !== BattleStatus.WAITING) {
      return { success: false, message: 'Battle already started' };
    }

    // Add player to database
    await prisma.battleParticipant.create({
      data: {
        battleId: room.battleId,
        userId: userId,
      },
    });

    // Update battle status
    await prisma.battle.update({
      where: { id: room.battleId },
      data: { status: BattleStatus.READY },
    });

    // Add player to room
    room.players.set(userId, {
      userId,
      username,
      socketId: socket.id,
      score: 0,
      correctAnswers: 0,
    });
    room.answers.set(userId, new Map());
    room.status = BattleStatus.READY;

    socket.join(roomCode);

    console.log(`👥 Player joined room ${roomCode}: ${username}`);

    // Get updated battle data
    const battle = await prisma.battle.findUnique({
      where: { roomCode },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                level: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return { success: true, battle };
  }

  async leaveBattle(socket: Socket, roomCode: string) {
    const userId = socket.data.userId;
    const room = this.activeBattles.get(roomCode);

    if (!room) return;

    room.players.delete(userId);

    // If room is empty or battle hasn't started, cancel it
    if (room.players.size === 0 || room.status === BattleStatus.WAITING) {
      await prisma.battle.update({
        where: { id: room.battleId },
        data: { status: BattleStatus.CANCELLED },
      });
      this.activeBattles.delete(roomCode);
      console.log(`🗑️ Room ${roomCode} deleted`);
    }
  }

  async startBattle(roomCode: string) {
    const room = this.activeBattles.get(roomCode);

    if (!room || room.status !== BattleStatus.READY) return;

    room.status = BattleStatus.IN_PROGRESS;

    await prisma.battle.update({
      where: { id: room.battleId },
      data: {
        status: BattleStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    console.log(`🚀 Battle started: ${roomCode}`);

    // Send first question
    const currentQuestion = room.questions[0];
    this.io.to(roomCode).emit('battle-started', {
      questionIndex: 0,
      question: {
        id: currentQuestion.id,
        question: currentQuestion.question,
        options: currentQuestion.options,
        topic: currentQuestion.topic,
        difficulty: currentQuestion.difficulty,
      },
      totalQuestions: room.questions.length,
    });
  }

  async submitAnswer(
    socket: Socket,
    data: { roomCode: string; questionIndex: number; answer: number; responseTime: number }
  ) {
    const userId = socket.data.userId;
    const room = this.activeBattles.get(data.roomCode);

    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.players.get(userId);
    if (!player) {
      throw new Error('Player not found');
    }

    const question = room.questions[data.questionIndex];
    const isCorrect = question.correctAnswer === data.answer;

    // Calculate points (faster = more points)
    let points = 0;
    if (isCorrect) {
      const basePoints = 100;
      const timeBonus = Math.max(0, 50 - Math.floor(data.responseTime / 1000) * 5);
      points = basePoints + timeBonus;
      player.score += points;
      player.correctAnswers += 1;
    }

    // Store answer
    const playerAnswers = room.answers.get(userId);
    if (playerAnswers) {
      playerAnswers.set(data.questionIndex, {
        answer: data.answer,
        isCorrect,
        responseTime: data.responseTime,
      });
    }

    // Save to database
    const battleParticipant = await prisma.battleParticipant.findFirst({
      where: {
        battleId: room.battleId,
        userId: userId,
      },
    });

    if (battleParticipant) {
      const battleQuestion = await prisma.battleQuestion.findFirst({
        where: {
          battleId: room.battleId,
          orderIndex: data.questionIndex,
        },
      });

      if (battleQuestion) {
        await prisma.battleAnswer.create({
          data: {
            battleParticipantId: battleParticipant.id,
            battleQuestionId: battleQuestion.id,
            selectedAnswer: data.answer,
            isCorrect,
            responseTime: data.responseTime,
          },
        });
      }

      // Update participant score
      await prisma.battleParticipant.update({
        where: { id: battleParticipant.id },
        data: {
          score: player.score,
          correctAnswers: player.correctAnswers,
        },
      });
    }

    // Check if both players answered
    const bothAnswered = Array.from(room.players.keys()).every((playerId) => {
      const answers = room.answers.get(playerId);
      return answers && answers.has(data.questionIndex);
    });

    // Get scores
    const scores = Array.from(room.players.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
      score: p.score,
      correctAnswers: p.correctAnswers,
    }));

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      points,
      scores,
      bothAnswered,
    };
  }

  nextQuestion(roomCode: string) {
    const room = this.activeBattles.get(roomCode);

    if (!room) return;

    room.currentQuestionIndex += 1;

    if (room.currentQuestionIndex >= room.questions.length) {
      // Battle ended
      this.endBattle(roomCode);
    } else {
      // Send next question
      const currentQuestion = room.questions[room.currentQuestionIndex];
      this.io.to(roomCode).emit('next-question', {
        questionIndex: room.currentQuestionIndex,
        question: {
          id: currentQuestion.id,
          question: currentQuestion.question,
          options: currentQuestion.options,
          topic: currentQuestion.topic,
          difficulty: currentQuestion.difficulty,
        },
        totalQuestions: room.questions.length,
      });
    }
  }

  async endBattle(roomCode: string) {
    const room = this.activeBattles.get(roomCode);

    if (!room) return null;

    room.status = BattleStatus.COMPLETED;

    // Determine winner
    const players = Array.from(room.players.values());
    players.sort((a, b) => b.score - a.score);

    const winner = players[0];
    const loser = players[1];
    const isDraw = winner.score === loser.score;

    // Calculate rewards
    const winnerXP = isDraw ? 30 : 50;
    const winnerCoins = isDraw ? 20 : 50;
    const loserXP = isDraw ? 30 : 10;
    const loserCoins = isDraw ? 20 : 10;

    // Update database
    await prisma.battle.update({
      where: { id: room.battleId },
      data: {
        status: BattleStatus.COMPLETED,
        endedAt: new Date(),
      },
    });

    // Update participants
    const winnerParticipant = await prisma.battleParticipant.findFirst({
      where: {
        battleId: room.battleId,
        userId: winner.userId,
      },
    });

    const loserParticipant = await prisma.battleParticipant.findFirst({
      where: {
        battleId: room.battleId,
        userId: loser.userId,
      },
    });

    if (winnerParticipant) {
      await prisma.battleParticipant.update({
        where: { id: winnerParticipant.id },
        data: {
          position: isDraw ? null : 1,
          xpGained: winnerXP,
          coinsGained: winnerCoins,
        },
      });

      // Update user
      await prisma.user.update({
        where: { id: winner.userId },
        data: {
          xp: { increment: winnerXP },
          coins: { increment: winnerCoins },
        },
      });

      // Update stats
      await prisma.userStats.update({
        where: { userId: winner.userId },
        data: {
          totalGamesPlayed: { increment: 1 },
          totalWins: { increment: isDraw ? 0 : 1 },
          totalDraws: { increment: isDraw ? 1 : 0 },
          winStreak: { increment: isDraw ? 0 : 1 },
          totalCorrectAnswers: { increment: winner.correctAnswers },
          totalQuestionsAnswered: { increment: room.questions.length },
        },
      });
    }

    if (loserParticipant) {
      await prisma.battleParticipant.update({
        where: { id: loserParticipant.id },
        data: {
          position: isDraw ? null : 2,
          xpGained: loserXP,
          coinsGained: loserCoins,
        },
      });

      // Update user
      await prisma.user.update({
        where: { id: loser.userId },
        data: {
          xp: { increment: loserXP },
          coins: { increment: loserCoins },
        },
      });

      // Update stats
      await prisma.userStats.update({
        where: { userId: loser.userId },
        data: {
          totalGamesPlayed: { increment: 1 },
          totalLosses: { increment: isDraw ? 0 : 1 },
          totalDraws: { increment: isDraw ? 1 : 0 },
          winStreak: isDraw ? undefined : 0,
          totalCorrectAnswers: { increment: loser.correctAnswers },
          totalQuestionsAnswered: { increment: room.questions.length },
        },
      });
    }

    console.log(`🏁 Battle ended: ${roomCode}`);

    const results = {
      winner: isDraw ? null : winner,
      players: players.map((p) => ({
        userId: p.userId,
        username: p.username,
        score: p.score,
        correctAnswers: p.correctAnswers,
        xpGained: p.userId === winner.userId ? winnerXP : loserXP,
        coinsGained: p.userId === winner.userId ? winnerCoins : loserCoins,
      })),
      isDraw,
    };

    // Clean up room after delay
    setTimeout(() => {
      this.activeBattles.delete(roomCode);
    }, 10000);

    return results;
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;

    // Find and remove from any active battles
    for (const [roomCode, room] of this.activeBattles.entries()) {
      if (room.players.has(userId)) {
        this.leaveBattle(socket, roomCode);
        this.io.to(roomCode).emit('player-disconnected', { userId });
      }
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
