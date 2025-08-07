import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Users, 
  UserPlus, 
  Calendar,
  Search,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import  apiService  from '../services/api';

export function ActiveCitizens() {
  const [citizensData, setCitizensData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadActiveCitizens();
  }, []);

  const loadActiveCitizens = async () => {
    try {
      setLoading(true);
      const response = await apiService.getActiveCitizens();
      setCitizensData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load active citizens:', err);
      setError('Failed to load active citizens data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCitizens = citizensData?.allCitizens?.filter(citizen => {
    const fullName = `${citizen.firstName || ''} ${citizen.lastName || ''}`.toLowerCase();
    const email = (citizen.email || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  }) || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return `Date not available: ${error.message}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading active citizens data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadActiveCitizens}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Active Citizens</h1>
          <p className="text-muted-foreground">See the community members actively participating in CivicConnect</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Citizens</p>
                  <p className="text-3xl font-bold text-blue-600">{citizensData?.totalCitizens || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">All Citizens</p>
                  <p className="text-3xl font-bold text-green-600">{citizensData?.allCitizens?.length || 0}</p>
                </div>
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Community Growth</p>
                  <p className="text-3xl font-bold text-purple-600">Active</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Citizens List */}
        <Card>
          <CardHeader>
            <CardTitle>All Community Members</CardTitle>
            <CardDescription>
              All citizens who are part of the CivicConnect community
            </CardDescription>
            
            {/* Search */}
            <div className="relative pt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search citizens by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {filteredCitizens.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No citizens found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No citizens data available'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredCitizens.map((citizen, index) => (
                  <div key={citizen._id || index} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {citizen.profileImage ? (
                            <img 
                              src={citizen.profileImage} 
                              alt={`${citizen.firstName} ${citizen.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {citizen.firstName} {citizen.lastName}
                          </h3>
                          {citizen.email && (
                            <p className="text-sm text-muted-foreground">{citizen.email}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {formatDate(citizen.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Active Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Community Insights</CardTitle>
              <CardDescription>
                Key statistics about our growing community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Community Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Our community is growing with {citizensData?.totalCitizens || 0} active citizens 
                    contributing to making our city better.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <p className="text-sm text-muted-foreground">
                    {citizensData?.allCitizens?.length || 0} total members are part of our community, 
                    working together to improve our city.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
