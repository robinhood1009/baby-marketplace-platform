import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Baby, 
  Menu, 
  X, 
  UserCheck, 
  Store, 
  Gift, 
  Search, 
  TrendingUp, 
  Heart,
  Mail,
  Phone,
  MapPin,
  ChevronDown
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'how-it-works', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
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
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen font-outfit">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Baby className="w-8 h-8 text-primary" />
              <span className="text-xl font-semibold text-gray-900">BabyDeals</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`font-medium transition-colors ${
                    activeSection === item.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90"
              >
                Login
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t animate-fade-in">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                      activeSection === item.id
                        ? 'text-primary bg-primary/5'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full mt-2 bg-primary hover:bg-primary/90"
                >
                  Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #9EB6CF 0%, #9CD2C3 100%)'
        }}
      >
        {/* Animated background images */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://media.sciencephoto.com/image/f0133540/800wm/F0133540-Mother_holding_baby.jpg" 
            alt="Happy diverse mother with baby"
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full object-cover opacity-20 animate-pulse"
          />
          <img 
            src="https://images.unsplash.com/photo-1609193230660-bfdb5b9e3151?w=400&h=400&fit=crop" 
            alt="Diverse family with baby gifts"
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full object-cover opacity-15 animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <img 
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face" 
            alt="Happy parents with newborn"
            className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full object-cover opacity-10 animate-pulse"
            style={{ animationDelay: '2s' }}
          />
          <img 
            src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&h=300&fit=crop" 
            alt="Diverse mother baby bonding"
            className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full object-cover opacity-15 animate-pulse"
            style={{ animationDelay: '3s' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find curated baby offers made for your little one.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join to receive gifts, trials, and more — all personalized for your baby's age.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/auth?role=mother')}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold py-4 px-8 text-lg hover-scale"
            >
              <Heart className="w-5 h-5 mr-2" />
              I'm a Mother
            </Button>
            <Button
              onClick={() => navigate('/auth?role=vendor')}
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-4 px-8 text-lg hover-scale transition-all duration-200"
            >
              <Store className="w-5 h-5 mr-2" />
              I'm a Vendor
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <ChevronDown className="w-6 h-6 text-white/70" />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-pink-50 via-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              What Parents Are Saying
            </h2>
            <p className="text-gray-600">Real stories from families who found amazing deals</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover-scale animate-fade-in">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1622568949053-4af3c3bc7ff6?w=60&h=60&fit=crop&crop=face" 
                  alt="Happy diverse mother"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">Sarah M.</p>
                  <p className="text-sm text-gray-600">Mom of 1</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "I got a box of baby goodies in just 3 clicks. So convenient and my little one loves everything!"
              </blockquote>
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=150&fit=crop" 
                  alt="Baby items"
                  className="w-32 h-24 rounded-lg object-cover opacity-80"
                />
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=60&h=60&fit=crop&crop=face" 
                  alt="Happy diverse mother"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">Aisha K.</p>
                  <p className="text-sm text-gray-600">Mom of 2</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "Perfect timing! Got organic baby food samples right when we started solids. Saved us so much trial and error."
              </blockquote>
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop" 
                  alt="Baby food"
                  className="w-32 h-24 rounded-lg object-cover opacity-80"
                />
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover-scale animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1607502482842-75b9f95c3e36?w=60&h=60&fit=crop&crop=face" 
                  alt="Happy diverse mother"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">Maria L.</p>
                  <p className="text-sm text-gray-600">New Mom</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "As a new mom, finding trusted brands felt overwhelming. This platform made it so easy to discover quality products."
              </blockquote>
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=150&fit=crop" 
                  alt="Baby clothes"
                  className="w-32 h-24 rounded-lg object-cover opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Trusted by over 10,000 families</p>
            <div className="flex justify-center space-x-8 items-center opacity-60">
              <div className="text-sm font-medium">⭐ 4.9/5 rating</div>
              <div className="text-sm font-medium">🛡️ Verified offers</div>
              <div className="text-sm font-medium">📦 2M+ products delivered</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps for both mothers and vendors to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Mothers */}
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-primary mb-8 text-center">
                <Heart className="w-8 h-8 inline mr-2" />
                For Mothers
              </h3>
              
              <div className="space-y-6">
                {[
                  { icon: UserCheck, title: "Sign up", desc: "Create your account in seconds" },
                  { icon: Baby, title: "Tell us your baby's age", desc: "Get personalized recommendations" },
                  { icon: Search, title: "Browse personalized offers", desc: "Discover deals perfect for your little one" },
                  { icon: Gift, title: "Claim via affiliate links", desc: "Get amazing deals and support vendors" }
                ].map((step, index) => (
                  <Card key={index} className="hover-scale transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600">{step.desc}</p>
                      </div>
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* For Vendors */}
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-primary mb-8 text-center">
                <Store className="w-8 h-8 inline mr-2" />
                For Vendors
              </h3>
              
              <div className="space-y-6">
                {[
                  { icon: Store, title: "Register as a business", desc: "Set up your vendor profile" },
                  { icon: Gift, title: "Share your baby-friendly product", desc: "Connect with families who need your products" },
                  { icon: TrendingUp, title: "Get your offer on the homepage", desc: "Increase your visibility with featured placement" },
                  { icon: TrendingUp, title: "Track clicks and ad performance", desc: "Monitor your success metrics" }
                ].map((step, index) => (
                  <Card key={index} className="hover-scale transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600">{step.desc}</p>
                      </div>
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Baby Brand CTA Section */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#9EB6CF' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Are you a baby brand?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="flex items-center justify-center md:justify-start space-x-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg font-medium">List your product in minutes</p>
              </div>
              
              <div className="flex items-center justify-center md:justify-start space-x-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg font-medium">Get seen by real moms</p>
              </div>
              
              <div className="flex items-center justify-center md:justify-start space-x-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-lg font-medium">Pay only for homepage ads</p>
              </div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <Button
                onClick={() => navigate('/auth?role=vendor')}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold py-4 px-8 text-lg hover-scale"
              >
                <Store className="w-5 h-5 mr-2" />
                Start Listing
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute top-10 right-10 w-64 h-64 opacity-10 rounded-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop" 
            alt="Diverse family with baby"
            className="w-full h-full object-cover animate-pulse"
          />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Our Mission
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 animate-fade-in">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
              We help new moms find trusted baby products and services by connecting them with offers from baby-focused brands. We support small vendors by giving them a space to reach real families.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">For Families</h3>
                <p className="text-gray-600">Curated offers for your baby's journey</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">For Vendors</h3>
                <p className="text-gray-600">Reach engaged parent communities</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">For Growth</h3>
                <p className="text-gray-600">Building stronger family-business connections</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-fade-in">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="border-2 border-gray-200 focus:border-primary rounded-lg p-4"
                  />
                </div>
                
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="border-2 border-gray-200 focus:border-primary rounded-lg p-4"
                  />
                </div>
                
                <div>
                  <Textarea
                    placeholder="Your Message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={6}
                    className="border-2 border-gray-200 focus:border-primary rounded-lg p-4"
                  />
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 py-4 text-lg font-semibold rounded-lg hover-scale"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="animate-fade-in">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">hello@babydeals.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-600">123 Baby Street<br />Family City, FC 12345</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white rounded-xl">
                  <p className="text-gray-700 italic">
                    "We're here to support both families and vendors in creating meaningful connections around baby products and services."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Baby className="w-6 h-6" />
            <span className="text-lg font-semibold">BabyDeals</span>
          </div>
          <p className="text-gray-400">
            © 2024 BabyDeals. Connecting families with trusted baby brands.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;