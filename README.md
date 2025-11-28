📚 AI Quiz Generator

An intelligent, real-time quiz creation and participation platform powered by AI, built using the MERN stack, Socket.io, and OpenAI API.

🚀 Tech Stack

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB

Real-Time Communication: Socket.io

AI Integration: OpenAI API

Deployment: Netlify (Frontend), Railway (Backend)

🎯 Overview

AI Quiz Generator (Quiz-Gen) is a full-stack application that allows users to create and participate in quizzes in real time. Users can choose between manually creating quizzes or letting AI generate them automatically based on the topic and difficulty. The platform supports real-time interaction, allowing multiple users to join a quiz room simultaneously and see live leaderboard updates — similar to Kahoot.

This project strengthened my understanding of real-time communication, state management in React, and integrating external APIs in full-stack applications.

✨ Features
🔹 AI-Powered Quiz Creation

Generate quizzes automatically using the OpenAI API based on any topic, difficulty level, or number of questions.

🔹 Manual Quiz Builder

Create custom quizzes using an intuitive UI.

🔹 Real-Time Leaderboard

Socket.io enables live score updates for all connected participants.

🔹 Quiz Rooms

Users can host or join quiz rooms with unique room codes.

🔹 Instant Scoring & Auto-Submission

The system evaluates each answer instantly and auto-submits once the timer ends.

🔹 Responsive UI

Fully optimized for desktop, tablet, and mobile.

🔹 Secure Authentication 

JWT-based login/register flow can be added.

🔹 Result Analytics

Creators can view comprehensive quiz insights and performance data.

📦 Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/yourusername/ai-quiz-generator.git
cd ai-quiz-generator

2️⃣ Install dependencies

Backend:

cd backend
npm install


Frontend:

cd ../frontend
npm install

3️⃣ Environment Variables

Create .env in backend:

MONGO_URI=your_mongodb_url
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

4️⃣ Run the app

Backend:

npm start


Frontend:

npm run dev

🎮 How It Works

1. User creates or joins a quiz room

2. Host selects manual or AI-generated quiz

3. Quiz begins → Questions appear with a timer

4. Participants answer → Server evaluates instantly

5. Leaderboard updates in real time

6. Final results and analytics shown at the end
