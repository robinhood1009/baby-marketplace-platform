import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VendorDashboard = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Vendor Dashboard
          </h1>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>This month's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">$2,450</div>
              <p className="text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Active Products</CardTitle>
              <CardDescription>Items currently listed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">24</div>
              <Button className="mt-4 w-full" variant="secondary">
                Add New Product
              </Button>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Orders to fulfill</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">8</div>
              <Button className="mt-4 w-full" variant="outline">
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;