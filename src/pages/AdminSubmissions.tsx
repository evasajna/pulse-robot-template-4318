import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminSubmissions = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Submissions & Analytics</h1>
          <p className="text-muted-foreground">View quiz results and leaderboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submissions Management</CardTitle>
            <CardDescription>
              Submissions and analytics will be available once the database is fully synchronized.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Database synchronization in progress...
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissions;