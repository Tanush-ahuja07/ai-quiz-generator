import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quizAPI, Quiz, LeaderboardEntry } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';

const TakeQuiz = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (roomCode) {
      fetchQuiz();
    }
  }, [roomCode]);

  // Prevent navigation away during quiz attempt
  useEffect(() => {
    if (!isLoading && quiz && !isSubmitting) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        handleSubmit();
        e.returnValue = '';
        return '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isLoading, quiz, isSubmitting]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && startTime > 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [roomCode]);

  const fetchQuiz = async () => {
    try {
      const data = await quizAPI.getQuizByRoomCode(roomCode!);
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(''));
      setTimeLeft(data.duration * 60); // Convert minutes to seconds
      setStartTime(Date.now());
    } catch (error: any) {
      let message = "Quiz not found or unable to load.";
      if (error?.response?.status === 403) {
        message = error.response.data?.message || "You cannot join or attempt this quiz.";
      }
      toast({
        title: "Error",
        description: message,
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
    } catch (error) {
      // Silently fail for leaderboard updates
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    setIsSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const result = await quizAPI.submitQuiz(roomCode!, {
        answers,
        timeTaken
      });

      toast({
        title: "Quiz Submitted!",
        description: `Your score: ${result.score}/${result.total}`,
      });

      navigate(`/results/${roomCode}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Quiz Not Found</h2>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-text bg-clip-text text-transparent">
              {quiz.title || quiz.topic}
            </h1>
            <p className="text-muted-foreground">Room: {roomCode}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              <Users className="h-4 w-4 mr-1" />
              Leaderboard
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Quiz Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Progress */}
            <Card className="bg-gradient-card border-border/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {answers.filter(a => a !== '').length} answered
                  </span>
                </div>
                <Progress 
                  value={((currentQuestion + 1) / quiz.questions.length) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Question */}
            <Card className="bg-gradient-card border-border/20 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl">
                  {quiz.questions[currentQuestion].questionText}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant={answers[currentQuestion] === option ? "default" : "outline"}
                    className="w-full text-left justify-start p-4 h-auto"
                    onClick={() => handleAnswerSelect(option)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    variant="glow"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={nextQuestion}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Question Navigator */}
            <Card className="bg-gradient-card border-border/20">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {quiz.questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentQuestion === index ? "default" : answers[index] ? "success" : "outline"}
                      size="sm"
                      className="aspect-square"
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            {(showLeaderboard || leaderboard.length > 0) && (
              <Card className="bg-gradient-card border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Live Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm">
                      No submissions yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.slice(0, 5).map((entry, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-2 rounded ${
                            entry.name === user?.name ? 'bg-primary/20' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={index < 3 ? "default" : "outline"} className="w-6 h-6 p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span className="text-sm font-medium truncate">
                              {entry.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{entry.score}</div>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(entry.timeTaken / 60)}:{(entry.timeTaken % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;