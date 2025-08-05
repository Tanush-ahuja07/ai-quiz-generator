import OpenAI from "openai"
import dotenv from "dotenv"
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateQuizWithOpenAI = async (topic, numQuestions) => {
  const prompt = `Generate ${numQuestions} multiple choice questions on the topic "${topic}".
Each question should have exactly 4 options and mention the index (0-based) of the correct answer.
Return response in strict JSON format like:
[
  {
    "questionText": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswerIndex": 1
  },
  ...
]`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const json = completion.choices[0].message.content;
  return JSON.parse(json);
};

export default generateQuizWithOpenAI;