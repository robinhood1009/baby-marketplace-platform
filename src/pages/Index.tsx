import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { 
  ExternalLink,
  Clock,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import heroBanner from '@/assets/hero-family-banner.jpg';
import momBabyPromo from '@/assets/mom-baby-promo.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [essentialsOffers, setEssentialsOffers] = useState<any[]>([]);
  const [toysOffers, setToysOffers] = useState<any[]>([]);
  const [newOffers, setNewOffers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fetch offers and vendors
  useEffect(() => {
    const fetchData = async () => {
      // Essentials offers
      const { data: essentials } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'approved')
        .eq('category', 'essentials')
        .limit(6);
      
      if (essentials) setEssentialsOffers(essentials);

      // Toys offers (using "toys" category)
      const { data: toys } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'approved')
        .eq('category', 'toys')
        .limit(6);
      
      if (toys) setToysOffers(toys);

      // New this week
      const { data: newThisWeek } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (newThisWeek) setNewOffers(newThisWeek);

      // Get unique vendors from offers
      const { data: allOffers } = await supabase
        .from('offers')
        .select('vendor_id')
        .eq('status', 'approved')
        .not('vendor_id', 'is', null);
      
      if (allOffers) {
        const uniqueVendors = [...new Set(allOffers.map(o => o.vendor_id))];
        setVendors(uniqueVendors.slice(0, 8));
      }
    };
    
    fetchData();
  }, []);

  const scrollToOffers = () => {
    const element = document.getElementById('offers-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d left`;
    return `${hours}h left`;
  };

  const handleOfferClick = (affiliateLink: string | null) => {
    if (affiliateLink) {
      window.open(affiliateLink, '_blank');
    }
  };

  const OfferCard = ({ offer }: { offer: any }) => (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white rounded-lg border-muted">
      <div className="relative overflow-hidden">
        <img
          src={offer.image_url || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop"}
          alt={offer.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {offer.discount_percent && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white font-bold">
            {offer.discount_percent}% OFF
          </Badge>
        )}

        {offer.expires_at && getTimeRemaining(offer.expires_at) && (
          <Badge className="absolute top-3 left-3 bg-orange-500 text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeRemaining(offer.expires_at)}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">
          {offer.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {offer.description}
        </p>

        {offer.price !== null && (
          <div className="mb-3">
            <span className="text-xl font-bold text-primary">
              ${offer.price}
            </span>
          </div>
        )}
        
        <Button 
          onClick={() => handleOfferClick(offer.affiliate_link)}
          className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
          disabled={!offer.affiliate_link}
        >
          Claim Now
        </Button>
      </CardContent>
    </Card>
  );

  const faqItems = [
    {
      question: "How do I get started with baby deals?",
      answer: "Simply browse our curated offers or sign up to get personalized recommendations based on your baby's age and needs."
    },
    {
      question: "Are all products safe for babies?",
      answer: "Yes! Every product is vetted for safety and quality standards. We only partner with trusted brands that meet strict safety requirements."
    },
    {
      question: "How often do you add new deals?",
      answer: "We add new deals weekly! Sign up for our newsletter to be the first to know about exclusive offers and free samples."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-outfit">
      <Navbar />

      {/* Hero Banner */}
      <section 
        className="relative pt-[20rem] pb-16 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in drop-shadow-lg">
            Exclusive Baby Offers from Trusted Brands
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
            Discounts, free samples & new arrivals for moms — all in one place.
          </p>
          <Button 
            onClick={scrollToOffers}
            className="bg-secondary hover:bg-secondary/90 text-gray-800 px-8 py-4 text-lg font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-lg animate-fade-in"
            size="lg"
            style={{ animationDelay: '0.4s' }}
          >
            Explore All Deals
          </Button>
        </div>
      </section>

      {/* Vendor Logos Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Trusted by Leading Baby Brands
          </h2>
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
            {vendors.map((vendorId, index) => (
              <div 
                key={vendorId} 
                className="flex-shrink-0 w-32 h-20 bg-white rounded-lg shadow-md border border-muted flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <span className="text-sm font-semibold text-gray-600">Brand {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Sections */}
      <section id="offers-section" className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Baby Essentials */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Baby Essentials</h2>
              <Button 
                variant="outline"
                onClick={() => navigate('/offers?category=essentials')}
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                View All <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:hidden">
              {essentialsOffers.slice(0, 3).map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
            <div className="hidden md:flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
              {essentialsOffers.map((offer) => (
                <div key={offer.id} className="flex-shrink-0 w-80">
                  <OfferCard offer={offer} />
                </div>
              ))}
            </div>
          </div>

          {/* Toys & Learning */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Toys & Learning</h2>
              <Button 
                variant="outline"
                onClick={() => navigate('/offers?category=toys')}
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                View All <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:hidden">
              {toysOffers.slice(0, 3).map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
            <div className="hidden md:flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
              {toysOffers.map((offer) => (
                <div key={offer.id} className="flex-shrink-0 w-80">
                  <OfferCard offer={offer} />
                </div>
              ))}
            </div>
          </div>

          {/* New This Week */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">New This Week</h2>
              <Button 
                variant="outline"
                onClick={() => navigate('/offers')}
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                View All <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:hidden">
              {newOffers.slice(0, 3).map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
            <div className="hidden md:flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
              {newOffers.map((offer) => (
                <div key={offer.id} className="flex-shrink-0 w-80">
                  <OfferCard offer={offer} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promo Block */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Save time, get samples, and enjoy verified baby deals curated weekly.
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of moms who trust us to find the best baby products at unbeatable prices. 
                Get personalized recommendations and exclusive access to free samples.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/auth?role=mother')}
                  className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-full hover:scale-105 transition-all"
                >
                  Join as Mom
                </Button>
                <Button 
                  onClick={() => navigate('/auth?role=vendor')}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-full hover:scale-105 transition-all"
                >
                  Partner with Us
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src={momBabyPromo}
                alt="Happy mom with baby"
                className="w-full max-w-md rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">BabyBag Deals</h3>
              <p className="text-gray-400">
                Your trusted source for baby deals, samples, and trusted brand recommendations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => navigate('/offers')} className="hover:text-white transition-colors">Browse Offers</button></li>
                <li><button onClick={() => navigate('/saved-offers')} className="hover:text-white transition-colors">My Saved Offers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">FAQ</h4>
              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <div key={index}>
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="flex items-center justify-between w-full text-left text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="text-sm">{item.question}</span>
                      {openFaq === index ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <p className="text-sm text-gray-500 mt-2 pr-4">
                        {item.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BabyBag Deals. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;