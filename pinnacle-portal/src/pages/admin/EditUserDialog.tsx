import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import adminUserService from '../../services/adminUserService';
import { User } from '@/types';
import { categories } from '@/data/categories'; // Import static categories

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

const EditUserDialog = ({ user, isOpen, onClose, onUserUpdated }: EditUserDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    state: '', // Add state to formData
    mobile: '',
    interestedCategories: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        college: user.college || '',
        state: user.state || '', // Initialize state with user's state
        mobile: user.mobile || '',
        interestedCategories: user.interestedCategories || [],
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category: string, isChecked: boolean) => {
    setFormData((prev) => {
      const updatedCategories = isChecked
        ? [...prev.interestedCategories, category]
        : prev.interestedCategories.filter((c) => c !== category);
      return { ...prev, interestedCategories: updatedCategories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: updatedUser } = await adminUserService.updateUser(user._id, formData); // Pass all formData
      onUserUpdated(updatedUser);
      onClose();
      toast({ title: 'Success', description: 'User updated successfully.' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="college">College</Label>
            <Input id="college" name="college" value={formData.college} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" value={formData.state} onChange={handleChange} />
          </div>
          <div>
            <Label>Interested Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${cat}`}
                    checked={formData.interestedCategories.includes(cat)}
                    onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                    className="form-checkbox h-4 w-4 text-primary rounded"
                  />
                  <Label htmlFor={`category-${cat}`}>{cat}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
