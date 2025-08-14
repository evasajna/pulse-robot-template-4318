import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";

interface ReferralWinner {
  mobile_number: string;
  referral_count: number;
  prize: string;
  amount: string;
}

const ReferralWinners = () => {
  const [winners, setWinners] = useState<ReferralWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralWinners();
  }, []);

  const fetchReferralWinners = async () => {
    try {
      // Get all submissions with reference_id (referrals)
      const { data: submissions, error } = await supabase
        .from("submissions")
        .select("reference_id")
        .not("reference_id", "is", null);

      if (error) throw error;

      // Count referrals for each mobile number
      const referralCounts = submissions.reduce((acc, submission) => {
        const mobileNumber = submission.reference_id;
        acc[mobileNumber] = (acc[mobileNumber] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Sort by referral count and get top 3
      const sortedWinners = Object.entries(referralCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([mobile_number, referral_count], index) => {
          const prizes = [
            { prize: "1st Prize", amount: "₹10,000 + Certificate" },
            { prize: "2nd Prize", amount: "₹5,000 + Certificate" },
            { prize: "3rd Prize", amount: "₹3,000 + Certificate" }
          ];
          
          return {
            mobile_number,
            referral_count,
            ...prizes[index]
          };
        });

      setWinners(sortedWinners);
    } catch (error) {
      console.error("Error fetching referral winners:", error);
    }
    setLoading(false);
  };

  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-6 w-6" />;
    }
  };

  const getBadgeVariant = (index: number) => {
    switch (index) {
      case 0: return "default" as const;
      case 1: return "secondary" as const;
      case 2: return "outline" as const;
      default: return "default" as const;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Referral Champions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading referral winners...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Referral Champions - Top 3 Most Referred Mobile Numbers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {winners.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No referral data available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map((winner, index) => (
              <div key={winner.mobile_number} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getIcon(index)}
                  <div>
                    <div className="font-semibold">{winner.mobile_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {winner.referral_count} referrals
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getBadgeVariant(index)} className="mb-1">
                    {winner.prize}
                  </Badge>
                  <div className="text-sm font-medium">{winner.amount}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralWinners;