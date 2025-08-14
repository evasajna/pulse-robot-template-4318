import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, User, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const participantSchema = z.object({
  participant_name: z.string().min(2, "പേര് കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം"),
  mobile_number: z.string().min(10, "മൊബൈൽ നമ്പർ കുറഞ്ഞത് 10 അക്കങ്ങൾ ഉണ്ടായിരിക്കണം").max(15, "മൊബൈൽ നമ്പർ കൂടുതലായാൽ 15 അക്കങ്ങൾ ആകാം"),
  panchayath: z.string().min(2, "പഞ്ചായത്തിന്റെ പേര് ആവശ്യമാണ്"),
  reference_mobile: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    return val.length >= 10 && val.length <= 15;
  }, "റഫറൻസ് മൊബൈൽ നമ്പർ 10-15 അക്കങ്ങൾക്കിടയിൽ ആയിരിക്കണം"),
});

type ParticipantForm = z.infer<typeof participantSchema>;

interface Question {
  id: string;
  question_text: string;
  options: any;
  correct_answer: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
}

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participantData, setParticipantData] = useState<ParticipantForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  const form = useForm<ParticipantForm>({
    resolver: zodResolver(participantSchema),
  });

  useEffect(() => {
    fetchActiveQuiz();
  }, []);

  useEffect(() => {
    if (currentStep === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, timeLeft]);

  const fetchActiveQuiz = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("status", "active")
        .limit(1)
        .single();

      if (quizError) throw quizError;

      if (quizData) {
        setQuiz(quizData);
        
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("quiz_id", quizData.id);

        if (questionsError) throw questionsError;
        
        const formattedQuestions = questionsData?.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
        })) || [];
        
        // Randomly select 5 questions from available questions
        const shuffled = formattedQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 5);
        
        setQuestions(selectedQuestions);
        setTimeLeft(selectedQuestions.length * 60); // 1 minute per question
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmitParticipant = async (data: ParticipantForm) => {
    console.log("Starting participant submission with data:", data);
    setLoading(true);
    try {
      // Check for duplicate mobile number
      console.log("Checking for duplicate mobile number...");
      const { data: existing, error: checkError } = await supabase
        .from("submissions")
        .select("id")
        .eq("mobile_number", data.mobile_number)
        .eq("quiz_id", quiz?.id);

      if (checkError) {
        console.error("Error checking duplicate:", checkError);
        throw checkError;
      }

      if (existing && existing.length > 0) {
        console.log("Duplicate mobile number found");
        toast({
          title: "Already Submitted",
          description: "You have already submitted this quiz with this mobile number.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("No duplicate found, proceeding to quiz...");
      setParticipantData(data);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error in participant submission:", error);
      toast({
        title: "Error",
        description: "Failed to validate participant data. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!participantData || !quiz) return;

    console.log("Starting quiz submission...", { participantData, quiz, answers });
    setLoading(true);
    try {
      console.log("Calculating score...");
      const { data, error } = await supabase.rpc("calculate_quiz_score", {
        quiz_id_param: quiz.id,
        answers_param: answers,
      });

      if (error) {
        console.error("Error calculating score:", error);
        throw error;
      }

      const score = data || 0;
      const referenceId = `QZ${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      console.log("Score calculated:", score, "Reference ID:", referenceId);

      const submissionData = {
        quiz_id: quiz.id,
        participant_name: participantData.participant_name,
        mobile_number: participantData.mobile_number,
        panchayath: participantData.panchayath,
        answers: answers,
        score: score,
        reference_mobile_number: referenceId,
      };

      console.log("Submitting to database:", submissionData);

      const { error: submitError } = await supabase
        .from("submissions")
        .insert(submissionData);

      if (submitError) {
        console.error("Error submitting to database:", submitError);
        throw submitError;
      }

      console.log("Quiz submitted successfully!");
      toast({
        title: "Quiz Submitted Successfully!",
        description: `Your score: ${score}/${questions.length}. Reference ID: ${referenceId}`,
      });

      setCurrentStep(3);
    } catch (error) {
      console.error("Error in quiz submission:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Loading quiz...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
                <CardDescription className="text-lg">{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">ക്വിസ് നിർദ്ദേശങ്ങൾ:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• മൊത്തം {questions.length} ചോദ്യങ്ങൾ പൂർത്തിയാക്കുക</li>
                    <li>• ക്വിസ് പൂർത്തിയാക്കാൻ നിങ്ങൾക്ക് {questions.length} മിനിറ്റുണ്ട്</li>
                    <li>• ഓരോ ചോദ്യത്തിനും ഒരു ശരിയായ ഉത്തരം മാത്രമേ ഉള്ളൂ</li>
                    <li>• നിങ്ങളുടെ സമർപ്പണം അന്തിമമാണ്, മാറ്റാൻ കഴിയില്ല</li>
                  </ul>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitParticipant)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="participant_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            പൂർണ്ണ നാമം
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="നിങ്ങളുടെ പൂർണ്ണ നാമം നൽകുക" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobile_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            മൊബൈൽ നമ്പർ
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="നിങ്ങളുടെ മൊബൈൽ നമ്പർ നൽകുക" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="panchayath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            പഞ്ചായത്ത്
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="നിങ്ങളുടെ പഞ്ചായത്തിന്റെ പേര് നൽകുക" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reference_mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            റഫറൻസ് മൊബൈൽ നമ്പർ (ഓപ്ഷണൽ)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="റഫർ ചെയ്തയാളുടെ മൊബൈൽ നമ്പർ നൽകുക" {...field} />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            ഈ ക്വിസിൽ പങ്കെടുക്കാൻ നിങ്ങളെ റഫർ ചെയ്ത വ്യക്തിയുടെ മൊബൈൽ നമ്പർ നൽകുക
                          </p>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "പരിശോധിക്കുന്നു..." : "ക്വിസ് ആരംഭിക്കുക"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-warning">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">{currentQuestion?.question_text}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestion?.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion?.id, value)}
                  className="space-y-4"
                >
                  {currentQuestion?.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion?.id] || loading}
              >
                {loading ? "Submitting..." : currentQuestionIndex === questions.length - 1 ? "Submit Quiz" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-success">Quiz Completed!</CardTitle>
          <CardDescription>Thank you for participating</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>Your quiz has been submitted successfully.</p>
          <Link to="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;