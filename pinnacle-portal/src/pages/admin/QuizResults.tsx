import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminQuizService from '../../services/adminQuizService';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface QuizResult {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  quiz: {
    _id: string;
    title: string;
    accessCode: string;
    totalMarks: number;
  };
  score: number;
  createdAt: string;
}

const QuizResults = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState('');
  const [overallTotalMarks, setOverallTotalMarks] = useState(0); // New state for overall total marks
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setError('Quiz ID is missing.');
      setLoading(false);
      return;
    }

    const fetchQuizResults = async () => {
      try {
        const response = await adminQuizService.getQuizResults(quizId);
        setQuizTitle(response.data.quizTitle);
        setOverallTotalMarks(response.data.totalMarks); // Set overall total marks from response
        setResults(response.data.results);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch quiz results.');
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [quizId]);

  if (loading) return <div>Loading quiz results...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!quizId) return <div className="text-red-500">No Quiz ID provided.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Results for "{quizTitle}"</h1>
        {overallTotalMarks > 0 && (
            <span className="text-xl font-semibold">Total Quiz Marks: {overallTotalMarks}</span>
        )}
        <Button onClick={() => navigate('/admin/quizzes')} variant="outline">Back to Quizzes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-center text-gray-500">No results found for this quiz yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Email</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Attempt Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell>{result.user.name}</TableCell>
                    <TableCell>{result.user.email}</TableCell>
                    <TableCell>{result.score} / {overallTotalMarks}</TableCell>
                    <TableCell>{new Date(result.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
