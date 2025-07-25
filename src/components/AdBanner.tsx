import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Ad {
  id: string;
  vendor_id: string;
  start_date: string;
  end_date: string;
  paid: boolean;
  vendors?: {
    id: string;
    name: string;
  };
}

const AdBanner = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000); // Rotate every 5 seconds

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const fetchActiveAds = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('ads')
      .select(`
        id,
        vendor_id,
        start_date,
        end_date,
        paid,
        vendors!vendor_id (
          id,
          name
        )
      `)
      .eq('paid', true)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ads:', error);
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  if (loading || ads.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-lg p-6 mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-sm font-semibold text-primary">Featured Advertisement</p>
          </div>
          
          <div className="mt-2 transition-all duration-500 ease-in-out transform">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Premium Baby Products & Services
            </h3>
            <p className="text-muted-foreground">
              Discover trusted vendors offering the best for your little one
            </p>
          </div>
        </div>

        {ads.length > 1 && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={prevAd}
              className="p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors duration-200"
              aria-label="Previous ad"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            
            <div className="flex space-x-1">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentAdIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextAd}
              className="p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors duration-200"
              aria-label="Next ad"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-5000 ease-linear"
          style={{ 
            width: ads.length > 1 ? `${((currentAdIndex + 1) / ads.length) * 100}%` : '100%'
          }}
        />
      </div>
    </div>
  );
};

export default AdBanner;