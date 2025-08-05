import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, Users, BookOpen, LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              QuizAI
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-muted-foreground text-lg">
            What would you like to do today?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Join Quiz */}
          <Card className="bg-gradient-card border-border/50 shadow-glow hover:shadow-primary transition-all duration-300 group cursor-pointer"
                onClick={() => navigate('/join')}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-gradient-primary rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl text-foreground">Join Quiz</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter a room code to join an existing quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Join Now
              </Button>
            </CardContent>
          </Card>

          {/* Create Quiz */}
          <Card className="bg-gradient-card border-border/50 shadow-glow hover:shadow-primary transition-all duration-300 group cursor-pointer"
                onClick={() => navigate('/create')}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-gradient-primary rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl text-foreground">Create Quiz</CardTitle>
              <CardDescription className="text-muted-foreground">
                Build your own quiz manually or with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="glow" className="w-full">
                Create Now
              </Button>
            </CardContent>
          </Card>

          {/* My Quizzes */}
          <Card className="bg-gradient-card border-border/50 shadow-glow hover:shadow-primary transition-all duration-300 group cursor-pointer"
                onClick={() => navigate('/my-quizzes')}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-gradient-primary rounded-full w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl text-foreground">My Quizzes</CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage your created quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Quizzes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-center text-foreground">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Quizzes Created</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Quizzes Joined</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;