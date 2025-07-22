import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Filter, ExternalLink, Star, X } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Available filter options
  const ageRanges = ['0-6 months', '6-12 months', '12-36 months', '0-24 months', '3-18 months', '18-36 months'];
  const categories = ['Food & Nutrition', 'Toys & Development', 'Health & Safety', 'Books & Resources', 'Furniture & Gear'];

  useEffect(() => {
    fetchOffers();
  }, [selectedAgeRange, selectedCategory]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('offers')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedAgeRange !== 'all') {
        query = query.eq('age_range', selectedAgeRange);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-green-50/50">
      <div className="max-w-7xl mx-auto p-6">
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
          {user && (
            <Button onClick={signOut} variant="outline" className="border-[#9EB6CF] hover:bg-[#9EB6CF]/10">
              Sign Out
            </Button>
          )}
        </header>

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

            {(selectedAgeRange !== 'all' || selectedCategory !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedAgeRange('all');
                  setSelectedCategory('all');
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear filters
              </Button>
            )}
          </div>
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

        {/* Offers Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {offers.map((offer, index) => (
              <Card 
                key={offer.id} 
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl border-[#9EB6CF]/30 bg-white/80 backdrop-blur-sm overflow-hidden animate-fade-in"
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
                  {offer.is_featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-[#9EB6CF] transition-colors">
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
                      className="bg-[#9CD2C3]/20 text-[#9CD2C3] border-[#9CD2C3]/30 font-medium"
                    >
                      {offer.age_range}
                    </Badge>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {offer.category}
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-[#9EB6CF] to-[#9CD2C3] hover:from-[#8aa5bd] hover:to-[#8bc4b5] text-white border-0 rounded-xl transition-all duration-300"
                    disabled={!offer.affiliate_link}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Offer
                  </Button>
                </CardContent>
              </Card>
            ))}
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