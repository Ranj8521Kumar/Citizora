import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  Loader2,
  RefreshCw,
  Ban,
  UserCog,
  Wrench,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu.jsx';
import apiService from '../../services/api.js';
import { AddUserModal } from './AddUserModal.jsx';
import { UserProfileModal } from './UserProfileModal.jsx';
import { EditUserModal } from './EditUserModal.jsx';
import { SendMessageModal } from './SendMessageModal.jsx';
import { DeactivateUserModal } from './DeactivateUserModal.jsx';
import { ActivateUserModal } from './ActivateUserModal.jsx';
import { StatusToggleButton } from './StatusToggleButton.jsx';
import { showToast } from '../../utils/toast.js';
import { downloadCSV, downloadJSON } from '../../utils/csvExport.js';
import { ExportButton } from '../ui/export-button.jsx';

// Default role stats for loading state
const defaultRoleStats = [
  { role: 'Citizens', count: 0, growth: '0%', color: 'text-blue-600', icon: User },
  { role: 'Field Workers', count: 0, growth: '0%', color: 'text-green-600', icon: UserCheck },
  { role: 'Administrators', count: 0, growth: '0%', color: 'text-purple-600', icon: Shield },
  { role: 'Inactive Users', count: 0, growth: '0%', color: 'text-gray-600', icon: Clock }
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState([]);
  const [roleStats, setRoleStats] = useState(defaultRoleStats);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isActivateUserModalOpen, setIsActivateUserModalOpen] = useState(false);
  
  // Get export data from users
  const getExportData = (users) => {
    return users.map(user => ({
      ID: user.id,
      Name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      Email: user.email || '',
      Phone: user.phone || '',
      Role: user.role || '',
      Status: user.status || '',
      Department: user.department || '',
      LastActive: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never',
      RegisteredOn: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'
    }));
  };
  
  // Get JSON export data
  const getJsonExportData = (users) => {
    return users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      status: user.status || '',
      department: user.department || '',
      lastActive: user.lastActive || null,
      registeredOn: user.createdAt || null
    }));
  };
  
  // Handle export of all users as CSV
  const handleExportAllUsersCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      showToast({
        title: 'Export Failed',
        message: 'No user data available to export',
        type: 'error'
      });
      return;
    }
    
    // Prepare data for export
    const exportData = getExportData(filteredUsers);
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `civic-connect-all-users-${timestamp}.csv`;
    
    // Download the CSV file
    downloadCSV(exportData, filename);
    
    showToast({
      title: 'Export Successful',
      message: `${exportData.length} users exported as CSV`,
      type: 'success'
    });
  };
  
  // Handle export of all users as JSON
  const handleExportAllUsersJSON = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      showToast({
        title: 'Export Failed',
        message: 'No user data available to export',
        type: 'error'
      });
      return;
    }
    
    // Prepare data for export
    const exportData = getJsonExportData(filteredUsers);
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `civic-connect-all-users-${timestamp}.json`;
    
    // Download the JSON file
    downloadJSON(exportData, filename);
    
    showToast({
      title: 'Export Successful',
      message: `${exportData.length} users exported as JSON`,
      type: 'success'
    });
  };
  
  // Handle export of citizens as CSV
  const handleExportCitizensCSV = () => {
    const citizens = filteredUsers.filter(user => user.role === 'Citizen');
    if (!citizens || citizens.length === 0) {
      showToast({
        title: 'Export Failed',
        message: 'No citizen data available to export',
        type: 'error'
      });
      return;
    }
    
    // Prepare data for export
    const exportData = getExportData(citizens);
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `civic-connect-citizens-${timestamp}.csv`;
    
    // Download the CSV file
    downloadCSV(exportData, filename);
    
    showToast({
      title: 'Export Successful',
      message: `${exportData.length} citizens exported as CSV`,
      type: 'success'
    });
  };
  
  // Handle export of citizens as JSON
  const handleExportCitizensJSON = () => {
    const citizens = filteredUsers.filter(user => user.role === 'Citizen');
    if (!citizens || citizens.length === 0) {
      showToast({
        title: 'Export Failed',
        message: 'No citizen data available to export',
        type: 'error'
      });
      return;
    }
    
    // Prepare data for export
    const exportData = getJsonExportData(citizens);
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `civic-connect-citizens-${timestamp}.json`;
    
    // Download the JSON file
    downloadJSON(exportData, filename);
    
    showToast({
      title: 'Export Successful',
      message: `${exportData.length} citizens exported as JSON`,
      type: 'success'
    });
  };
  
  // Handle export of staff as CSV
  const handleExportStaffCSV = () => {
    const staff = filteredUsers.filter(user => user.role === 'Administrator' || user.role === 'Field Worker');
    if (!staff || staff.length === 0) {
      showToast({
        title: 'Export Failed',
        message: 'No staff data available to export',
        type: 'error'
      });
      return;
    }
    
    // Prepare data for export
    const exportData = getExportData(staff);
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `civic-connect-staff-${timestamp}.csv`;
    
    // Download the CSV file
    downloadCSV(exportData, filename);
    
    showToast({
      title: 'Export Successful',
      message: `${exportData.length} staff members exported as CSV`,
      type: 'success'
    });
  };
  
  // Handle export of staff as JSON
  const handleExportStaffJSON = () => {
    const staff = filteredUsers.filter(user => user.role === 'Administrator' || user.role === 'Field Worker');
    if (!staff || staff.length === 0) {
      showToast({
        title: 'Export Failed',
        message: 'No staff data available to export',
        type: 'error'
      });
      return;
    }
    
    // Prepare data for export
    const exportData = getJsonExportData(staff);
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `civic-connect-staff-${timestamp}.json`;
    
    // Download the JSON file
    downloadJSON(exportData, filename);
    
    showToast({
      title: 'Export Successful',
      message: `${exportData.length} staff members exported as JSON`,
      type: 'success'
    });
  };
  
  // Handle export of inactive users as CSV
  const handleExportInactiveUsersCSV = () => {
    const inactiveUsers = filteredUsers.filter(user => user.status === 'Inactive');
    if (!inactiveUsers || inactiveUsers.length === 0) {
      showToast({
        title: 'Export Failed',
        message: 'No inactive user data available to export',
        type: 'error'
      });
      return;
    }
    
    // Prepare data for export
    const exportData = getExportData(inactiveUsers);
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `civic-connect-inactive-users-${timestamp}.csv`;
    
    // Download the CSV file
    downloadCSV(exportData, filename);
    
    showToast({
      title: 'Export Successful',
      message: `${exportData.length} inactive users exported as CSV`,
      type: 'success'
    });
  };
  
  // Handle export of inactive users as JSON
  const handleExportInactiveUsersJSON = () => {
    const inactiveUsers = filteredUsers.filter(user => user.status === 'Inactive');
    if (!inactiveUsers || inactiveUsers.length === 0) {
      showToast({
        title: 'Export Failed',
        message: 'No inactive user data available to export',
        type: 'error'
      });
      return;
    }
    
    // Prepare data for export
    const exportData = getJsonExportData(inactiveUsers);
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `civic-connect-inactive-users-${timestamp}.json`;
    
    // Download the JSON file
    downloadJSON(exportData, filename);
    
    showToast({
      title: 'Export Successful',
      message: `${exportData.length} inactive users exported as JSON`,
      type: 'success'
    });
  };
  
  // Handle deactivate user confirmation - this is called after the modal success
  const handleDeleteUser = async (userId) => {
    if (!userId) {
      showToast({
        title: 'Error',
        message: 'User ID is missing. Cannot deactivate user.',
        type: 'error'
      });
      return;
    }
    
    try {
      setActionInProgress(true);
      
      // Update local state - set user status to Inactive
      setUserData(prev => prev.map(user => 
        user.id === userId 
          ? {...user, status: 'Inactive'} 
          : user
      ));
      
      // Update role stats without full refresh
      const updatedUsers = userData.map(u => 
        u.id === userId ? {...u, status: 'Inactive'} : u
      );
      
      const adminCount = updatedUsers.filter(u => u.role === 'Administrator').length;
      const fieldWorkerCount = updatedUsers.filter(u => u.role === 'Field Worker').length;
      const citizenCount = updatedUsers.filter(u => u.role === 'Citizen').length;
      const inactiveCount = updatedUsers.filter(u => u.status === 'Inactive').length;
      
      setRoleStats([
        { role: 'Administrators', count: adminCount, growth: '+5%', color: 'text-blue-600', icon: Shield },
        { role: 'Field Workers', count: fieldWorkerCount, growth: '+12%', color: 'text-green-600', icon: Wrench },
        { role: 'Citizens', count: citizenCount, growth: '+18%', color: 'text-amber-600', icon: User },
        { role: 'Inactive Users', count: inactiveCount, growth: '0%', color: 'text-gray-600', icon: Clock }
      ]);
      
      console.log(`User ${userId} has been deactivated and stats updated`);
    } catch (error) {
      console.error('Error processing user deactivation:', error);
      showToast({
        title: 'Warning',
        message: 'User was deactivated but data refresh failed. Please refresh the page.',
        type: 'warning'
      });
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Handle activate user confirmation - this is called after the modal success
  const handleActivateUser = async (userId) => {
    if (!userId) {
      showToast({
        title: 'Error',
        message: 'User ID is missing. Cannot activate user.',
        type: 'error'
      });
      return;
    }
    
    try {
      setActionInProgress(true);
      
      // Update local state - set user status to Active
      setUserData(prev => prev.map(user => 
        user.id === userId 
          ? {...user, status: 'Active'} 
          : user
      ));
      
      // Update role stats without full refresh
      const updatedUsers = userData.map(u => 
        u.id === userId ? {...u, status: 'Active'} : u
      );
      
      const adminCount = updatedUsers.filter(u => u.role === 'Administrator').length;
      const fieldWorkerCount = updatedUsers.filter(u => u.role === 'Field Worker').length;
      const citizenCount = updatedUsers.filter(u => u.role === 'Citizen').length;
      const inactiveCount = updatedUsers.filter(u => u.status === 'Inactive').length;
      
      setRoleStats([
        { role: 'Administrators', count: adminCount, growth: '+5%', color: 'text-blue-600', icon: Shield },
        { role: 'Field Workers', count: fieldWorkerCount, growth: '+12%', color: 'text-green-600', icon: Wrench },
        { role: 'Citizens', count: citizenCount, growth: '+18%', color: 'text-amber-600', icon: User },
        { role: 'Inactive Users', count: inactiveCount, growth: '0%', color: 'text-gray-600', icon: Clock }
      ]);
      
      console.log(`User ${userId} has been activated and stats updated`);
    } catch (error) {
      console.error('Error processing user activation:', error);
      showToast({
        title: 'Warning',
        message: 'User was activated but data refresh failed. Please refresh the page.',
        type: 'warning'
      });
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Function to fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers();
      
      // Check if response and users property exists
      if (response && response.users && Array.isArray(response.users)) {
        console.log('Raw user data from API:', response.users);
        
        // Format user data
        const formattedUsers = response.users.map(user => {
          // Debug log for each user
          if (!user.id && !user._id && !user.userId) {
            console.warn('User missing ID:', user);
          }
          
          // Debug log for active property
          console.log(`User ${user.email} active status:`, {
            active: user.active,
            isActive: user.isActive,
            status: user.status,
            id: user.id || user._id || user.userId,
            rawUser: user
          });
          
          // Map backend roles to frontend display roles
          let displayRole = 'Citizen';
          if (user.role === 'admin') {
            displayRole = 'Administrator';
          } else if (user.role === 'employee') {
            displayRole = 'Field Worker';
          } else if (user.role === 'user') {
            displayRole = 'Citizen';
          }
          
          // Get user ID
          const userId = user.id || user._id || user.userId || '';
          
          // Determine status based solely on backend data
          let userStatus = 'Active'; // Default
          
          // Check if API explicitly provided active status
          if (user.active === false || user.isActive === false) {
            userStatus = 'Inactive';
          } else if (user.status === 'inactive') {
            userStatus = 'Inactive';
          }
          
          return {
            // Check for different ID fields that might be used
            id: userId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: displayRole,
            status: userStatus,
            createdAt: user.createdAt || 'Unknown',
            lastLogin: user.lastLogin || 'Never',
            reports: user.reports || 0,
            phone: user.phone || 'Not provided',
            address: user.address || 'Not provided',
            profileImage: user.profileImage || '/avatars/placeholder.png',
            selected: false
          };
        });
        
        console.log('Formatted user data:', formattedUsers);
        setUserData(formattedUsers);
        
        // Calculate role statistics
        const adminCount = formattedUsers.filter(user => user.role === 'Administrator').length;
        const fieldWorkerCount = formattedUsers.filter(user => user.role === 'Field Worker').length;
        const citizenCount = formattedUsers.filter(user => user.role === 'Citizen').length;
        const inactiveCount = formattedUsers.filter(user => user.status === 'Inactive').length;
        
        // Set role statistics
        setRoleStats([
          { role: 'Administrators', count: adminCount, growth: '+5%', color: 'text-blue-600', icon: Shield },
          { role: 'Field Workers', count: fieldWorkerCount, growth: '+12%', color: 'text-green-600', icon: Wrench },
          { role: 'Citizens', count: citizenCount, growth: '+18%', color: 'text-amber-600', icon: User },
          { role: 'Inactive Users', count: inactiveCount, growth: '0%', color: 'text-gray-600', icon: Clock }
        ]);
      }
      
      setLoading(false);
      
      // Check if we just updated a user and need to update local state
      const lastUpdatedUserId = localStorage.getItem('lastUpdatedUserId');
      const lastUpdatedRole = localStorage.getItem('lastUpdatedRole');
      
      if (lastUpdatedUserId && lastUpdatedRole) {
        // Clear the stored values
        localStorage.removeItem('lastUpdatedUserId');
        localStorage.removeItem('lastUpdatedRole');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user data. Please try again.');
      setUserData([]); // Set empty array to prevent further errors
      setLoading(false);
    }
  };
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
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
  }, [searchTerm, roleFilter, statusFilter, userData]);

  // Toggle user status (active/inactive)
  const handleToggleStatus = async (userId) => {
    try {
      setActionInProgress(true);
      const user = userData.find(u => u.id === userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      // If user is Active, set to Inactive (isActive=false)
      // If user is Inactive, set to Active (isActive=true)
      const isActive = user.status !== 'Active';
      
      console.log(`Toggling user ${user.name} (${userId}) status to ${isActive ? 'Active' : 'Inactive'}`);
      
      // Call the API to update status in database
      const result = await apiService.toggleUserStatus(userId, isActive);
      console.log('Toggle status response:', result);
      
      // Update local state immediately for responsive UI
      setUserData(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? {...u, status: isActive ? 'Active' : 'Inactive'} 
            : u
        )
      );
      
      // Show success message
      showToast({
        title: 'Success',
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        type: 'success'
      });
      
      // Update role stats without full refresh to avoid losing state
      const updatedUsers = userData.map(u => 
        u.id === userId ? {...u, status: isActive ? 'Active' : 'Inactive'} : u
      );
      
      const adminCount = updatedUsers.filter(u => u.role === 'Administrator').length;
      const fieldWorkerCount = updatedUsers.filter(u => u.role === 'Field Worker').length;
      const citizenCount = updatedUsers.filter(u => u.role === 'Citizen').length;
      const inactiveCount = updatedUsers.filter(u => u.status === 'Inactive').length;
      
      setRoleStats([
        { role: 'Administrators', count: adminCount, growth: '+5%', color: 'text-blue-600', icon: Shield },
        { role: 'Field Workers', count: fieldWorkerCount, growth: '+12%', color: 'text-green-600', icon: Wrench },
        { role: 'Citizens', count: citizenCount, growth: '+18%', color: 'text-amber-600', icon: User },
        { role: 'Inactive Users', count: inactiveCount, growth: '0%', color: 'text-gray-600', icon: Clock }
      ]);
      
    } catch (err) {
      console.error('Error toggling user status:', err);
      showToast({
        title: 'Error',
        message: 'Failed to update user status. Please try again.',
        type: 'error'
      });
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Update user role
  const handleUpdateRole = async (userId, newRole) => {
    try {
      // Validate the userId
      if (!userId) {
        console.error("Cannot update role: User ID is undefined");
        setError('Failed to update user role: Invalid user ID');
        return;
      }
      
      setActionInProgress(true);
      
      // Map frontend roles to backend role values
      let backendRole = 'user'; // Default role
      if (newRole === 'Citizen') {
        backendRole = 'user';
      } else if (newRole === 'Field Worker') {
        backendRole = 'employee';
      } else if (newRole === 'Administrator') {
        backendRole = 'admin';
      }
      
      console.log(`Updating user ${userId} to role ${backendRole}`);
      
      // Save user ID to ensure it's available after refresh
      localStorage.setItem('lastUpdatedUserId', userId);
      localStorage.setItem('lastUpdatedRole', newRole);
      
      await apiService.updateUserRole(userId, backendRole);
      
      // Update local state
      setUserData(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? {...u, role: newRole} 
            : u
        )
      );
      
      setActionInProgress(false);
    } catch (err) {
      console.error('Error updating user role:', err);
      // Provide more detailed error message
      const errorMessage = err.message || 'Failed to update user role. Please try again.';
      setError(`Failed to update user role: ${errorMessage}`);
      setActionInProgress(false);
      
      // Force refresh data to ensure we have the latest user data
      handleRefresh();
    }
  };
  
  // Refresh user data function defined below

  // Refresh user data
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedUsers([]);
      
      const response = await apiService.getAllUsers();
      console.log('Refresh - Raw user data from API:', response.users);
      
      // Check if response and users property exists
      if (response && response.users && Array.isArray(response.users)) {
        // Format user data
        const formattedUsers = response.users.map(user => {
          // Debug log for each user
          if (!user.id && !user._id && !user.userId) {
            console.warn('Refresh - User missing ID:', user);
          }
          
          // Map backend roles to frontend display roles
          let displayRole = 'Citizen';
          if (user.role === 'admin') {
            displayRole = 'Administrator';
          } else if (user.role === 'employee') {
            displayRole = 'Field Worker';
          } else if (user.role === 'user') {
            displayRole = 'Citizen';
          }
          
          return {
            // Check for different ID fields that might be used
            id: user.id || user._id || user.userId || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: displayRole,
            status: (() => {
              // First check backend data
              let userStatus = 'Active'; // Default 
              
              // Check if API explicitly provided active status
              if (user.active === false || user.isActive === false) {
                userStatus = 'Inactive';
              } else if (user.status === 'inactive') {
                userStatus = 'Inactive';
              }
              
              return userStatus;
            })(),
            lastActive: user.lastActive || 'Never',
            reportsSubmitted: user.reportsSubmitted || 0,
            joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
            location: user.location || 'Not specified',
            phone: user.phone || 'Not provided',
            profileImage: user.profileImage
          };
        });
        
        console.log('Refresh - Formatted users:', formattedUsers);
        setUserData(formattedUsers);
        
        // Calculate role stats directly from the user data
        // This ensures the UI stats match the actual displayed data
        const citizenCount = formattedUsers.filter(u => u.role === 'Citizen').length;
        const fieldWorkerCount = formattedUsers.filter(u => u.role === 'Field Worker').length;
        const adminCount = formattedUsers.filter(u => u.role === 'Administrator').length;
        const inactiveCount = formattedUsers.filter(u => u.status === 'Inactive').length;
        
        setRoleStats([
          { 
            role: 'Citizens', 
            count: citizenCount, 
            growth: (response.stats?.citizenGrowth || 0) + '%', 
            color: 'text-blue-600', 
            icon: User 
          },
          { 
            role: 'Field Workers', 
            count: fieldWorkerCount, 
            growth: (response.stats?.fieldWorkerGrowth || 0) + '%', 
            color: 'text-green-600', 
            icon: UserCheck 
          },
          { 
            role: 'Administrators', 
            count: adminCount, 
            growth: (response.stats?.adminGrowth || 0) + '%', 
            color: 'text-purple-600', 
            icon: Shield 
          },
          { 
            role: 'Inactive Users', 
            count: inactiveCount, 
            growth: (response.stats?.inactiveGrowth || 0) + '%', 
            color: 'text-gray-600', 
            icon: Clock 
          }
        ]);
      } else {
        console.error('Invalid response structure:', response);
        setUserData([]);
      }
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError('Failed to refresh user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to perform this action');
      return;
    }
    
    switch(action) {
      case 'send-email': {
        alert(`Sending email to ${selectedUsers.length} users`);
        break;
      }
      case 'change-role': {
        // In a real implementation, this would open a modal to select the role
        const newRole = 'Citizen'; // This would come from user input in a real app
        const backendRole = 'user'; // Map to backend role
        
        selectedUsers.forEach(userId => {
          // Call the updateUserRole function for each selected user
          try {
            apiService.updateUserRole(userId, backendRole);
            // Update UI after successful API call
            setUserData(prevUsers => 
              prevUsers.map(u => 
                selectedUsers.includes(u.id) 
                  ? {...u, role: newRole} 
                  : u
              )
            );
          } catch (err) {
            console.error(`Failed to update role for user ${userId}:`, err);
          }
        });
        
        alert(`Changed role for ${selectedUsers.length} users to ${newRole}`);
        break;
      }
      case 'export': {
        alert(`Exporting data for ${selectedUsers.length} users`);
        break;
      }
      default: {
        console.log(`Unknown bulk action: ${action}`);
        break;
      }
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
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

        {/* All Users Tab */}
        <TabsContent value="all-users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage all system users, roles, and permissions</CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <ExportButton
                    onExportCSV={handleExportAllUsersCSV}
                    onExportJSON={handleExportAllUsersJSON}
                    buttonSize="sm"
                    label="Export Users"
                  />
                  <Button size="sm" onClick={() => setIsAddUserModalOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="citizen">Citizens</SelectItem>
                    <SelectItem value="field worker">Field Workers</SelectItem>
                    <SelectItem value="administrator">Administrators</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
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
                <div className="mb-6 p-3 bg-gray-50 border rounded-lg">
                  <div className="flex flex-wrap justify-between items-center">
                    <p className="text-gray-600 mb-2 md:mb-0">
                      <span className="font-medium">{selectedUsers.length}</span> users selected
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleBulkAction('send-email')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleBulkAction('change-role')}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Change Role
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleBulkAction('export')}
                    >
                      Export Selected
                    </Button>
                  </div>
                </div>
              </div>
              )}

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead key="select-all" className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all users"
                        />
                      </TableHead>
                      <TableHead key="user-header">User</TableHead>
                      <TableHead key="role-header">Role</TableHead>
                      <TableHead key="status-header">Status</TableHead>
                      <TableHead key="last-active-header">Last Active</TableHead>
                      <TableHead key="reports-header">Reports</TableHead>
                      <TableHead key="actions-header">Actions</TableHead>
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
                                {/* Using user initials for avatar fallback */}
                                {user.name.split(' ').map(n => n[0] || '').join('')}
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
                          <div className="flex items-center gap-1">
                            {user.status === 'Active' ? (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white" 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteUserModalOpen(true);
                                }}
                                disabled={actionInProgress}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button 
                                variant="default" 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white" 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsActivateUserModalOpen(true);
                                }}
                                disabled={actionInProgress}
                              >
                                Activate
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              aria-label={`Change role for ${user.name}`}
                              onClick={() => {
                                // Check if user.id exists
                                if (!user.id) {
                                  console.error('Cannot update role: User ID is missing', user);
                                  setError('Cannot update role: User ID is missing');
                                  return;
                                }
                                
                                // Simple role rotation for demo purposes
                                // In a real app, this would open a modal with role options
                                const roles = ['Citizen', 'Field Worker', 'Administrator'];
                                const currentIndex = roles.indexOf(user.role);
                                const nextRole = roles[(currentIndex + 1) % roles.length];
                                console.log(`Updating user ${user.id} from ${user.role} to ${nextRole}`);
                                handleUpdateRole(user.id, nextRole);
                              }}
                              disabled={actionInProgress}
                            >
                              <UserCog className="w-4 h-4 text-blue-500" title="Change role" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  aria-label={`More options for ${user.name}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsUserProfileModalOpen(true);
                                  }}
                                >
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsEditUserModalOpen(true);
                                  }}
                                >
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsSendMessageModalOpen(true);
                                  }}
                                >
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === 'Active' ? (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsDeleteUserModalOpen(true);
                                    }}
                                  >
                                    Deactivate User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsActivateUserModalOpen(true);
                                    }}
                                  >
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-gray-500">No users found matching your criteria</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Citizens Tab */}
        <TabsContent value="citizens" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Citizens</CardTitle>
                  <CardDescription>Manage citizen users and their permissions</CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <ExportButton
                    onExportCSV={handleExportCitizensCSV}
                    onExportJSON={handleExportCitizensJSON}
                    buttonSize="sm"
                    label="Export Citizens"
                  />
                  <Button size="sm" onClick={() => setIsAddUserModalOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Citizen
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    placeholder="Search citizens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Citizens Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead key="select-all-citizens" className="w-12">
                        <Checkbox
                          checked={
                            selectedUsers.length === 
                            userData.filter(u => u.role === 'Citizen').length && 
                            userData.filter(u => u.role === 'Citizen').length > 0
                          }
                          onCheckedChange={() => {
                            const citizenIds = userData
                              .filter(u => u.role === 'Citizen')
                              .map(u => u.id);
                            
                            if (selectedUsers.length === citizenIds.length) {
                              setSelectedUsers([]);
                            } else {
                              setSelectedUsers(citizenIds);
                            }
                          }}
                          aria-label="Select all citizens"
                        />
                      </TableHead>
                      <TableHead key="user-header-citizens">User</TableHead>
                      <TableHead key="status-header-citizens">Status</TableHead>
                      <TableHead key="last-active-header-citizens">Last Active</TableHead>
                      <TableHead key="reports-header-citizens">Reports</TableHead>
                      <TableHead key="actions-header-citizens">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userData
                      .filter(user => user.role === 'Citizen')
                      .filter(user => statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase())
                      .filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
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
                                  {user.name.split(' ').map(n => n[0] || '').join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
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
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                aria-label={`Toggle status for ${user.name}`}
                                onClick={() => handleToggleStatus(user.id)}
                                disabled={actionInProgress}
                              >
                                {user.status === 'Active' ? (
                                  <Ban className="w-4 h-4 text-red-500" title="Deactivate user" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-500" title="Activate user" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                aria-label={`Promote ${user.name} to Field Worker`}
                                onClick={() => handleUpdateRole(user.id, 'Field Worker')}
                                disabled={actionInProgress}
                              >
                                <UserCog className="w-4 h-4 text-blue-500" title="Promote to Field Worker" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    aria-label={`More options for ${user.name}`}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsUserProfileModalOpen(true);
                                    }}
                                  >
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditUserModalOpen(true);
                                    }}
                                  >
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsSendMessageModalOpen(true);
                                    }}
                                  >
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsDeleteUserModalOpen(true);
                                    }}
                                  >
                                    Deactivate User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    
                    {userData.filter(user => user.role === 'Citizen').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-gray-500">No citizens found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Staff</CardTitle>
                  <CardDescription>Manage field workers and administrators</CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <ExportButton
                    onExportCSV={handleExportStaffCSV}
                    onExportJSON={handleExportStaffJSON}
                    buttonSize="sm"
                    label="Export Staff"
                  />
                  <Button size="sm" onClick={() => setIsAddUserModalOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="field worker">Field Workers</SelectItem>
                    <SelectItem value="administrator">Administrators</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Staff Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead key="select-all-staff" className="w-12">
                        <Checkbox
                          checked={
                            selectedUsers.length === 
                            userData.filter(u => u.role === 'Field Worker' || u.role === 'Administrator').length && 
                            userData.filter(u => u.role === 'Field Worker' || u.role === 'Administrator').length > 0
                          }
                          onCheckedChange={() => {
                            const staffIds = userData
                              .filter(u => u.role === 'Field Worker' || u.role === 'Administrator')
                              .map(u => u.id);
                            
                            if (selectedUsers.length === staffIds.length) {
                              setSelectedUsers([]);
                            } else {
                              setSelectedUsers(staffIds);
                            }
                          }}
                          aria-label="Select all staff"
                        />
                      </TableHead>
                      <TableHead key="user-header-staff">User</TableHead>
                      <TableHead key="role-header-staff">Role</TableHead>
                      <TableHead key="status-header-staff">Status</TableHead>
                      <TableHead key="last-active-header-staff">Last Active</TableHead>
                      <TableHead key="actions-header-staff">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userData
                      .filter(user => user.role === 'Field Worker' || user.role === 'Administrator')
                      .filter(user => roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase())
                      .filter(user => statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase())
                      .filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
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
                                  {user.name.split(' ').map(n => n[0] || '').join('')}
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
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                aria-label={`Toggle status for ${user.name}`}
                                onClick={() => handleToggleStatus(user.id)}
                                disabled={actionInProgress}
                              >
                                {user.status === 'Active' ? (
                                  <Ban className="w-4 h-4 text-red-500" title="Deactivate user" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-500" title="Activate user" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                aria-label={`Change role for ${user.name}`}
                                onClick={() => {
                                  if (!user.id) {
                                    console.error('Cannot update role: User ID is missing', user);
                                    setError('Cannot update role: User ID is missing');
                                    return;
                                  }
                                  
                                  const roles = ['Field Worker', 'Administrator'];
                                  const currentIndex = roles.indexOf(user.role);
                                  const nextRole = roles[(currentIndex + 1) % roles.length];
                                  handleUpdateRole(user.id, nextRole);
                                }}
                                disabled={actionInProgress}
                              >
                                <UserCog className="w-4 h-4 text-blue-500" title="Change role" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    aria-label={`More options for ${user.name}`}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsUserProfileModalOpen(true);
                                    }}
                                  >
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditUserModalOpen(true);
                                    }}
                                  >
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsSendMessageModalOpen(true);
                                    }}
                                  >
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsDeleteUserModalOpen(true);
                                    }}
                                  >
                                    Deactivate Staff
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    
                    {userData.filter(user => user.role === 'Field Worker' || user.role === 'Administrator').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-gray-500">No staff members found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inactive Tab */}
        <TabsContent value="inactive" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Inactive Users</CardTitle>
                  <CardDescription>Manage users with inactive accounts</CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <ExportButton
                    onExportCSV={handleExportInactiveUsersCSV}
                    onExportJSON={handleExportInactiveUsersJSON}
                    buttonSize="sm"
                    label="Export Inactive"
                  />
                  <Button variant="outline" size="sm" onClick={() => handleRefresh()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    placeholder="Search inactive users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="citizen">Citizens</SelectItem>
                    <SelectItem value="field worker">Field Workers</SelectItem>
                    <SelectItem value="administrator">Administrators</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Inactive Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead key="select-all-inactive" className="w-12">
                        <Checkbox
                          checked={
                            selectedUsers.length === 
                            userData.filter(u => u.status === 'Inactive').length && 
                            userData.filter(u => u.status === 'Inactive').length > 0
                          }
                          onCheckedChange={() => {
                            const inactiveIds = userData
                              .filter(u => u.status === 'Inactive')
                              .map(u => u.id);
                            
                            if (selectedUsers.length === inactiveIds.length) {
                              setSelectedUsers([]);
                            } else {
                              setSelectedUsers(inactiveIds);
                            }
                          }}
                          aria-label="Select all inactive users"
                        />
                      </TableHead>
                      <TableHead key="user-header-inactive">User</TableHead>
                      <TableHead key="role-header-inactive">Role</TableHead>
                      <TableHead key="last-active-header-inactive">Last Active</TableHead>
                      <TableHead key="reports-header-inactive">Reports</TableHead>
                      <TableHead key="actions-header-inactive">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userData
                      .filter(user => user.status === 'Inactive')
                      .filter(user => roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase())
                      .filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
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
                                  {user.name.split(' ').map(n => n[0] || '').join('')}
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
                            <span className="text-sm text-gray-600">{user.lastActive}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-900">{user.reportsSubmitted}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                aria-label={`Activate ${user.name}`}
                                onClick={() => handleToggleStatus(user.id)}
                                disabled={actionInProgress}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" title="Activate user" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                aria-label={`Change role for ${user.name}`}
                                onClick={() => {
                                  if (!user.id) {
                                    console.error('Cannot update role: User ID is missing', user);
                                    setError('Cannot update role: User ID is missing');
                                    return;
                                  }
                                  
                                  const roles = ['Citizen', 'Field Worker', 'Administrator'];
                                  const currentIndex = roles.indexOf(user.role);
                                  const nextRole = roles[(currentIndex + 1) % roles.length];
                                  handleUpdateRole(user.id, nextRole);
                                }}
                                disabled={actionInProgress}
                              >
                                <UserCog className="w-4 h-4 text-blue-500" title="Change role" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    aria-label={`More options for ${user.name}`}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsUserProfileModalOpen(true);
                                    }}
                                  >
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditUserModalOpen(true);
                                    }}
                                  >
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsSendMessageModalOpen(true);
                                    }}
                                  >
                                    Contact User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsDeleteUserModalOpen(true);
                                    }}
                                  >
                                    Deactivate User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    
                    {userData.filter(user => user.status === 'Inactive').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-gray-500">No inactive users found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    
    <AddUserModal 
      open={isAddUserModalOpen}
      onOpenChange={setIsAddUserModalOpen}
      onSuccess={() => {
        fetchUsers();
      }}
    />

    {/* User Profile Modal */}
    <UserProfileModal
      user={selectedUser}
      open={isUserProfileModalOpen}
      onOpenChange={setIsUserProfileModalOpen}
    />

    {/* Edit User Modal */}
    <EditUserModal
      user={selectedUser}
      open={isEditUserModalOpen}
      onOpenChange={setIsEditUserModalOpen}
      onSuccess={(updatedUser) => {
        // Update user data in the state
        setUserData(prev => prev.map(u => 
          u.id === updatedUser.id ? { ...u, ...updatedUser } : u
        ));
      }}
    />

    {/* Send Message Modal */}
    <SendMessageModal
      user={selectedUser}
      open={isSendMessageModalOpen}
      onOpenChange={setIsSendMessageModalOpen}
      onSuccess={() => {
        // You could add additional actions here after a message is sent
        showToast({
          title: 'Message Sent',
          message: `Your message has been delivered to ${selectedUser?.name}`,
          type: 'success'
        });
      }}
    />

    {/* Deactivate User Modal */}
    <DeactivateUserModal
      user={selectedUser}
      open={isDeleteUserModalOpen}
      onOpenChange={setIsDeleteUserModalOpen}
      onSuccess={(deletedUserId) => {
        handleDeleteUser(deletedUserId);
      }}
    />

    {/* Activate User Modal */}
    <ActivateUserModal
      user={selectedUser}
      open={isActivateUserModalOpen}
      onOpenChange={setIsActivateUserModalOpen}
      onSuccess={(activatedUserId) => handleActivateUser(activatedUserId)}
    />
    </>
  );
};
