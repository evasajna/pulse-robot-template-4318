import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";

const questionSchema = z.object({
  question_text: z.string().min(10, "Question must be at least 10 characters"),
  option1: z.string().min(1, "Option 1 is required"),
  option2: z.string().min(1, "Option 2 is required"),
  option3: z.string().min(1, "Option 3 is required"),
  option4: z.string().min(1, "Option 4 is required"),
  correct_answer: z.string().min(1, "Correct answer is required"),
  quiz_id: z.string().min(1, "Quiz selection is required"),
});

type QuestionForm = z.infer<typeof questionSchema>;

interface Question {
  id: string;
  question_text: string;
  options: any;
  correct_answer: string;
  quiz_id: string;
}

interface Quiz {
  id: string;
  title: string;
  status: string;
}

const AdminQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
  });

  useEffect(() => {
    fetchQuizzes();
    fetchQuestions();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quizzes.",
        variant: "destructive",
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const formattedQuestions = data?.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
      })) || [];
      setQuestions(formattedQuestions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load questions.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: QuestionForm) => {
    setLoading(true);
    try {
      const options = [data.option1, data.option2, data.option3, data.option4];
      
      const { error } = await supabase
        .from("questions")
        .insert({
          question_text: data.question_text,
          options: options,
          correct_answer: data.correct_answer,
          quiz_id: data.quiz_id,
          question_type: "multiple_choice",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question added successfully!",
      });

      form.reset();
      setShowAddForm(false);
      fetchQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully!",
      });

      fetchQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question.",
        variant: "destructive",
      });
    }
  };

  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz ? quiz.title : "Unknown Quiz";
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Question Management</h1>
            <p className="text-muted-foreground">Create and manage quiz questions</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showAddForm ? "Cancel" : "Add Question"}
          </Button>
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
              <CardDescription>Create a new multiple-choice question</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="quiz_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiz</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a quiz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {quizzes.map((quiz) => (
                              <SelectItem key={quiz.id} value={quiz.id}>
                                {quiz.title} ({quiz.status})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="question_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the question..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="option1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Option 1</FormLabel>
                          <FormControl>
                            <Input placeholder="First option" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="option2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Option 2</FormLabel>
                          <FormControl>
                            <Input placeholder="Second option" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="option3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Option 3</FormLabel>
                          <FormControl>
                            <Input placeholder="Third option" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="option4"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Option 4</FormLabel>
                          <FormControl>
                            <Input placeholder="Fourth option" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="correct_answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter the exact correct answer option" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Adding..." : "Add Question"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Questions ({questions.length})</CardTitle>
            <CardDescription>Manage existing quiz questions</CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No questions found. Add your first question above.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{getQuizTitle(question.quiz_id)}</Badge>
                        </div>
                        <h3 className="font-semibold mb-2">{question.question_text}</h3>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          {question.options.map((option, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded border ${
                                option === question.correct_answer 
                                  ? "bg-success/10 border-success text-success-foreground" 
                                  : "bg-muted"
                              }`}
                            >
                              {index + 1}. {option}
                              {option === question.correct_answer && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminQuestions;