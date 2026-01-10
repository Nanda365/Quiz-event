import React, { useState, useEffect } from 'react';
import adminUserService from '../../services/adminUserService';
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
} from '../../components/ui/pagination';
import { Edit, Trash2, Mail } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import EditUserDialog from './EditUserDialog';
import EmailDialog from './EmailDialog';
import { categories } from '@/data/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';

interface User {
  _id: string;
  name: string;
  email: string;
  college: string;
  mobile: string;
  role: 'student' | 'admin';
  interestedCategories: string[];
}

const UserList = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await adminUserService.getAllUsers(page, selectedCategory);
        setUsers(data.users);
        setPage(data.page);
        setPages(data.pages);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch users.');
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, selectedCategory]);

  useEffect(() => {
    setSelectedUserIds([]);
  }, [page, selectedCategory]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map(user => user._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;

  const handleUpdateUserClick = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminUserService.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        toast({ title: 'Success', description: 'User deleted successfully.' });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Failed to delete user.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleOpenEmailDialog = (userIds: string[]) => {
    setEmailRecipients(userIds);
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = async (subject: string, message: string) => {
    try {
      await adminUserService.sendEmailToUsers({ userIds: emailRecipients, subject, message });
      toast({
        title: 'Success',
        description: `Email sent to ${emailRecipients.length} user(s).`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to send email.',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4 flex-wrap md:flex-nowrap">
        <div className="flex items-center space-x-2">
          <Label htmlFor="category-filter">Filter by Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => handleOpenEmailDialog(selectedUserIds)}
            disabled={selectedUserIds.length === 0}
            className="flex-shrink-0"
          >
            <Mail className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Send Email to Selected ({selectedUserIds.length})</span>
          </Button>
        </div>
      </div>
      <div className="rounded-lg border">
        {/* ... (Mobile View remains the same for brevity) ... */}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>College</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Interested Categories</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUserIds.includes(user._id)}
                    onCheckedChange={(checked) => handleSelectUser(user._id, checked as boolean)}
                    aria-label={`Select ${user.name}`}
                  />
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.college}</TableCell>
                <TableCell>{user.state}</TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.interestedCategories ? user.interestedCategories.join(', ') : 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenEmailDialog([user._id])}>
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleUpdateUserClick(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
          </PaginationItem>
          <PaginationItem>
            <span className="mx-2 text-sm font-medium">
              Page {page} of {pages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              onClick={() => setPage(prev => Math.min(prev + 1, pages))}
              disabled={page === pages}
            >
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <EditUserDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUserUpdated={handleUserUpdated}
      />
      <EmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        onSend={handleSendEmail}
        recipientCount={emailRecipients.length}
      />
    </>
  );
};

export default UserList;

