import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Edit, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { quizAPI, Question } from '@/lib/api';

const CreateQuiz = () => {
  // Type for backend question format
  type BackendQuestion = {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
  };
  const [mode, setMode] = useState<'select' | 'manual' | 'ai'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Manual quiz state
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: '', options: ['', '', '', ''], correctAnswerIndex: -1 }
  ]);

  // AI quiz state
  const [aiTopic, setAiTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [aiDuration, setAiDuration] = useState(10);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: -1 }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

   const updateQuestion = (index: number, field: keyof Question, value: string | string[]) => {
       const updatedQuestions = [...questions];
       if (field === 'correctAnswerIndex') {
           // Map user input (1-4) to backend index (0-3)
           const num = Number(value);
           updatedQuestions[index].correctAnswerIndex = isNaN(num) ? -1 : num - 1;
       } else {
           updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
       }
       setQuestions(updatedQuestions);
   };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);


    try {
      const quiz = await quizAPI.createQuiz({
        title,
        topic,
        questions,
        duration,
        isAIgenerated: false
      });

      toast({
        title: "Success",
        description: `Quiz created! Room code: ${quiz.roomCode}`,
      });
      
      navigate('/my-quizzes');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await quizAPI.generateAIQuiz({
        topic: aiTopic,
        numberOfQuestions
      });
      setAiQuestions(result.questions);
      toast({
        title: "Success",
        description: "AI quiz generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiSave = async () => {
    setIsLoading(true);
    try {
      const quiz = await quizAPI.saveAIQuiz({
        topic: aiTopic,
        questions: aiQuestions,
        duration: aiDuration
      });

      toast({
        title: "Success",
        description: `AI Quiz saved! Room code: ${quiz.roomCode}`,
      });
      
      navigate('/my-quizzes');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save AI quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-bg flex flex-col">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent mb-2">
              Create Quiz
            </h1>
            <p className="text-muted-foreground">Choose how you want to create your quiz</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-glow transition-all duration-300 bg-gradient-card border-border/20" onClick={() => setMode('manual')}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Edit className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle>Manual Creation</CardTitle>
                <CardDescription>
                  Create your quiz manually with custom questions and answers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-glow transition-all duration-300 bg-gradient-card border-border/20" onClick={() => setMode('ai')}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle>AI Generation</CardTitle>
                <CardDescription>
                  Let AI generate quiz questions based on your topic
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'manual') {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Options
          </Button>

          <Card className="bg-gradient-card border-border/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-text bg-clip-text text-transparent">
                Manual Quiz Creation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter quiz title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter quiz topic"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg">Questions</Label>
                    <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>

                  {questions.map((question, qIndex) => (
                    <Card key={qIndex} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <Label>Question {qIndex + 1}</Label>
                          {questions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(qIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <Textarea
                          value={question.questionText}
                          onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                          placeholder="Enter your question"
                          required
                        />

                        <div className="grid grid-cols-2 gap-2">
                          {question.options.map((option, oIndex) => (
                            <Input
                              key={oIndex}
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                          ))}
                        </div>

                               <div>
                                   <Label>Correct Answer (1-4)</Label>
                                   <Input
                                       type="number"
                                       min="1"
                                       max="4"
                                       value={question.correctAnswerIndex >= 0 ? question.correctAnswerIndex + 1 : ''}
                                       onChange={(e) => updateQuestion(qIndex, 'correctAnswerIndex', e.target.value)}
                                       placeholder="Enter the correct answer index (1-4)"
                                       required
                                   />
                               </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button type="submit" variant="glow" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Quiz"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === 'ai') {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Options
          </Button>

          <Card className="bg-gradient-card border-border/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-text bg-clip-text text-transparent">
                AI Quiz Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiQuestions.length === 0 ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="aiTopic">Topic</Label>
                    <Input
                      id="aiTopic"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Enter topic for AI generation"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="numberOfQuestions">Number of Questions</Label>
                    <Input
                      id="numberOfQuestions"
                      type="number"
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                      min="1"
                      max="20"
                      required
                    />
                  </div>

                  <Button
                    onClick={handleAiGenerate}
                    variant="glow"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !aiTopic.trim()}
                  >
                    {isLoading ? "Generating..." : "Generate AI Quiz"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="aiDuration">Duration (minutes)</Label>
                    <Input
                      id="aiDuration"
                      type="number"
                      value={aiDuration}
                      onChange={(e) => setAiDuration(Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg">Generated Questions</Label>
                    {aiQuestions.map((question, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <p className="font-medium">Q{index + 1}: {question.questionText}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {question.options.map((option, oIndex) => (
                              <p key={oIndex} className={`p-2 rounded ${oIndex === question.correctAnswerIndex ? 'bg-success/20 text-success' : 'bg-muted'}`}>
                                {option}
                              </p>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setAiQuestions([])}
                      variant="outline"
                      className="flex-1"
                    >
                      Generate New
                    </Button>
                    <Button
                      onClick={handleAiSave}
                      variant="glow"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Quiz"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default CreateQuiz;