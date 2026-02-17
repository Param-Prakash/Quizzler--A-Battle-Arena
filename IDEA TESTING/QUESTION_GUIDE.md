# Question Management Guide

## 📝 How to Add Questions to Your Quiz Platform

### Method 1: Bulk Import from JSON (Recommended for Large Question Banks)

#### Step 1: Prepare Your Questions in JSON Format

Edit the file: `data/questions.json`

```json
[
  {
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "topic": "Programming",
    "difficulty": "EASY",
    "explanation": "Explanation of the correct answer"
  }
]
```

**Important Rules:**
- ✅ Must have exactly 4 options
- ✅ `correctAnswer` is the index (0, 1, 2, or 3)
- ✅ `difficulty` must be: EASY, MEDIUM, HARD, or EXPERT
- ✅ `explanation` is optional but recommended

**Available Topics:**
- Programming
- Science
- History
- Geography
- Mathematics
- General Knowledge
- (You can add custom topics)

#### Step 2: Run the Import Script

```bash
npm run import:questions
```

This will:
- ✅ Validate each question
- ✅ Skip duplicates
- ✅ Show import results
- ✅ Add all valid questions to database

---

### Method 2: Add Questions via Prisma Studio (Visual Interface)

```bash
npm run db:studio
```

1. Opens at http://localhost:5555
2. Click on "Question" table
3. Click "Add record"
4. Fill in the fields:
   - **question**: Your question text
   - **options**: `["A", "B", "C", "D"]` (JSON array)
   - **correctAnswer**: 0, 1, 2, or 3
   - **topic**: Topic name
   - **difficulty**: EASY, MEDIUM, HARD, or EXPERT
   - **explanation**: Optional explanation
5. Click "Save"

---

### Method 3: Add Questions Programmatically (Database Script)

Edit `prisma/seed.ts` and add to the `questions` array:

```typescript
{
  question: 'What is your question?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: 0,
  topic: 'Programming',
  difficulty: Difficulty.EASY,
  explanation: 'Explanation here',
}
```

Then run:
```bash
npm run db:seed
```

---

### Method 4: Create Admin API Endpoint (For CMS/Dashboard)

Create `app/api/admin/questions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, options, correctAnswer, topic, difficulty, explanation } = body;

    // Validation
    if (!question || !options || options.length !== 4) {
      return NextResponse.json({ error: 'Invalid question format' }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        options,
        correctAnswer,
        topic,
        difficulty,
        explanation,
      },
    });

    return NextResponse.json({ 
      message: 'Question created successfully', 
      question: newQuestion 
    });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 📊 Converting Excel/CSV Question Bank to JSON

If you have questions in Excel or CSV:

### Using Excel:

1. Save your Excel as CSV
2. Use this Python script:

```python
import csv
import json

questions = []

with open('questions.csv', 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        questions.append({
            "question": row['question'],
            "options": [row['option1'], row['option2'], row['option3'], row['option4']],
            "correctAnswer": int(row['correctAnswer']),
            "topic": row['topic'],
            "difficulty": row['difficulty'],
            "explanation": row.get('explanation', '')
        })

with open('questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"Converted {len(questions)} questions!")
```

### Using Node.js:

```bash
npm install csv-parser
```

```javascript
const fs = require('fs');
const csv = require('csv-parser');

const questions = [];

fs.createReadStream('questions.csv')
  .pipe(csv())
  .on('data', (row) => {
    questions.push({
      question: row.question,
      options: [row.option1, row.option2, row.option3, row.option4],
      correctAnswer: parseInt(row.correctAnswer),
      topic: row.topic,
      difficulty: row.difficulty,
      explanation: row.explanation || ''
    });
  })
  .on('end', () => {
    fs.writeFileSync('questions.json', JSON.stringify(questions, null, 2));
    console.log(`Converted ${questions.length} questions!`);
  });
```

---

## 🔍 Query Questions by Topic/Difficulty

View questions in your database:

```bash
npm run db:studio
```

Or use Prisma Client in your code:

```typescript
// Get all Programming questions
const programmingQuestions = await prisma.question.findMany({
  where: { topic: 'Programming' }
});

// Get EASY questions
const easyQuestions = await prisma.question.findMany({
  where: { difficulty: 'EASY' }
});

// Get specific topic + difficulty
const hardScienceQuestions = await prisma.question.findMany({
  where: {
    topic: 'Science',
    difficulty: 'HARD'
  }
});
```

---

## 📝 CSV Template for Question Bank

Create a CSV file with these columns:

```csv
question,option1,option2,option3,option4,correctAnswer,topic,difficulty,explanation
"What is 2+2?","3","4","5","6",1,"Mathematics","EASY","2 plus 2 equals 4"
"What is the capital of France?","London","Berlin","Paris","Rome",2,"Geography","EASY","Paris is the capital of France"
```

**Column Explanations:**
- `question`: The question text
- `option1-4`: The four answer choices
- `correctAnswer`: Index of correct answer (0=option1, 1=option2, 2=option3, 3=option4)
- `topic`: Category (Programming, Science, etc.)
- `difficulty`: EASY, MEDIUM, HARD, or EXPERT
- `explanation`: Why the answer is correct

---

## 🎯 Best Practices

1. **Keep questions clear and concise**
2. **Avoid ambiguous wording**
3. **Make all options plausible**
4. **Include helpful explanations**
5. **Balance difficulty levels**
6. **Organize by topics**
7. **Test questions before adding bulk amounts**

---

## 🔧 Troubleshooting

**"Duplicate question" error:**
- The script skips duplicates automatically
- Check if the exact question text already exists

**"Invalid format" error:**
- Ensure you have exactly 4 options
- correctAnswer must be 0, 1, 2, or 3
- difficulty must be EASY, MEDIUM, HARD, or EXPERT

**Questions not showing in game:**
- Verify questions exist: `npm run db:studio`
- Check topic spelling matches exactly
- Make sure difficulty level is correct
