import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Menu, Search, X } from 'lucide-react';

const categories = [
  'Essentials',
  'Feeding', 
  'Diapers',
  'Toys & Play',
  'Care',
  'Health',
  'Clothing',
  'All Offers'
];

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserRole(null);
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

    fetchUserProfile();
  }, [user]);

  const getCategoryFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || '';
  };

  const activeCategory = getCategoryFromUrl();

  const handleCategoryClick = (category: string) => {
    if (category === 'All Offers') {
      navigate('/offers');
    } else {
      navigate(`/offers?category=${encodeURIComponent(category)}`);
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
    { label: 'My Saved Offers', path: '/saved-offers', authRequired: true },
    { label: 'Vendor Dashboard', path: '/vendor-dashboard', role: 'vendor' },
    { label: 'About', path: '/#about' },
    { label: 'Contact', path: '/#contact' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.role && userRole !== item.role) return false;
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md font-outfit">
      {/* Top section */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-6 w-6 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 font-outfit">
                <div className="flex flex-col h-full">
                  {/* Top buttons */}
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
                    </div>
                  </div>

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                BabyBag Deals
              </h1>
            </div>

            {/* Right: Search icon */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Search className="h-6 w-6 text-gray-700" />
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

      {/* Bottom section: Category navigation */}
      <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-3 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 min-w-max">
              {categories.map((category) => {
                const isActive = 
                  (category === 'All Offers' && location.pathname === '/offers' && !activeCategory) ||
                  activeCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold border-b-2 border-primary shadow-sm'
                        : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {category}
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