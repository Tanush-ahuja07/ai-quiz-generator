import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Copy, BarChart3, Brain, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quizAPI, Quiz } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await quizAPI.getUserQuizzes();
      setQuizzes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your quizzes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoomCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied!",
      description: `Room code ${roomCode} copied to clipboard.`,
    });
  };

  const viewAnalytics = (roomCode: string) => {
    navigate(`/analytics/${roomCode}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent mb-2">
            My Quizzes
          </h1>
          <p className="text-muted-foreground">
            Manage and view analytics for your created quizzes
          </p>
        </div>

        {quizzes.length === 0 ? (
          <Card className="text-center p-12 bg-gradient-card border-border/20">
            <CardContent>
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <Edit className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="mb-2">No Quizzes Yet</CardTitle>
              <CardDescription className="mb-6">
                You haven't created any quizzes yet. Create your first quiz to get started!
              </CardDescription>
              <Button 
                variant="glow" 
                onClick={() => navigate('/create-quiz')}
              >
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="bg-gradient-card border-border/20 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {quiz.title || quiz.topic}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {quiz.isAIgenerated && (
                        <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                          <Brain className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {quiz.duration} min
                    </div>
                    <div>
                      {quiz.questions.length} questions
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Room Code</p>
                        <p className="font-mono font-bold text-lg">{quiz.roomCode}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyRoomCode(quiz.roomCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => viewAnalytics(quiz.roomCode)}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/quiz/${quiz.roomCode}/preview`)}
                    >
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuizzes;