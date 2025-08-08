import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  MousePointer, 
  Eye,
  Download,
  Calendar
} from "lucide-react";

// Mock data - in real app this would come from your analytics API
const mockPerformanceData = [
  { title: "Baby Formula 30% Off", clicks: 1248, impressions: 8340, ctr: 15.0 },
  { title: "Organic Baby Food", clicks: 892, impressions: 6120, ctr: 14.6 },
  { title: "Baby Monitor Sale", clicks: 756, impressions: 5890, ctr: 12.8 },
  { title: "Diaper Bundle Deal", clicks: 634, impressions: 5230, ctr: 12.1 },
  { title: "Stroller Clearance", clicks: 421, impressions: 3850, ctr: 10.9 },
];

const mockTimeSeriesData = [
  { date: "2024-01-01", clicks: 120, impressions: 890 },
  { date: "2024-01-02", clicks: 145, impressions: 920 },
  { date: "2024-01-03", clicks: 132, impressions: 875 },
  { date: "2024-01-04", clicks: 189, impressions: 1200 },
  { date: "2024-01-05", clicks: 156, impressions: 980 },
  { date: "2024-01-06", clicks: 178, impressions: 1100 },
  { date: "2024-01-07", clicks: 203, impressions: 1350 },
];

export default function VendorAnalytics() {
  const [dateRange, setDateRange] = useState("30d");

  const totalClicks = mockPerformanceData.reduce((sum, item) => sum + item.clicks, 0);
  const totalImpressions = mockPerformanceData.reduce((sum, item) => sum + item.impressions, 0);
  const averageCTR = totalClicks / totalImpressions * 100;

  const exportToCsv = () => {
    const csvContent = [
      ["Offer Title", "Clicks", "Impressions", "CTR (%)"],
      ...mockPerformanceData.map(item => [
        item.title,
        item.clicks.toString(),
        item.impressions.toString(),
        item.ctr.toFixed(1)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor-analytics.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCsv} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalClicks.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalImpressions.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <BarChart3 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{averageCTR.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +2.1% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Impressions & Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Chart visualization would go here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Showing data for {dateRange === "7d" ? "last 7 days" : dateRange === "30d" ? "last 30 days" : dateRange === "90d" ? "last 90 days" : "last year"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Offers */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top 5 Performing Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPerformanceData.map((offer, index) => (
              <div
                key={offer.title}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{offer.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        {offer.clicks.toLocaleString()} clicks
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {offer.impressions.toLocaleString()} impressions
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={
                      offer.ctr >= 15 ? "bg-green-100 text-green-800 border-green-200" :
                      offer.ctr >= 12 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                      "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {offer.ctr.toFixed(1)}% CTR
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}