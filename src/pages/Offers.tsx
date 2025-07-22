import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Offers = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Special Offers for Moms
          </h1>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Baby Essentials Bundle</CardTitle>
              <CardDescription>Save 30% on starter kits</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Everything you need for your newborn at an unbeatable price.
              </p>
              <Button className="mt-4 w-full">View Deal</Button>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Organic Baby Food</CardTitle>
              <CardDescription>25% off first order</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Premium organic baby food delivered to your door.
              </p>
              <Button className="mt-4 w-full">View Deal</Button>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle>Educational Toys</CardTitle>
              <CardDescription>Buy 2, get 1 free</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stimulating toys for your child's development.
              </p>
              <Button className="mt-4 w-full">View Deal</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Offers;