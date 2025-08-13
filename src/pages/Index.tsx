import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Brain, Users, BarChart3, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quiz Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A comprehensive platform for creating, managing, and analyzing quiz submissions with real-time scoring and leaderboards.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/quiz">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Take Quiz
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="lg">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create engaging multiple-choice quizzes with automatic scoring and validation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle>Participant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track participant details, prevent duplicates, and manage submissions efficiently.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-success mx-auto mb-4" />
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View detailed analytics, leaderboards, and comprehensive submission reports.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-warning mx-auto mb-4" />
              <CardTitle>Secure Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Protected admin interface for managing questions, viewing results, and system control.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
