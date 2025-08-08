import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CreditCard, 
  Download, 
  Receipt,
  Calendar,
  DollarSign
} from "lucide-react";

// Mock billing data - in real app this would come from Stripe
const mockInvoices = [
  {
    id: "inv_1234567890",
    date: "2024-01-15",
    amount: 49.99,
    status: "paid",
    description: "Ad Placement - Baby Formula Banner",
    period: "Jan 15 - Jan 22, 2024",
    downloadUrl: "#"
  },
  {
    id: "inv_0987654321",
    date: "2024-01-08",
    amount: 99.99,
    status: "paid",
    description: "Ad Placement - Organic Baby Food",
    period: "Jan 8 - Jan 22, 2024",
    downloadUrl: "#"
  },
  {
    id: "inv_1122334455",
    date: "2024-01-01",
    amount: 149.99,
    status: "paid",
    description: "Premium Ad Placement Bundle",
    period: "Jan 1 - Jan 31, 2024",
    downloadUrl: "#"
  },
  {
    id: "inv_5566778899",
    date: "2023-12-20",
    amount: 49.99,
    status: "paid",
    description: "Ad Placement - Holiday Sale",
    period: "Dec 20 - Dec 27, 2023",
    downloadUrl: "#"
  },
  {
    id: "inv_9988776655",
    date: "2023-12-10",
    amount: 79.99,
    status: "overdue",
    description: "Ad Placement - Winter Collection",
    period: "Dec 10 - Dec 17, 2023",
    downloadUrl: "#"
  }
];

export default function VendorBilling() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const totalSpent = mockInvoices
    .filter(invoice => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const outstandingAmount = mockInvoices
    .filter(invoice => invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <div className="text-sm text-muted-foreground">
          Manage your ad placement invoices and payments
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatAmount(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Across all ad placements
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Receipt className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatAmount(outstandingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{formatAmount(149.98)}</div>
            <p className="text-xs text-muted-foreground">
              January 2024
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mockInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
              <p className="text-muted-foreground">
                Your ad placement invoices will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        #{invoice.id.slice(-8)}
                      </TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.period}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(invoice.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === "overdue" && (
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-primary rounded flex items-center justify-center">
                <CreditCard className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Badge variant="outline">Default</Badge>
          </div>
          <Button variant="outline" className="mt-4">
            Add Payment Method
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}