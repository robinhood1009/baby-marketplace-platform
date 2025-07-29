import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Heart, ExternalLink, Star } from 'lucide-react';

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

const SavedOffers = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [savedOffers, setSavedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth?role=mother');
      return;
    }
    fetchSavedOffers();
  }, [user, navigate]);

  const fetchSavedOffers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          offer_id,
          offers!fk_favorites_offer_id (
            id,
            title,
            description,
            age_range,
            category,
            affiliate_link,
            image_url,
            is_featured,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const offers = data.map(item => item.offers).filter(Boolean) as Offer[];
      setSavedOffers(offers);
    } catch (error) {
      console.error('Error fetching saved offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (offerId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('offer_id', offerId);

      setSavedOffers(prev => prev.filter(offer => offer.id !== offerId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-white to-purple-50/50 font-outfit">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 pt-64">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                My Favorites
              </h1>
              <p className="text-gray-600 text-lg">
                Your favorited deals and products
              </p>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-80"></div>
              </div>
            ))}
          </div>
        )}

        {/* Saved Offers Grid */}
        {!loading && savedOffers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedOffers.map((offer, index) => (
              <Card 
                key={offer.id} 
                className="group transform transition-all duration-300 hover:scale-105 rounded-2xl border-[#9EB6CF]/30 bg-white/80 backdrop-blur-sm overflow-hidden animate-fade-in shadow-lg hover:shadow-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
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
                  {/* Remove Heart Icon */}
                  <button
                    onClick={() => removeFavorite(offer.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 transform hover:scale-110"
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500 hover:scale-125 transition-transform" />
                  </button>
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
                    onClick={() => handleClaimOffer(offer)}
                    disabled={!offer.affiliate_link}
                    className="w-full bg-gradient-to-r from-[#9EB6CF] to-[#9CD2C3] hover:from-[#8aa5bd] hover:to-[#8bc4b5] text-white border-0 rounded-xl transition-all duration-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Claim Offer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && savedOffers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <Heart className="h-24 w-24 mx-auto opacity-30" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-3">
              No favorites yet
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              Start exploring offers and save your favorites by clicking the heart icon
            </p>
            <Button 
              onClick={() => navigate('/offers')}
              className="bg-gradient-to-r from-[#9EB6CF] to-[#9CD2C3] hover:from-[#8aa5bd] hover:to-[#8bc4b5] text-white border-0 px-8 py-3 text-lg rounded-xl"
            >
              Browse Offers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedOffers;