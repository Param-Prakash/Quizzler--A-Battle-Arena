import { PrismaClient, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface QuestionImport {
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  explanation?: string;
}

async function importQuestions() {
  try {
    // Read JSON file
    const filePath = path.join(__dirname, '../data/questions.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const questions: QuestionImport[] = JSON.parse(fileContent);

    console.log(`📥 Importing ${questions.length} questions...`);

    let successCount = 0;
    let errorCount = 0;

    for (const q of questions) {
      try {
        // Validate question
        if (!q.question || !q.options || q.options.length !== 4) {
          console.error(`❌ Invalid question format: ${q.question?.substring(0, 50)}...`);
          errorCount++;
          continue;
        }

        if (q.correctAnswer < 0 || q.correctAnswer > 3) {
          console.error(`❌ Invalid correct answer index: ${q.question?.substring(0, 50)}...`);
          errorCount++;
          continue;
        }

        // Check if question already exists
        const existing = await prisma.question.findFirst({
          where: { question: q.question },
        });

        if (existing) {
          console.log(`⏭️  Skipping duplicate: ${q.question.substring(0, 50)}...`);
          continue;
        }

        // Create question
        await prisma.question.create({
          data: {
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            topic: q.topic,
            difficulty: q.difficulty as Difficulty,
            explanation: q.explanation,
          },
        });

        successCount++;
        console.log(`✅ Imported: ${q.question.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Error importing question: ${error}`);
        errorCount++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`❌ Errors/Skipped: ${errorCount}`);
    console.log(`📝 Total processed: ${questions.length}`);
  } catch (error) {
    console.error('Error reading or parsing file:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importQuestions();
