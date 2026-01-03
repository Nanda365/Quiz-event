import React, { useEffect, useState } from 'react';
import adminQuizService from '../../services/adminQuizService';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '../../components/ui/pagination';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import UserList from './UserList'; // Import the new UserList component
import { categories } from '@/data/categories'; // Restore import of hardcoded categories

const QuizListSection = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await adminQuizService.getAllQuizzes(page);
        setQuizzes(data.quizzes || []);
        setPage(data.page);
        setPages(data.pages);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch quizzes');
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [page]);

  const handleDelete = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await adminQuizService.deleteQuiz(quizId);
        setQuizzes(quizzes.filter((quiz: any) => quiz._id !== quizId));
      } catch (err) {
        setError('Failed to delete quiz');
      }
    }
  };

  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quizzes</CardTitle>
        <Button asChild>
          <Link to="/admin/quizzes/create">Create Quiz</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Access Code</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz: any) => (
              <TableRow key={quiz._id}>
                <TableCell>{quiz.title}</TableCell>
                <TableCell>
                  <Badge variant={quiz.status === 'published' ? 'default' : 'outline'}>
                    {quiz.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{quiz.accessCode}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button asChild variant="outline" size="sm"><Link to={`/admin/quizzes/${quiz._id}/results`}>Results</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link to={`/admin/quizzes/${quiz._id}/questions`}>Questions</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link to={`/admin/quizzes/edit/${quiz._id}`}>Edit</Link></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(quiz._id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>
                {[...Array(pages).keys()].map((p) => (
                    <PaginationItem key={p + 1}>
                        <PaginationLink onClick={() => setPage(p + 1)} isActive={page === p + 1}>
                            {p + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext onClick={() => setPage(p => Math.min(pages, p + 1))} className={page === pages ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <QuizListSection />
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UserList />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;