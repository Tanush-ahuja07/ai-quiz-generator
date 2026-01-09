import dotenv from "dotenv";
dotenv.config();

const generateQuizWithGemini = async (topic, numQuestions) => {
  const prompt = `Generate ${numQuestions} multiple choice questions on the topic "${topic}".\nEach question should have exactly 4 options and mention the index (0-based) of the correct answer.\nReturn response in strict JSON format like:\n[
  {
    "questionText": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswerIndex": 1
  },
  ...
]`;

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativeai.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  // Extract the model's reply
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  // Remove Markdown code block markers if present
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
  }
  return JSON.parse(text);
};

export default generateQuizWithGemini;
