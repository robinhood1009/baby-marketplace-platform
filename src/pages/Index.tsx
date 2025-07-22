import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Baby, ShoppingBag } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4">
      <div className="max-w-4xl mx-auto pt-8">
        <AdBanner />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 text-foreground animate-fade-in">
              Baby Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Connect loving families with trusted vendors for all your baby needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="h-20 px-8 text-lg font-semibold rounded-2xl min-w-[200px] animate-fade-in hover:scale-105 transition-transform duration-200"
                style={{ animationDelay: '0.4s' }}
                onClick={() => navigate('/auth?role=mother')}
              >
                <Baby className="mr-3 h-6 w-6" />
                I'm a Mom
              </Button>
              
              <Button
                size="lg"
                variant="secondary"
                className="h-20 px-8 text-lg font-semibold rounded-2xl min-w-[200px] animate-fade-in hover:scale-105 transition-transform duration-200"
                style={{ animationDelay: '0.6s' }}
                onClick={() => navigate('/auth?role=vendor')}
              >
                <ShoppingBag className="mr-3 h-6 w-6" />
                I'm a Vendor
              </Button>
            </div>
            
            {/* Admin Login Link */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/auth?role=admin')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
