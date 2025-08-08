import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { 
  User, 
  Mail, 
  Globe, 
  Phone,
  MapPin,
  Save,
  Building
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VendorProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Brand {
  id: string;
  name: string;
  image_url?: string;
}

export default function VendorProfile() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    if (!user) return;

    try {
      // Get user's vendor_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("vendor_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.vendor_id) return;

      // Fetch vendor info
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", profile.vendor_id)
        .single();

      if (vendorError) throw vendorError;
      setVendor(vendorData);

      // Fetch brand info
      const { data: brandData } = await supabase
        .from("brands")
        .select("*")
        .eq("vendor_id", profile.vendor_id)
        .single();

      if (brandData) {
        setBrand(brandData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!vendor || !user) return;

    setSaving(true);
    try {
      // Get user's vendor_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("vendor_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.vendor_id) return;

      // Update vendor info
      const { error: vendorError } = await supabase
        .from("vendors")
        .update({
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
          address: vendor.address,
        })
        .eq("id", profile.vendor_id);

      if (vendorError) throw vendorError;

      // Update or create brand if exists
      if (brand) {
        const { error: brandError } = await supabase
          .from("brands")
          .upsert({
            id: brand.id,
            vendor_id: profile.vendor_id,
            name: brand.name,
            image_url: brand.image_url,
          });

        if (brandError) throw brandError;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <Button onClick={saveProfile} disabled={saving} className="bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Brand Information */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building className="h-5 w-5" />
            Brand Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div>
              <Label htmlFor="brand-logo" className="text-sm font-medium">Brand Logo</Label>
              <div className="mt-2">
                <ImageUpload
                  onImageUrlChange={(url) => setBrand(prev => prev ? {...prev, image_url: url} : null)}
                  currentImageUrl={brand?.image_url}
                  bucketName="offer-images"
                  className="w-24 h-24"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="brand-name" className="text-sm font-medium">Brand Name</Label>
              <Input
                id="brand-name"
                value={brand?.name || ""}
                onChange={(e) => setBrand(prev => prev ? {...prev, name: e.target.value} : { id: "", name: e.target.value })}
                placeholder="Enter your brand name"
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-card shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="vendor-name" className="text-sm font-medium">Business Name</Label>
              <Input
                id="vendor-name"
                value={vendor?.name || ""}
                onChange={(e) => setVendor(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="Enter business name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={vendor?.email || ""}
                  onChange={(e) => setVendor(prev => prev ? {...prev, email: e.target.value} : null)}
                  placeholder="Enter email address"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={vendor?.phone || ""}
                  onChange={(e) => setVendor(prev => prev ? {...prev, phone: e.target.value} : null)}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website" className="text-sm font-medium">Website URL</Label>
              <div className="relative mt-2">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://your-website.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="address" className="text-sm font-medium">Business Address</Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                value={vendor?.address || ""}
                onChange={(e) => setVendor(prev => prev ? {...prev, address: e.target.value} : null)}
                placeholder="Enter your business address"
                className="pl-10 min-h-[80px] resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={saveProfile} disabled={saving} className="bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}