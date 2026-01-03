import React, { useState, useEffect } from 'react';
import adminQuizService from '../../services/adminQuizService';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { categories } from '@/data/categories'; // Restore import of hardcoded categories

const EditQuiz = () => {
  const { quizId } = useParams();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState('draft');
  const [category, setCategory] = useState(''); // State for category
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (quizId) {
          const response = await adminQuizService.getQuizById(quizId);
          const quiz = response.data;
          setTitle(quiz.title);
          setDuration(quiz.duration);
          setStatus(quiz.status);
          // Set category, ensuring it's one of the predefined ones or a default
          if (categories.includes(quiz.category)) {
            setCategory(quiz.category);
          } else if (categories.length > 0) {
            setCategory(categories[0]); // Default to first available
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch quiz data.');
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(quizId) {
        await adminQuizService.updateQuiz(quizId, {
          title,
          duration,
          status,
          category, // Include category in update
        });
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update quiz');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Quiz</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (in minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <Button type="submit">Update Quiz</Button>
      </form>
    </div>
  );
};

export default EditQuiz;
