import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const role = searchParams.get('role') as 'mother' | 'vendor' | 'admin' || 'mother';
  const isAdminLogin = role === 'admin';
  
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set admin email when role is admin
  useEffect(() => {
    if (isAdminLogin) {
      setEmail('admin@yourdomain.com');
      setIsSignUp(false); // Always sign in for admin
    }
  }, [isAdminLogin]);

  // Redirect is handled by useAuth hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isAdminLogin) {
        // Admin login - check if admin exists, if not, create account
        if (email !== 'admin@yourdomain.com') {
          toast({
            title: "Access Denied",
            description: "Only admin@yourdomain.com can access the admin panel.",
            variant: "destructive"
          });
          return;
        }
        
        const { error } = await signIn(email, password);
        if (error) {
          // If admin doesn't exist, show helpful message
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Admin account not found",
              description: "Please create the admin account first through Supabase dashboard or contact system administrator.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Admin login failed",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      } else if (isSignUp) {
        const { error } = await signUp(email, password, role);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Try signing in instead.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const roleTitle = isAdminLogin ? 'Admin' : role === 'mother' ? 'Mom' : 'Vendor';
  const roleDescription = isAdminLogin 
    ? 'Access the admin panel to manage offers and site content' 
    : role === 'mother' 
      ? 'Find amazing deals for your little ones' 
      : 'Sell your products to loving families';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isAdminLogin 
              ? 'Admin Login' 
              : isSignUp 
                ? `Join as a ${roleTitle}` 
                : `Welcome back, ${roleTitle}`
            }
          </CardTitle>
          <CardDescription>
            {roleDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={isAdminLogin ? "admin@yourdomain.com" : "Enter your email"}
                disabled={isAdminLogin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              variant={isAdminLogin ? 'destructive' : role === 'mother' ? 'default' : 'secondary'}
            >
              {loading ? 'Please wait...' : isAdminLogin ? 'Admin Login' : isSignUp ? `Sign up as ${roleTitle}` : 'Sign in'}
            </Button>
          </form>
          
          {!isAdminLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;