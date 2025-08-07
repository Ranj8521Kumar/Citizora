import React from 'react';
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { 
  MessageSquare, 
  MapPin, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Construction,
  FileText
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback.jsx';

export function LandingPage({ onNavigate, onLogin, onRegister, reports }) {
  // Ensure reports is an array and provide default values
  const safeReports = Array.isArray(reports) ? reports : [];
  
  const stats = {
    totalReports: safeReports.length,
    resolvedReports: safeReports.filter(r => r.status === 'resolved').length,
    inProgressReports: safeReports.filter(r => r.status === 'in-progress').length,
    activeUsers: 1247 // Mock data
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-secondary text-secondary-foreground';
      case 'in-progress':
        return 'bg-accent text-accent-foreground';
      case 'submitted':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-accent text-accent-foreground';
      case 'medium':
        return 'bg-yellow-500 text-yellow-50';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Your Voice in Your Community
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Report civic issues, track their progress, and help make your neighborhood better. 
                Join thousands of citizens making a difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => onNavigate('report')}
                  className="text-lg px-8 py-3"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Report an Issue
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => onNavigate('community')}
                  className="text-lg px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  View Community Reports
                </Button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="/api/placeholder/600/400"
                alt="Community members working together"
                className="rounded-lg shadow-2xl"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stats.totalReports}
              </div>
              <div className="text-muted-foreground">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                {stats.resolvedReports}
              </div>
              <div className="text-muted-foreground">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-accent mb-2 text-red-600">
                {stats.inProgressReports}
              </div>
              <div className="text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stats.activeUsers}
              </div>
              <div className="text-muted-foreground">Active Citizens</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How CivicConnect Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Making civic engagement simple and effective for everyone
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Report Issues</h3>
              <p className="text-muted-foreground">
                Easily report civic issues with photos, location, and detailed descriptions. 
                Our simple form makes it quick and easy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(252,238,230)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Construction className="w-8 h-8 text-[rgb(235,96,23)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your reports in real-time with status updates and estimated resolution times. 
                Stay informed every step of the way.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[rgb(230,244,239)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[rgb(5,150,105)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">See Results</h3>
              <p className="text-muted-foreground">
                Watch as your community improves. Rate completed work and provide feedback 
                to help maintain quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Recent Community Reports</h2>
              <p className="text-muted-foreground">See what's happening in your neighborhood</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('community')}
              className="flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>View All</span>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeReports.slice(0, 6).map((report) => (
              <Card key={report._id || report.id || Math.random()} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getStatusColor(report.status)}>
                      {(report.status || 'submitted').replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(report.priority)}>
                      {report.priority || 'medium'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{report.title || 'Untitled Report'}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {report.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {report.location?.address?.description || report.location?.description || 'Location not specified'}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(report.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {(report.votes || 0)} votes
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join your neighbors in building a better community. Your voice matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={onRegister}
              className="text-lg px-8 py-3"
            >
              Get Started Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={onLogin}
              className="text-lg px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}