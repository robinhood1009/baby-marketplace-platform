import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Baby, 
  Menu, 
  X, 
  Gift, 
  Shield, 
  Zap,
  ExternalLink,
  Clock,
  Star
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredOffers, setFeaturedOffers] = useState<any[]>([]);
  const [topDiscountOffers, setTopDiscountOffers] = useState<any[]>([]);

  // Fetch featured offers and top discounts
  useEffect(() => {
    const fetchOffers = async () => {
      // Featured offers
      const { data: featured, error: featuredError } = await supabase
        .from('offers')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'approved')
        .limit(6);
      
      if (featured && !featuredError) {
        setFeaturedOffers(featured);
      }

      // Top discount offers
      const { data: discountOffers, error: discountError } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'approved')
        .not('discount_percent', 'is', null)
        .order('discount_percent', { ascending: false })
        .limit(6);
      
      if (discountOffers && !discountError) {
        setTopDiscountOffers(discountOffers);
      }
    };
    
    fetchOffers();
  }, []);

  // Smooth scroll animation on load
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([contactForm]);

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you soon.",
      });

      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'offers', label: 'Offers', onClick: () => navigate('/offers') },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9]" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Baby className="w-8 h-8 text-[#9EB6CF]" />
              <span className="text-xl font-semibold text-gray-900">BabyDeals</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.onClick ? item.onClick() : scrollToSection(item.id)}
                  className="font-medium text-gray-600 hover:text-[#9EB6CF] transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => navigate('/auth')}
                className="bg-[#9EB6CF] hover:bg-[#9EB6CF]/90 text-white"
              >
                Login
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-[#9EB6CF] transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.onClick ? item.onClick() : scrollToSection(item.id)}
                    className="block w-full text-left px-3 py-2 font-medium text-gray-600 hover:text-[#9EB6CF] hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full mt-2 bg-[#9EB6CF] hover:bg-[#9EB6CF]/90 text-white"
                >
                  Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
                Discover Amazing Baby Deals Every Week
              </h1>
              <p className="text-xl text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Get exclusive discounts, free samples, and handpicked baby essentials delivered to your inbox. Save up to 60% on trusted brands your little one will love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button 
                  onClick={() => scrollToSection('offers')} 
                  className="bg-[#9EB6CF] hover:bg-[#9EB6CF]/90 text-white px-8 py-3 text-lg font-semibold"
                  size="lg"
                >
                  View This Week's Deals
                </Button>
                <Button 
                  onClick={() => navigate('/auth')} 
                  variant="outline" 
                  className="border-[#9CD2C3] text-[#9CD2C3] hover:bg-[#9CD2C3] hover:text-white px-8 py-3 text-lg font-semibold"
                  size="lg"
                >
                  Join Free
                </Button>
              </div>
            </div>

            {/* Hero Images */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {featuredOffers.slice(0, 4).map((offer, index) => (
                <div 
                  key={offer.id} 
                  className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <img
                    src={offer.image_url || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop"}
                    alt={offer.title}
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                  
                  {/* Overlay with offer info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white text-sm font-semibold truncate">
                        {offer.title}
                      </h3>
                      {offer.discount_percent && (
                        <span className="text-[#9CD2C3] text-xs font-bold">
                          {offer.discount_percent}% OFF
                        </span>
                      )}
                      {offer.price === 0 && (
                        <span className="text-[#9CD2C3] text-xs font-bold">
                          FREE SAMPLE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Discounts Section */}
      <section className="py-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Top Discounts
            </h2>
            <p className="text-xl text-gray-600">
              Don't miss these amazing savings on baby essentials
            </p>
          </div>

          {topDiscountOffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topDiscountOffers.slice(0, 6).map((offer, index) => (
                <Card 
                  key={offer.id} 
                  className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 animate-on-scroll border-[#9EB6CF]/30 rounded-lg"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={offer.image_url || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop"}
                      alt={offer.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {offer.discount_percent}% OFF
                    </div>

                    {offer.expires_at && getTimeRemaining(offer.expires_at) && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining(offer.expires_at)}
                      </div>
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
                        <span className="text-xl font-bold text-[#9EB6CF]">
                          ${offer.price}
                        </span>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => offer.affiliate_link && window.open(offer.affiliate_link, '_blank')}
                      className="w-full bg-[#9EB6CF] hover:bg-[#9EB6CF]/90 text-white font-semibold rounded-lg"
                      disabled={!offer.affiliate_link}
                    >
                      Claim Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Use This Site Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Moms Love BabyDeals
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to discover the best baby products
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="text-center p-6 animate-on-scroll">
              <div className="w-16 h-16 bg-gradient-to-r from-[#9CD2C3] to-[#9CD2C3]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Free gifts and samples
              </h3>
              <p className="text-gray-600">
                Try before you buy with free samples from trusted baby brands
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center p-6 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-r from-[#9EB6CF] to-[#9EB6CF]/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Safe & trusted brands only
              </h3>
              <p className="text-gray-600">
                Every product is vetted for safety and quality standards
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center p-6 animate-on-scroll" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-gradient-to-r from-[#9CD2C3] to-[#9EB6CF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Fast and personalized
              </h3>
              <p className="text-gray-600">
                Takes just 1 minute to sign up and start receiving personalized offers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About BabyDeals
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We're passionate about helping new moms discover the best baby products at unbeatable prices. 
                Our platform connects families with trusted brands, offering exclusive discounts, free samples, 
                and age-matched recommendations.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Every offer is carefully curated to ensure safety, quality, and value. We believe parenthood 
                should be joyful, not stressful - especially when it comes to finding the right products for your little one.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>10,000+ Happy Families</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-green-500" />
                  <span>100% Verified Brands</span>
                </div>
              </div>
            </div>
            <div className="animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <img 
                src="https://images.unsplash.com/photo-1544963150-889fa2638fb3?w=600&h=400&fit=crop" 
                alt="Happy mom with baby"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you
            </p>
          </div>

          <Card className="animate-on-scroll border-[#9EB6CF]/30">
            <CardContent className="p-8">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    className="w-full"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    className="w-full"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    className="w-full h-32"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#9EB6CF] hover:bg-[#9EB6CF]/90 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Baby className="w-8 h-8 text-[#9EB6CF]" />
              <span className="text-xl font-semibold">BabyDeals</span>
            </div>
            <p className="text-gray-400 max-w-md mx-auto">
              Connecting families with the best baby products and deals from trusted brands.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;