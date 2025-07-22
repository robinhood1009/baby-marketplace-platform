import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Filter, ExternalLink, Star } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  age_range: string;
  category: string;
  affiliate_link: string | null;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
}

const Offers = () => {
  const { signOut, user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [userAgeGroup, setUserAgeGroup] = useState<string | null>(null);

  const ageRanges = ['0-6 months', '6-12 months', '12-36 months', '0-24 months', '3-18 months', '18-36 months'];
  const categories = ['Food & Nutrition', 'Toys & Development', 'Health & Safety', 'Books & Resources', 'Furniture & Gear'];

  useEffect(() => {
    fetchOffers();
    if (user) {
      getUserProfile();
    }
  }, [user]);

  useEffect(() => {
    filterOffers();
  }, [offers, selectedAgeRange, selectedCategory]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('baby_age')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.baby_age) {
        setUserAgeGroup(data.baby_age);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const filterOffers = () => {
    let filtered = offers;

    if (selectedAgeRange !== 'all') {
      filtered = filtered.filter(offer => offer.age_range === selectedAgeRange);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(offer => offer.category === selectedCategory);
    }

    setFilteredOffers(filtered);
  };

  const resetToUserAge = () => {
    // Map user age groups to offer age ranges
    const ageMapping: { [key: string]: string } = {
      '0-3 months': '0-6 months',
      '3-6 months': '6-12 months', 
      '6-12 months': '6-12 months',
      '1-2 years': '12-36 months',
      '2-3 years': '12-36 months',
      '3+ years': '12-36 months'
    };

    if (userAgeGroup && ageMapping[userAgeGroup]) {
      setSelectedAgeRange(ageMapping[userAgeGroup]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading amazing offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9EB6CF]/10 via-background to-[#9CD2C3]/10">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 animate-fade-in">
              ✨ Special Baby Offers
            </h1>
            <p className="text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Discover amazing deals curated just for you and your little one
            </p>
            {userAgeGroup && (
              <Badge variant="secondary" className="mt-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Your baby: {userAgeGroup}
              </Badge>
            )}
          </div>
          {user && (
            <Button onClick={signOut} variant="outline" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Sign Out
            </Button>
          )}
        </header>

        {/* Filters */}
        <div className="mb-8 p-6 bg-card rounded-2xl border-2 border-[#9EB6CF]/20 shadow-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#9EB6CF]" />
              <span className="text-sm font-medium text-foreground">Filter offers:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Age Range</label>
                <Select value={selectedAgeRange} onValueChange={setSelectedAgeRange}>
                  <SelectTrigger className="w-48 border-[#9EB6CF]/30">
                    <SelectValue placeholder="All ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All age ranges</SelectItem>
                    {ageRanges.map((age) => (
                      <SelectItem key={age} value={age}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 border-[#9EB6CF]/30">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {userAgeGroup && (selectedAgeRange !== 'all' || selectedCategory !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={resetToUserAge}
                className="text-[#9EB6CF] hover:text-[#9EB6CF]/80"
              >
                Reset to your baby's age
              </Button>
            )}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer, index) => (
            <Card 
              key={offer.id} 
              className="group hover:shadow-lg transition-all duration-300 rounded-2xl border-2 border-[#9EB6CF]/20 overflow-hidden animate-fade-in hover:scale-105" 
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className="relative">
                {offer.image_url && (
                  <img 
                    src={offer.image_url} 
                    alt={offer.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {offer.is_featured && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {offer.title}
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {offer.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge 
                    className="bg-[#9CD2C3]/20 text-[#9CD2C3] border-[#9CD2C3]/30"
                  >
                    {offer.age_range}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {offer.category}
                  </Badge>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-[#9EB6CF] to-[#9CD2C3] hover:from-[#9EB6CF]/90 hover:to-[#9CD2C3]/90 text-white font-semibold rounded-xl"
                  onClick={() => {
                    if (offer.affiliate_link) {
                      window.open(offer.affiliate_link, '_blank');
                    }
                  }}
                  disabled={!offer.affiliate_link}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Offer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-6xl mb-4">🍼</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No offers found
            </h3>
            <p className="text-muted-foreground text-lg mb-6">
              We couldn't find any offers matching your current filters.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedAgeRange('all');
                setSelectedCategory('all');
              }}
              className="border-[#9EB6CF]/30 hover:bg-[#9EB6CF]/10"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;