import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Baby, ShoppingBag } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
      </div>
    </div>
  );
};

export default Index;
