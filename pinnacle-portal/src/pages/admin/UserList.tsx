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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import EditUserDialog from './EditUserDialog'; // Import the dialog
import { categories } from '@/data/categories'; // Import static categories
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'; // Import Select components
import { Label } from '../../components/ui/label'; // Import Label component
import { Checkbox } from '../../components/ui/checkbox'; // Import Checkbox component

interface User {
  _id: string;
  name: string;
  email: string;
  college: string;
  mobile: string;
  role: 'student' | 'admin';
  interestedCategories: string[]; // Add interestedCategories
}

const UserList = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All'); // New state for category filter
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]); // New state for selected user IDs

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Pass selectedCategory to the backend service
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
  }, [page, selectedCategory]); // Re-fetch users when page or selectedCategory changes

  // Reset selectedUserIds when page or category changes
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
    setIsDialogOpen(true);
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

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {/* <h2 className="text-2xl font-bold">User Management</h2> */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="category-filter">Filter by Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter" className="w-[180px]">
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
        </div>
      </div>
      <div className="rounded-lg border">
        {/* Mobile View: Card-based */}
        <div className="grid gap-4 md:hidden p-4">
          {users.map((user) => (
            <div key={user._id} className="flex flex-col space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{user.name}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleUpdateUserClick(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-sm">Role: {user.role}</div>
              <div className="text-sm">College: {user.college}</div>
              <div className="text-sm">Mobile: {user.mobile}</div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table-based */}
        <Table className="hidden md:table">
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
            <PaginationPrevious
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {[...Array(pages).keys()].map((p) => (
            <PaginationItem key={p + 1}>
              <PaginationLink onClick={() => setPage(p + 1)} isActive={page === p + 1}>
                {p + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              className={page === pages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <EditUserDialog
        user={editingUser}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUserUpdated={handleUserUpdated}
      />
    </>
  );
};

export default UserList;

