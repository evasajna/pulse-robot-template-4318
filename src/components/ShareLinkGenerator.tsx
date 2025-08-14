import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ShareLinkGenerator = () => {
  const [mobile, setMobile] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareLink = async () => {
    if (!mobile.trim()) {
      toast({
        title: "Error",
        description: "Please enter a mobile number",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      toast({
        title: "Error", 
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate a unique share code
      const shareCode = `${mobile}_${Date.now()}`;
      
      // Insert into database
      const { data, error } = await supabase
        .from('shared_links')
        .insert({
          mobile_number: mobile.trim(),
          share_code: shareCode
        })
        .select()
        .single();

      if (error) throw error;

      // Generate the shareable link
      const link = `${window.location.origin}/quiz?ref=${shareCode}`;
      setShareLink(link);
      
      toast({
        title: "Success",
        description: "Share link generated successfully!",
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Create Share Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="mobile" className="text-sm font-medium">
            Your Mobile Number
          </label>
          <Input
            id="mobile"
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
          />
        </div>
        
        <Button 
          onClick={generateShareLink} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Share Link"}
        </Button>

        {shareLink && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Share Link</label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link to track referrals through your mobile number
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareLinkGenerator;