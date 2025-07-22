import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Filter } from 'lucide-react';

type BabyAgeGroup = '0-3 months' | '3-6 months' | '6-12 months' | '1-2 years' | '2-3 years' | '3+ years';

const Offers = () => {
  const { signOut, user } = useAuth();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<BabyAgeGroup | null>(null);
  const [userAgeGroup, setUserAgeGroup] = useState<BabyAgeGroup | null>(null);

  useEffect(() => {
    if (user) {
      // Get user's baby age group
      const getUserProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('baby_age')
          .eq('user_id', user.id)
          .single();

        if (data?.baby_age) {
          setUserAgeGroup(data.baby_age as BabyAgeGroup);
          setSelectedAgeGroup(data.baby_age as BabyAgeGroup);
        }
      };

      getUserProfile();
    }
  }, [user]);

  // Mock offers data - in a real app, this would come from your database
  const allOffers = [
    { id: 1, title: "Newborn Essentials Bundle", description: "Everything for your newborn", ageGroups: ['0-3 months'], discount: "30%" },
    { id: 2, title: "Organic Baby Food Starter Pack", description: "Healthy first foods", ageGroups: ['3-6 months', '6-12 months'], discount: "25%" },
    { id: 3, title: "Educational Toys Set", description: "Stimulating development toys", ageGroups: ['6-12 months', '1-2 years'], discount: "20%" },
    { id: 4, title: "Toddler Safety Kit", description: "Keep your toddler safe", ageGroups: ['1-2 years', '2-3 years'], discount: "15%" },
    { id: 5, title: "Potty Training Set", description: "Make potty training fun", ageGroups: ['2-3 years'], discount: "35%" },
    { id: 6, title: "Preschool Learning Pack", description: "Educational materials", ageGroups: ['3+ years'], discount: "25%" },
    { id: 7, title: "Sleep Training Guide + Night Light", description: "Better sleep for everyone", ageGroups: ['0-3 months', '3-6 months'], discount: "40%" },
    { id: 8, title: "Baby Carrier & Accessories", description: "Keep baby close", ageGroups: ['0-3 months', '3-6 months', '6-12 months'], discount: "30%" },
  ];

  const filteredOffers = selectedAgeGroup 
    ? allOffers.filter(offer => offer.ageGroups.includes(selectedAgeGroup))
    : allOffers;

  const ageGroups: BabyAgeGroup[] = ['0-3 months', '3-6 months', '6-12 months', '1-2 years', '2-3 years', '3+ years'];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Special Offers for You
            </h1>
            {userAgeGroup && (
              <Badge variant="secondary" className="text-sm">
                Your baby: {userAgeGroup}
              </Badge>
            )}
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </header>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by age:</span>
          </div>
          <Select 
            value={selectedAgeGroup || ''} 
            onValueChange={(value) => setSelectedAgeGroup(value as BabyAgeGroup || null)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All age groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All age groups</SelectItem>
              {ageGroups.map((age) => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAgeGroup && selectedAgeGroup !== userAgeGroup && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedAgeGroup(userAgeGroup)}
            >
              Reset to your baby's age
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer, index) => (
            <Card key={offer.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  <Badge variant="destructive" className="ml-2">
                    {offer.discount} OFF
                  </Badge>
                </div>
                <CardDescription>{offer.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {offer.ageGroups.map((age) => (
                    <Badge 
                      key={age} 
                      variant={age === selectedAgeGroup ? "default" : "outline"}
                      className="text-xs"
                    >
                      {age}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full">View Deal</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No offers found for the selected age group.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedAgeGroup(null)}
            >
              View all offers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;