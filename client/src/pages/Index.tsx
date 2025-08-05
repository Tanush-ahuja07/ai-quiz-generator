import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, Bot, Trophy, Users } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              QuizAI
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-glow animate-float">
                <Zap className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                QuizAI
              </h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              The Future of
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Quiz Creation</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create engaging quizzes with AI, compete in real-time, and track your progress with beautiful analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="glow" 
                size="xl" 
                onClick={() => navigate('/register')}
                className="text-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                onClick={() => navigate('/login')}
                className="text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
              Why Choose QuizAI?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gradient-card rounded-xl border border-border/50 shadow-glow hover:shadow-primary transition-all duration-300">
                <div className="p-3 bg-gradient-primary rounded-full w-fit mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">AI-Powered Creation</h4>
                <p className="text-muted-foreground">
                  Generate high-quality quizzes instantly with our advanced AI technology. Just provide a topic and let AI do the work.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-card rounded-xl border border-border/50 shadow-glow hover:shadow-primary transition-all duration-300">
                <div className="p-3 bg-gradient-primary rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Real-time Competition</h4>
                <p className="text-muted-foreground">
                  Join live quiz sessions, compete with others, and watch the leaderboard update in real-time.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-card rounded-xl border border-border/50 shadow-glow hover:shadow-primary transition-all duration-300">
                <div className="p-3 bg-gradient-primary rounded-full w-fit mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Advanced Analytics</h4>
                <p className="text-muted-foreground">
                  Track performance, analyze question difficulty, and gain insights into learning patterns.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
