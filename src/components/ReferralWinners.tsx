import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";

interface ReferralWinner {
  referrer_mobile: string;
  referral_count: number;
}

const ReferralWinners = () => {
  const [loading, setLoading] = useState(false);

  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-6 w-6" />;
    }
  };

  const getRankDisplay = (index: number) => {
    const ranks = ["1st", "2nd", "3rd"];
    return ranks[index] || `${index + 1}th`;
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
        <div className="text-center text-muted-foreground">
          Referral winners will appear here once the database is fully synchronized.
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralWinners;