import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminQuizService from '../../services/adminQuizService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  marks: number; // New field for marks
}

const ManageQuestions = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');
  const [newMarks, setNewMarks] = useState(1); // New state for marks of new question
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>(['', '', '', '']);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');
  const [editMarks, setEditMarks] = useState(1); // New state for marks of edited question

  useEffect(() => {
    if (!quizId) {
      setError('Quiz ID is missing.');
      setLoading(false);
      return;
    }

            const fetchQuizDetailsAndQuestions = async () => {
          try {
            // Fetch quiz details for title and totalMarks
            const quizResponse = await adminQuizService.getQuizById(quizId);
            setQuizTitle(quizResponse.data.title);
    
            // Fetch questions for the quiz
            // The questions are now populated directly from the getQuizById call
            if (quizResponse.data.questions && quizResponse.data.questions.length > 0) {
                setQuestions(quizResponse.data.questions);
            } else {
                setQuestions([]);
            }
    
            setLoading(false);
          } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch quiz details and questions.');
            setLoading(false);
          }
        };
    fetchQuizDetailsAndQuestions();
  }, [quizId]);

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) return;

    // Basic validation
    if (!newQuestionText || newOptions.some(opt => !opt) || !newCorrectAnswer || newMarks <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all fields for the question, options, and provide valid marks.',
        variant: 'destructive',
      });
      return;
    }
    if (!newOptions.includes(newCorrectAnswer)) {
        toast({
            title: 'Validation Error',
            description: 'Correct answer must be one of the provided options.',
            variant: 'destructive',
        });
        return;
    }

    try {
      const addedQuestion = await adminQuizService.addQuestionToQuiz(quizId, {
        questionText: newQuestionText,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
        marks: newMarks, // Include marks
      });
      setQuestions([...questions, addedQuestion.data]);
      setNewQuestionText('');
      setNewOptions(['', '', '', '']);
      setNewCorrectAnswer('');
      setNewMarks(1); // Reset marks
      setIsAddingQuestion(false);
      toast({
        title: 'Success',
        description: 'Question added successfully!',
      });
    } catch (err: any) {
      console.error("Error adding question:", err); // Log the full error object
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add question.',
        variant: 'destructive',
      });
    }
  };

  const handleEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId || !editingQuestionId) return;

    // Basic validation
    if (!editQuestionText || editOptions.some(opt => !opt) || !editCorrectAnswer || editMarks <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all fields for the question, options, and provide valid marks.',
          variant: 'destructive',
        });
        return;
    }
    if (!editOptions.includes(editCorrectAnswer)) {
        toast({
            title: 'Validation Error',
            description: 'Correct answer must be one of the provided options.',
            variant: 'destructive',
        });
        return;
    }

    try {
      const updatedQuestion = await adminQuizService.updateQuestionInQuiz(quizId, editingQuestionId, {
        questionText: editQuestionText,
        options: editOptions,
        correctAnswer: editCorrectAnswer,
        marks: editMarks, // Include marks
      });
      setQuestions(questions.map(q => (q._id === editingQuestionId ? updatedQuestion.data : q)));
      setEditingQuestionId(null);
      setEditQuestionText('');
      setEditOptions(['', '', '', '']);
      setEditCorrectAnswer('');
      setEditMarks(1); // Reset marks
      toast({
        title: 'Success',
        description: 'Question updated successfully!',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update question.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!quizId) return;
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await adminQuizService.deleteQuestionFromQuiz(quizId, questionId);
        setQuestions(questions.filter(q => q._id !== questionId));
        toast({
          title: 'Success',
          description: 'Question deleted successfully!',
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Failed to delete question.',
          variant: 'destructive',
        });
      }
    }
  };

  const startEditing = (question: Question) => {
    setEditingQuestionId(question._id);
    setEditQuestionText(question.questionText);
    setEditOptions(question.options);
    setEditCorrectAnswer(question.correctAnswer);
    setEditMarks(question.marks); // Set marks for editing
  };

  if (loading) return <div>Loading quiz questions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!quizId) return <div className="text-red-500">No Quiz ID provided.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Questions for "{quizTitle}"</h1>
        <Button onClick={() => navigate('/admin/quizzes')} variant="outline">Back to Quizzes</Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Existing Questions ({questions.length})</CardTitle>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setIsAddingQuestion(!isAddingQuestion)} size="sm" variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              {isAddingQuestion ? 'Cancel Add' : 'Add New Question'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-center text-gray-500">No questions added yet. Click "Add New Question" to start.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {questions.map((question, index) => (
                <AccordionItem value={question._id} key={question._id}>
                  <AccordionTrigger>
                    <span className="font-medium mr-2">Q{index + 1}:</span> {question.questionText} ({question.marks} marks)
                  </AccordionTrigger>
                  <AccordionContent>
                    {editingQuestionId === question._id ? (
                        <form onSubmit={handleEditQuestion} className="space-y-4 p-4 border rounded-md bg-gray-50">
                            <div>
                                <Label htmlFor={`edit-question-text-${question._id}`}>Question Text</Label>
                                <Textarea
                                    id={`edit-question-text-${question._id}`}
                                    value={editQuestionText}
                                    onChange={(e) => setEditQuestionText(e.target.value)}
                                    required
                                />
                            </div>
                            {editOptions.map((option, optIndex) => (
                                <div key={optIndex}>
                                    <Label htmlFor={`edit-option-${question._id}-${optIndex}`}>Option {optIndex + 1}</Label>
                                    <Input
                                        id={`edit-option-${question._id}-${optIndex}`}
                                        value={option}
                                        onChange={(e) => {
                                            const updated = [...editOptions];
                                            updated[optIndex] = e.target.value;
                                            setEditOptions(updated);
                                        }}
                                        required
                                    />
                                </div>
                            ))}
                            <div>
                                <Label htmlFor={`edit-correct-answer-${question._id}`}>Correct Answer</Label>
                                <Input
                                    id={`edit-correct-answer-${question._id}`}
                                    value={editCorrectAnswer}
                                    onChange={(e) => setEditCorrectAnswer(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor={`edit-marks-${question._id}`}>Marks</Label>
                                <Input
                                    id={`edit-marks-${question._id}`}
                                    type="number"
                                    value={editMarks}
                                    onChange={(e) => setEditMarks(Number(e.target.value))}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="submit">Update Question</Button>
                                <Button variant="outline" onClick={() => setEditingQuestionId(null)}>Cancel</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-2">
                            <p className="font-semibold">Options:</p>
                            <ul className="list-disc pl-5">
                            {question.options.map((option, optIndex) => (
                                <li key={optIndex}>{option}</li>
                            ))}
                            </ul>
                            <p className="font-semibold">Correct Answer: <span className="text-green-600">{question.correctAnswer}</span></p>
                            <p className="font-semibold">Marks: {question.marks}</p>
                            <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => startEditing(question)}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question._id)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {isAddingQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>Fill in the details for your new question.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <Label htmlFor="new-question-text">Question Text</Label>
                <Textarea
                  id="new-question-text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  required
                />
              </div>
              <p className="font-semibold pt-2">Options (4 required):</p>
              {newOptions.map((option, index) => (
                <div key={index}>
                  <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                  <Input
                    id={`option-${index}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}
              <div>
                <Label htmlFor="new-correct-answer">Correct Answer (must match one of the options)</Label>
                <Input
                  id="new-correct-answer"
                  value={newCorrectAnswer}
                  onChange={(e) => setNewCorrectAnswer(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-marks">Marks</Label>
                <Input
                  id="new-marks"
                  type="number"
                  value={newMarks}
                  onChange={(e) => setNewMarks(Number(e.target.value))}
                  required
                  min="1"
                />
              </div>
              <Button type="submit" className="w-full">Add Question</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageQuestions;
