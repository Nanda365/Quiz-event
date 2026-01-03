import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import logo from '@/assests/Login page.png';
import { categories } from '@/data/categories'; // Import categories

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  college: z.string().trim().min(2, "College name is required").max(200),
  state: z.string().trim().min(2, "State is required").max(100),
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters").max(50),
  interestedCategories: z.array(z.string()).min(1, "Please select at least one category").optional(),
});

interface RegisterProps {
  onRegister: (
    name: string,
    email: string,
    college: string,
    state: string,
    mobile: string,
    password: string,
    interestedCategories: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

export const Register = ({ onRegister, isLoading }: RegisterProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    state: "",
    mobile: "",
    password: "",
    interestedCategories: [] as string[]
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    // Categories are hardcoded now, so no async fetch is truly needed.
    // This is just to simulate the async behavior if we later switch to API.
    setAvailableCategories(categories);
    setIsLoadingCategories(false);
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    const result = await onRegister(
      formData.name,
      formData.email,
      formData.college,
      formData.state,
      formData.mobile,
      formData.password,
      formData.interestedCategories
    );    
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  const handleCategoryChange = (category: string, isChecked: boolean) => {
    setFormData(prev => {
      const updatedCategories = isChecked
        ? [...prev.interestedCategories, category]
        : prev.interestedCategories.filter(c => c !== category);
      return { ...prev, interestedCategories: updatedCategories };
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isAuthenticated={false} onLogout={() => {}} />

      <main className="flex w-full flex-1">
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary to-secondary">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h1 className="mt-20 mb-4 text-4xl font-bold">Join the Arena: Pinnacle 2025</h1>
            <p className="mb-4 text-center text-lg text-primary-foreground/80">
              Register now and prove your skills against the best.
            </p>
            <img src={logo} alt="Pinnacle Logo" className="mb-2 h-25 w-25" />
          </div>
        </div>
        
        <div className="flex w-full items-center justify-center p-4 py-12 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-2xl font-bold text-primary">Create an Account</h1>
                <p className="text-sm text-text-secondary">Register for Pinnacle 2025</p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-text-secondary">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="John Doe"
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College Name</Label>
                  <Input
                    id="college"
                    type="text"
                    value={formData.college}
                    onChange={(e) => handleChange("college", e.target.value)}
                    placeholder="Your College"
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.college && <p className className="text-xs text-destructive">{fieldErrors.college}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    placeholder="Your State"
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.state && <p className="text-xs text-destructive">{fieldErrors.state}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    placeholder="9876543210"
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.mobile && <p className="text-xs text-destructive">{fieldErrors.mobile}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Interested Events</Label>
                  {isLoadingCategories ? (
                    <p>Loading categories...</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {availableCategories.map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={cat}
                            checked={formData.interestedCategories.includes(cat)}
                            onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                            className="form-checkbox h-4 w-4 text-primary rounded"
                            disabled={isLoading}
                          />
                          <label htmlFor={cat} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  {fieldErrors.interestedCategories && <p className="text-xs text-destructive">{fieldErrors.interestedCategories}</p>}
                </div>

                <Button type="submit" className="w-full bg-accent text-primary font-bold hover:bg-accent-hover" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-text-secondary">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};