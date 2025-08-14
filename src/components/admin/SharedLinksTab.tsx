import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SharedLink {
  id: string;
  mobile_number: string;
  share_code: string;
  created_at: string;
  is_active: boolean;
  submission_count: number;
}

const SharedLinksTab = () => {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSharedLinks = async () => {
    try {
      // Fetch shared links with submission counts
      const { data: linksData, error: linksError } = await supabase
        .from('shared_links')
        .select(`
          *,
          shared_link_submissions(count)
        `)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      // Process the data to include submission counts
      const processedLinks = linksData?.map(link => ({
        ...link,
        submission_count: link.shared_link_submissions?.[0]?.count || 0
      })) || [];

      setSharedLinks(processedLinks);
    } catch (error) {
      console.error('Error fetching shared links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedLinks();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shared Links</CardTitle>
          <CardDescription>Loading shared links data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Links Management</CardTitle>
        <CardDescription>
          Track shared links created by users and their submission counts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sharedLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No shared links found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Share Code</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      {link.mobile_number}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {link.share_code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">
                        {link.submission_count} submissions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={link.is_active ? "default" : "secondary"}
                      >
                        {link.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(link.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedLinksTab;