import React, { useState, useEffect } from 'react';
import adminQuizService from '../../services/adminQuizService';
import { useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast'; 
import { categories } from '@/data/categories'; // Restore import of hardcoded categories

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState('draft');
  const [category, setCategory] = useState(categories[0] || ''); // Set default to first predefined category
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]); // Ensure selected category is valid
    }
  }, [category]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await adminQuizService.createQuiz({
        title,
        duration,
        status,
        category,
      });
      const createdQuiz = response.data; // Extract the actual quiz data
      toast({
        title: "Quiz Created!",
        description: `Quiz "${createdQuiz.title}" created successfully. Access Code: ${createdQuiz.accessCode}`,
      });
      navigate('/admin/dashboard'); // Navigate to dashboard after toast
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create quiz.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Quiz</h1>
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
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
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
        <Button type="submit">Create Quiz</Button>
      </form>
    </div>
  );
};

export default CreateQuiz;
