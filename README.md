# Clone the repository
git clone https://github.com/Tanush-ahuja07/ai-quiz-generator.git
cd ai-quiz-generator

# Install dependencies
cd client && npm install
cd ../server && npm install

# Set environment variables for the server (.env):
# Example:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Run development servers in parallel or open two terminals:
# For client (React):
cd ../client && npm start

# For server (Express):
cd ../server && npm run dev


# Features 


# Authentication

Secure sign-up and login using JWT or your preferred auth method.

# Quiz Creation

Build quizzes manually—add questions, options, correct answers.

Or generate quizzes using AI for convenience and speed.

# Real-Time Gameplay

Players join using a 6-digit room code.

Live leaderboard and results.

Quiz creators can monitor participant performance in real-time.

# Analytics Dashboard

View detailed statistics for each quiz as it happens.

Understand participant behavior, scores distribution, and performance trends.
