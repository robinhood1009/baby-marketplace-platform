import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Filter, ExternalLink, Star, X, Heart, Bookmark } from 'lucide-react';

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
  discount_percent: number | null;
  price: number | null;
  expires_at: string | null;
}

const Offers = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Available filter options
  const ageRanges = ['0-6 months', '6-12 months', '12-36 months', '0-24 months', '3-18 months', '18-36 months'];
  const categories = ['Food & Nutrition', 'Toys & Development', 'Health & Safety', 'Books & Resources', 'Furniture & Gear'];

  useEffect(() => {
    fetchOffers();
    fetchFeaturedOffers();
    if (user) {
      fetchFavorites();
    }
  }, [selectedAgeRange, selectedCategory, sortBy, user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('offer_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const favoriteIds = new Set(data.map(fav => fav.offer_id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchFeaturedOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedOffers(data || []);
    } catch (error) {
      console.error('Error fetching featured offers:', error);
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('offers')
        .select('*')
        .eq('status', 'approved')
        .eq('is_featured', false); // Only non-featured offers in main grid

      // Apply filters
      if (selectedAgeRange !== 'all') {
        query = query.eq('age_range', selectedAgeRange);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'trending':
          // Get offers with most clicks in last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const { data: trendingData, error: trendingError } = await supabase
            .from('offers')
            .select(`
              *,
              click_logs!inner(
                created_at
              )
            `)
            .eq('status', 'approved')
            .eq('is_featured', false)
            .gte('click_logs.timestamp', sevenDaysAgo.toISOString());
          
          if (trendingError) throw trendingError;
          
          // Count clicks and sort by trending
          const offersWithClickCounts = (trendingData || []).reduce((acc: any[], offer) => {
            const existingOffer = acc.find(o => o.id === offer.id);
            if (existingOffer) {
              existingOffer.clickCount++;
            } else {
              acc.push({ ...offer, clickCount: 1 });
            }
            return acc;
          }, []);
          
          // Apply additional filters for trending
          let filteredTrending = offersWithClickCounts;
          if (selectedAgeRange !== 'all') {
            filteredTrending = filteredTrending.filter(offer => offer.age_range === selectedAgeRange);
          }
          if (selectedCategory !== 'all') {
            filteredTrending = filteredTrending.filter(offer => offer.category === selectedCategory);
          }
          
          // Sort by click count descending
          filteredTrending.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
          
          setOffers(filteredTrending);
          setLoading(false);
          return;
          
        case 'featured':
          query = query.eq('is_featured', true).order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleClaimOffer = async (offer: Offer) => {
    try {
      // Log the click
      await supabase
        .from('click_logs')
        .insert({
          user_id: user?.id || null,
          offer_id: offer.id
        });

      // Open affiliate link
      if (offer.affiliate_link) {
        window.open(offer.affiliate_link, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error logging click:', error);
      // Still open the link even if logging fails
      if (offer.affiliate_link) {
        window.open(offer.affiliate_link, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, offerId: string) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      // Optional: Show toast to sign in
      return;
    }

    const isFavorite = favorites.has(offerId);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('offer_id', offerId);
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(offerId);
          return newFavorites;
        });
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            offer_id: offerId
          });
        
        setFavorites(prev => new Set([...prev, offerId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-green-50/50 font-outfit">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 pt-64">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Baby Offers & Deals
            </h1>
            <p className="text-gray-600 text-lg">
              Discover amazing products for your little one
            </p>
          </div>
          <div className="flex gap-3">
            {user && (
              <Button 
                onClick={() => navigate('/saved-offers')} 
                variant="outline" 
                className="border-[#9EB6CF] hover:bg-[#9EB6CF]/10 flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                My Favorites ({favorites.size})
              </Button>
            )}
            {user && (
              <Button onClick={signOut} variant="outline" className="border-[#9EB6CF] hover:bg-[#9EB6CF]/10">
                Sign Out
              </Button>
            )}
          </div>
        </header>

        {/* Sort Controls */}
        <div className="mb-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#9EB6CF]/20 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 border-[#9EB6CF]/50 focus:border-[#9EB6CF] bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#9EB6CF]/50 shadow-lg">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#9EB6CF]/30 shadow-sm">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Age Range:</label>
              <Select value={selectedAgeRange} onValueChange={setSelectedAgeRange}>
                <SelectTrigger className="w-48 border-[#9EB6CF]/50 focus:border-[#9EB6CF]">
                  <SelectValue placeholder="All age ranges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All age ranges</SelectItem>
                  {ageRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-52 border-[#9EB6CF]/50 focus:border-[#9EB6CF]">
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

            {(selectedAgeRange !== 'all' || selectedCategory !== 'all' || sortBy !== 'newest') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedAgeRange('all');
                  setSelectedCategory('all');
                  setSortBy('newest');
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* Editor's Picks Section */}
        {featuredOffers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">Editor's Picks</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredOffers.map((offer, index) => (
                <Card 
                  key={offer.id} 
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl border-yellow-300/50 bg-gradient-to-br from-yellow-50/80 to-orange-50/80 backdrop-blur-sm overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleOfferClick(offer)}
                >
                  <div className="relative">
                    {offer.image_url && (
                      <img 
                        src={offer.image_url} 
                        alt={offer.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 flex items-center gap-1 shadow-lg">
                        <Star className="h-3 w-3" />
                        Editor's Pick
                      </Badge>
                    </div>
                    {user && (
                      <button
                        onClick={(e) => toggleFavorite(e, offer.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 transform hover:scale-110"
                      >
                        <Heart 
                          className={`h-5 w-5 transition-all duration-300 ${
                            favorites.has(offer.id) 
                              ? 'fill-red-500 text-red-500 animate-heartbeat' 
                              : 'text-gray-400 hover:text-red-400'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {offer.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 line-clamp-2">
                      {offer.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-orange-100 text-orange-700 border-orange-200 font-medium"
                      >
                        {offer.age_range}
                      </Badge>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {offer.category}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 rounded-xl transition-all duration-300 shadow-lg"
                      disabled={!offer.affiliate_link}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Featured Offer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Offers Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Offers</h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-80"></div>
              </div>
            ))}
          </div>
        )}

        
        {!loading && (
          <div className="transition-all duration-500 ease-in-out">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {offers.map((offer, index) => {
                // Calculate days until expiration
                const getDaysUntilExpiry = (expiresAt: string | null) => {
                  if (!expiresAt) return null;
                  const now = new Date();
                  const expiry = new Date(expiresAt);
                  const diffTime = expiry.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays > 0 ? diffDays : null;
                };

                const daysUntilExpiry = getDaysUntilExpiry(offer.expires_at);
                
                return (
                  <Card 
                    key={offer.id} 
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl border-[#9EB6CF]/30 bg-white/80 backdrop-blur-sm overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleOfferClick(offer)}
                  >
                    <div className="relative">
                      {offer.image_url && (
                        <img 
                          src={offer.image_url} 
                          alt={offer.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                      
                      {/* Large Discount Badge - Most Visible Element */}
                      {offer.discount_percent && (
                        <div className="absolute top-0 right-0 bg-gradient-to-br from-red-500 to-red-600 text-white px-5 py-4 rounded-bl-3xl font-bold text-xl shadow-2xl z-20">
                          {offer.discount_percent}% OFF
                        </div>
                      )}
                      
                      {/* Free Sample Badge */}
                      {!offer.discount_percent && offer.price === 0 && (
                        <div className="absolute top-0 right-0 bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-3 rounded-bl-2xl font-bold text-lg shadow-xl z-20">
                          FREE SAMPLE
                        </div>
                      )}
                      
                      {/* Price Badge - Show price above image */}
                      {!offer.discount_percent && offer.price !== null && offer.price > 0 && (
                        <div className="absolute top-0 right-0 bg-gradient-to-br from-[#9EB6CF] to-[#9EB6CF]/80 text-white px-4 py-3 rounded-bl-2xl font-bold text-lg shadow-xl z-20">
                          ${offer.price}
                        </div>
                      )}
                      
                      {/* Expiry Badge */}
                      {daysUntilExpiry && (
                        <div className={`absolute ${offer.discount_percent || offer.price === 0 ? 'top-16' : 'top-0'} left-0 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-2 rounded-br-2xl font-semibold text-sm shadow-lg z-10`}>
                          ⏳ Ends in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                        </div>
                      )}
                      
                      {offer.is_featured && (
                        <div className="absolute top-3 left-3 z-10">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Featured
                          </Badge>
                        </div>
                      )}
                      
                      {/* Heart Icon for Favorites */}
                      {user && (
                        <button
                          onClick={(e) => toggleFavorite(e, offer.id)}
                          className={`absolute ${offer.discount_percent || offer.price === 0 ? 'bottom-3 right-3' : 'top-3 right-3'} p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 transform hover:scale-110 z-10`}
                        >
                          <Heart 
                            className={`h-5 w-5 transition-all duration-300 ${
                              favorites.has(offer.id) 
                                ? 'fill-red-500 text-red-500 animate-heartbeat' 
                                : 'text-gray-400 hover:text-red-400'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      {/* Title - High Priority after image */}
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-[#9EB6CF] transition-colors mb-3">
                        {offer.title}
                      </h3>
                      
                      {/* Category and Age Range Tags */}
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-[#9CD2C3]/20 text-[#9CD2C3] border-[#9CD2C3]/30 font-medium"
                        >
                          {offer.age_range}
                        </Badge>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {offer.category}
                        </span>
                      </div>
                      
                      {/* Description - Lower Priority */}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {offer.description}
                      </p>
                      
                      {/* Bright Mint CTA Button with Hover Grow Animation */}
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white border-0 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 font-semibold py-3 text-base"
                        disabled={!offer.affiliate_link}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaimOffer(offer);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Claim Offer
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && offers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No offers found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters to see more results
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedAgeRange('all');
                setSelectedCategory('all');
              }}
              className="border-[#9EB6CF] text-[#9EB6CF] hover:bg-[#9EB6CF] hover:text-white"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Offer Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {selectedOffer && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl font-bold text-gray-800 pr-4">
                        {selectedOffer.title}
                      </DialogTitle>
                      {selectedOffer.is_featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 flex items-center gap-1 mt-2 w-fit">
                          <Star className="h-3 w-3" />
                          Featured Offer
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Offer Image */}
                  {selectedOffer.image_url && (
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={selectedOffer.image_url} 
                        alt={selectedOffer.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Offer Details */}
                  <div className="space-y-4">
                    <DialogDescription className="text-gray-600 text-base leading-relaxed">
                      {selectedOffer.description}
                    </DialogDescription>

                    <div className="flex flex-wrap gap-3">
                      <Badge 
                        variant="secondary" 
                        className="bg-[#9CD2C3]/20 text-[#9CD2C3] border-[#9CD2C3]/30 font-medium px-3 py-1"
                      >
                        Age: {selectedOffer.age_range}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="border-[#9EB6CF]/50 text-gray-600 px-3 py-1"
                      >
                        {selectedOffer.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => handleClaimOffer(selectedOffer)}
                      disabled={!selectedOffer.affiliate_link}
                      className="flex-1 bg-gradient-to-r from-[#9EB6CF] to-[#9CD2C3] hover:from-[#8aa5bd] hover:to-[#8bc4b5] text-white border-0 animate-pulse-subtle hover:animate-pulse"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Claim Offer
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Offers;