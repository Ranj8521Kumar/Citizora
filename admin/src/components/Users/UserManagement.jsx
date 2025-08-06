import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Badge } from '../ui/badge.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Checkbox } from '../ui/checkbox.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Shield, 
  User, 
  UserCheck,
  Download,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const userData = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'Citizen',
    status: 'Active',
    lastActive: '2 hours ago',
    reportsSubmitted: 12,
    joinDate: '2023-01-15',
    location: 'Downtown District',
    phone: '(555) 123-4567'
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@cityworks.gov',
    role: 'Field Worker',
    status: 'Active',
    lastActive: '15 minutes ago',
    reportsSubmitted: 0,
    joinDate: '2022-08-20',
    location: 'Public Works Dept',
    phone: '(555) 987-6543'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.j@email.com',
    role: 'Citizen',
    status: 'Inactive',
    lastActive: '1 week ago',
    reportsSubmitted: 3,
    joinDate: '2023-06-10',
    location: 'North Side District',
    phone: '(555) 456-7890'
  },
  {
    id: 4,
    name: 'Lisa Rodriguez',
    email: 'l.rodriguez@cityworks.gov',
    role: 'Administrator',
    status: 'Active',
    lastActive: '5 minutes ago',
    reportsSubmitted: 0,
    joinDate: '2021-12-03',
    location: 'City Hall',
    phone: '(555) 234-5678'
  },
  {
    id: 5,
    name: 'David Chen',
    email: 'david.chen@email.com',
    role: 'Citizen',
    status: 'Active',
    lastActive: '1 hour ago',
    reportsSubmitted: 8,
    joinDate: '2023-03-22',
    location: 'South End District',
    phone: '(555) 345-6789'
  }
];

const roleStats = [
  { role: 'Citizens', count: 12450, growth: '+5%', color: 'text-blue-600', icon: User },
  { role: 'Field Workers', count: 85, growth: '+2%', color: 'text-green-600', icon: UserCheck },
  { role: 'Administrators', count: 12, growth: '0%', color: 'text-purple-600', icon: Shield },
  { role: 'Inactive Users', count: 234, growth: '-8%', color: 'text-gray-600', icon: Clock }
];

const getRoleVariant = (role) => {
  switch (role) {
    case 'Administrator':
      return 'default';
    case 'Field Worker':
      return 'secondary';
    case 'Citizen':
      return 'outline';
    default:
      return 'outline';
  }
};

export const UserManagement = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSelectAll = () => {
    if (selectedUsers.length === userData.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(userData.map(user => user.id));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = useMemo(() => {
    return userData.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleStats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.role}</p>
                    <p className={`text-2xl ${stat.color} mb-1`}>{stat.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{stat.growth} from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="all-users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="citizens">Citizens</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage system users, roles, and permissions</CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="citizen">Citizens</SelectItem>
                    <SelectItem value="field worker">Field Workers</SelectItem>
                    <SelectItem value="administrator">Administrators</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Change Role
                    </Button>
                    <Button size="sm" variant="outline">
                      Export Selected
                    </Button>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all users"
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src="" alt={user.name} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.status === 'Active' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={
                              user.status === 'Active' ? 'text-green-700' : 'text-gray-500'
                            }>
                              {user.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{user.lastActive}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{user.reportsSubmitted}</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" aria-label={`More options for ${user.name}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder tabs */}
        <TabsContent value="citizens">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Citizen users view would be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Staff users view would be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Inactive users view would be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};