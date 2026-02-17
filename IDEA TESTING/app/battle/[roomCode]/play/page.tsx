'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBattleStore } from '@/store/battleStore';
import { io, Socket } from 'socket.io-client';
import { Clock, Trophy, Loader2, CheckCircle, XCircle } from 'lucide-react';

let socket: Socket | null = null;

export default function BattlePlayPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomCode as string;
  const { user, isAuthenticated } = useAuthStore();
  const {
    currentQuestion,
    questionIndex,
    playerScores,
    isAnswered,
    selectedAnswer,
    startTime,
    setQuestion,
    setScores,
    selectAnswer,
    resetAnswer,
    resetBattle,
  } = useBattleStore();

  const [timer, setTimer] = useState(15);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    correctAnswer: number;
    points: number;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!socket && user) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

      socket.on('connect', () => {
        socket?.emit('authenticate', {
          userId: user.id,
          username: user.username,
        });
      });

      socket.on('battle-started', (data) => {
        setQuestion(data.question, data.questionIndex);
        setTimer(15);
      });

      socket.on('next-question', (data) => {
        setQuestion(data.question, data.questionIndex);
        setTimer(15);
        setAnswerResult(null);
        resetAnswer();
      });

      socket.on('answer-result', (data) => {
        setAnswerResult(data);
      });

      socket.on('score-update', (scores) => {
        setScores(scores);
      });

      socket.on('battle-results', (results) => {
        router.push(`/battle/${roomCode}/results?data=${JSON.stringify(results)}`);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user, isAuthenticated, router, roomCode]);

  // Timer countdown
  useEffect(() => {
    if (currentQuestion && !isAnswered && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Auto-submit with no answer
            handleSubmitAnswer(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentQuestion, isAnswered, timer]);

  const handleSelectAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    selectAnswer(answerIndex);
  };

  const handleSubmitAnswer = (answer: number) => {
    if (isAnswered) return;

    const responseTime = startTime ? Date.now() - startTime : 0;
    selectAnswer(answer === -1 ? 0 : answer);

    socket?.emit('submit-answer', {
      roomCode,
      questionIndex,
      answer: answer === -1 ? 0 : answer,
      responseTime,
    });
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header - Scores */}
        <div className="flex justify-between items-center mb-8">
          {playerScores.map((player, index) => (
            <div
              key={player.userId}
              className={`flex-1 ${index === 0 ? 'text-left' : 'text-right'}`}
            >
              <p className="text-gray-400 text-sm mb-1">{player.username}</p>
              <p className="text-3xl font-bold text-primary-400">{player.score}</p>
              <p className="text-gray-400 text-xs">
                {player.correctAnswers} correct
              </p>
            </div>
          ))}
        </div>

        {/* Question Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-6">
          {/* Progress & Timer */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-400">
              Question {questionIndex + 1} of {/* totalQuestions */}
            </div>
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-primary-400'}`} />
              <span className={`text-2xl font-bold ${timer <= 5 ? 'text-red-400' : 'text-white'}`}>
                {timer}s
              </span>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-white mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = answerResult?.correctAnswer === index;
              const showResult = isAnswered && answerResult;

              let buttonClass = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary-500/50';

              if (showResult) {
                if (isCorrect) {
                  buttonClass = 'bg-green-500/20 border-green-500 ring-2 ring-green-500/50';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'bg-red-500/20 border-red-500 ring-2 ring-red-500/50';
                }
              } else if (isSelected) {
                buttonClass = 'bg-primary-500/20 border-primary-500 ring-2 ring-primary-500/50';
              }

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnswered) {
                      handleSelectAnswer(index);
                      handleSubmitAnswer(index);
                    }
                  }}
                  disabled={isAnswered}
                  className={`relative p-4 rounded-xl border-2 ${buttonClass} transition-all duration-300 text-left disabled:cursor-not-allowed group`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-white">{option}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="ml-auto w-6 h-6 text-green-400" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="ml-auto w-6 h-6 text-red-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Answer Feedback */}
          {answerResult && (
            <div className={`mt-6 p-4 rounded-lg ${answerResult.isCorrect ? 'bg-green-500/10 border border-green-500/50' : 'bg-red-500/10 border border-red-500/50'}`}>
              <p className={`font-semibold ${answerResult.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {answerResult.isCorrect ? `Correct! +${answerResult.points} points` : 'Incorrect!'}
              </p>
            </div>
          )}
        </div>

        {/* Waiting for opponent */}
        {isAnswered && !answerResult && (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-400 mb-2" />
            <p className="text-gray-400">Waiting for opponent...</p>
          </div>
        )}
      </div>
    </div>
  );
}
