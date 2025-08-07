import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Menu, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          const allCategories = [...(categoriesData || []), { name: 'All Offers', slug: 'all' }];
          setCategories(allCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      // Fetch user profile if logged in
      if (!user) {
        setUserRole(null);
        return;
      }

      // Treat the special admin account by email
      const email = user.email?.toLowerCase();
      if (email === 'admin@yourdomain.com') {
        setUserRole('admin');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setUserRole(profile?.role || null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchData();
  }, [user]);

  const getCategoryFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || '';
  };

  const activeCategory = getCategoryFromUrl();

  const handleCategoryClick = (category: any) => {
    if (category.slug === 'all') {
      navigate('/offers');
    } else {
      navigate(`/offers?category=${encodeURIComponent(category.slug)}`);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "You have been signed out."
        });
        navigate('/');
        setIsMenuOpen(false);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "Something went wrong.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/offers?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Browse Offers', path: '/offers' },
    { label: 'My Saved Offers', path: '/saved-offers', authRequired: true, hideForRoles: ['admin', 'vendor'] },
    { label: 'Vendor Dashboard', path: '/vendor-dashboard', role: 'vendor' },
    { label: 'Admin Panel', path: '/admin', role: 'admin' },
    { label: 'About', path: '/#about' },
    { label: 'Contact', path: '/#contact' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if ((item as any).hideForRoles && userRole && (item as any).hideForRoles.includes(userRole)) return false;
    if (item.authRequired && !user) return false;
    if (item.role && userRole !== item.role) return false;
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card shadow-md font-outfit">
      {/* Top section */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-6 w-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 font-outfit">
                <div className="flex flex-col h-full">
                  {/* Top buttons (only when logged out) */}
                  {!user && (
                    <div className="p-6 border-b border-gray-100">
                      <div className="space-y-3">
                        <Button
                          onClick={() => {
                            navigate('/auth?role=mother');
                            setIsMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white border-0 rounded-xl shadow-lg"
                        >
                          👩 I'm a Mom
                        </Button>
                        <Button
                          onClick={() => {
                            navigate('/auth?role=vendor');
                            setIsMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white border-0 rounded-xl shadow-lg"
                        >
                          🏪 I'm a Vendor
                        </Button>
                        <Button
                          onClick={() => {
                            navigate('/auth?role=admin');
                            setIsMenuOpen(false);
                          }}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-xl shadow-lg"
                        >
                          🔐 Admin Login
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Menu links */}
                  <div className="flex-1 p-6">
                    <div className="space-y-1">
                      {filteredMenuItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            if (item.path.startsWith('/#')) {
                              // Handle anchor links
                              const anchor = item.path.substring(2);
                              navigate('/');
                              setTimeout(() => {
                                const element = document.getElementById(anchor);
                                element?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            } else {
                              navigate(item.path);
                            }
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 font-medium"
                        >
                          {item.label}
                        </button>
                      ))}
                      
                      {/* Sign out button if user is logged in */}
                      {user && (
                        <>
                          <div className="border-t border-gray-200 mt-4 pt-4">
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 font-medium flex items-center gap-3"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Center: Logo */}
            <div 
              className="cursor-pointer flex items-center"
              onClick={() => navigate('/')}
            >
              <h1 className="text-2xl font-bold text-primary">
                my-babydays
              </h1>
            </div>

            {/* Right: Account menu and Search */}
            <div className="flex items-center gap-2">
              {/* Account Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-foreground">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex flex-col items-start">
                      <div className="font-medium">{user.email}</div>
                      {userRole && (
                        <div className="text-sm text-muted-foreground capitalize">{userRole}</div>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/onboarding')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/auth')}
                      className="text-foreground"
                    >
                      Log In
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => navigate('/auth')}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Sign Up
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/auth?role=admin')}
                      className="text-foreground"
                    >
                      Admin Login
                    </Button>
                  </div>
              )}
              
              {/* Search icon */}
              <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Search className="h-6 w-6 text-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md font-outfit">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold">Search Offers</h2>
                      <Input
                        placeholder="Search for baby products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                        Search
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsSearchOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Category navigation */}
      <div className="bg-muted/50 backdrop-blur-sm border-b border-border">
        <div className="w-full">
          <div className="flex items-center justify-center py-3 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 justify-center">
              {categories.map((category) => {
                const isActive = 
                  (category.slug === 'all' && location.pathname === '/offers' && !activeCategory) ||
                  activeCategory === category.slug;
                
                return (
                  <button
                    key={category.slug}
                    onClick={() => handleCategoryClick(category)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold border-b-2 border-primary shadow-sm'
                        : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};