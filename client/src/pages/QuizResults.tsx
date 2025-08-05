import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Target, Home, RotateCcw, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quizAPI, QuizResult, LeaderboardEntry } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';

const QuizResults = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    if (roomCode) {
      fetchResults();
      fetchLeaderboard();
    }
  }, [roomCode]);

  const fetchResults = async () => {
    try {
      const data = await quizAPI.getQuizResult(roomCode!);
      setResult(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz results.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const data = await quizAPI.getLeaderboard(roomCode!);
      setLeaderboard(data.leaderboard || []);
      
      // Find user's rank
      const rank = data.leaderboard.findIndex((entry: LeaderboardEntry) => entry.name === user?.name) + 1;
      setUserRank(rank);
    } catch (error) {
      // Silently fail for leaderboard
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getPerformanceMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "Outstanding! 🎉";
    if (percentage >= 80) return "Excellent work! 👏";
    if (percentage >= 70) return "Good job! 👍";
    if (percentage >= 60) return "Not bad! 😊";
    return "Keep practicing! 💪";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Results Not Found</h2>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scorePercentage = (result.score / result.total) * 100;

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
            <Trophy className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent mb-2">
            Quiz Complete!
          </h1>
          <p className="text-muted-foreground">Room: {roomCode}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <Card className="text-center bg-gradient-card border-border/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Target className="h-5 w-5" />
                Your Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.score, result.total)}`}>
                {result.score}/{result.total}
              </div>
              <div className="text-lg text-muted-foreground mb-3">
                {scorePercentage.toFixed(1)}%
              </div>
              <Badge variant={scorePercentage >= 70 ? "default" : "secondary"} className="text-sm">
                {getPerformanceMessage(result.score, result.total)}
              </Badge>
            </CardContent>
          </Card>

          {/* Time Card */}
          <Card className="text-center bg-gradient-card border-border/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                Time Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2 text-primary">
                {formatTime(result.timeTaken)}
              </div>
              <div className="text-muted-foreground">
                Average: {(result.timeTaken / result.total).toFixed(1)}s per question
              </div>
            </CardContent>
          </Card>

          {/* Rank Card */}
          <Card className="text-center bg-gradient-card border-border/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2 text-primary">
                #{userRank || '?'}
              </div>
              <div className="text-muted-foreground">
                Out of {leaderboard.length} participants
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Answer Review */}
          <Card className="bg-gradient-card border-border/20 shadow-elegant">
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
              <CardDescription>
                Review your answers and correct solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {result.answers.map((answer, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="text-sm">Your answer: <span className="font-medium">{answer || 'No answer'}</span></div>
                      <div className="text-sm text-muted-foreground">
                        Correct: <span className="font-medium">{result.correctAnswers[index]}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={answer === result.correctAnswers[index] ? "default" : "destructive"}>
                    {answer === result.correctAnswers[index] ? '✓' : '✗'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-gradient-card border-border/20 shadow-elegant">
            <CardHeader>
              <CardTitle>Final Leaderboard</CardTitle>
              <CardDescription>
                See how you ranked against other participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No other participants yet
                </p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      entry.name === user?.name ? 'bg-primary/20 border border-primary/30' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={index < 3 ? "default" : "outline"} 
                        className={`w-8 h-8 p-0 flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : ''
                        }`}
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{entry.name}</div>
                        {entry.name === user?.name && (
                          <div className="text-xs text-primary">You</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{entry.score}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(entry.timeTaken)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            variant="glow"
            onClick={() => navigate('/create-quiz')}
          >
            Create New Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;