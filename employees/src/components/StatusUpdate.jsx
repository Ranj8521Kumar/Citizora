import React, { useState } from 'react';
import { ArrowLeft, Clock, Play, Pause, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

export function StatusUpdate({ onBack }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [quickNote, setQuickNote] = useState('');

  // Mock active reports
  const activeReports = [
    {
      id: 1,
      title: 'Pothole on Main Street',
      location: '123 Main St',
      status: 'in-progress',
      startTime: '2:30 PM',
      estimatedTime: '45 min'
    },
    {
      id: 2,
      title: 'Broken Street Light',
      location: '456 Oak Ave',
      status: 'assigned',
      startTime: null,
      estimatedTime: '30 min'
    }
  ];

  const statusOptions = [
    { id: 'in-progress', label: 'Start Work', icon: Play, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'on-hold', label: 'Put on Hold', icon: Pause, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { id: 'completed', label: 'Mark Complete', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
    { id: 'need-help', label: 'Need Help', icon: AlertTriangle, color: 'bg-red-600 hover:bg-red-700' }
  ];

  const quickNotes = [
    'Work started on schedule',
    'Minor delays due to weather',
    'Additional equipment needed',
    'Completed ahead of schedule',
    'Issue more complex than expected',
    'Waiting for materials'
  ];

  const handleStatusChange = (reportId, newStatus) => {
    console.log(`Updating report ${reportId} to ${newStatus}`);
    setStatusUpdate('');
    setQuickNote('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'text-blue-600 bg-blue-50';
      case 'in-progress': return 'text-orange-600 bg-orange-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'on-hold': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Update Status</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Active Reports */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Active Reports</h2>
          <div className="space-y-3">
            {activeReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedReport?.id === report.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{report.title}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                    {report.status.replace('-', ' ').toUpperCase()}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{report.location}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Est. {report.estimatedTime}</span>
                  </div>
                  {report.startTime && (
                    <span>Started at {report.startTime}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Status Updates */}
        {selectedReport && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Status Update</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {statusOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleStatusChange(selectedReport.id, option.id)}
                    className={`flex items-center justify-center space-x-2 p-3 text-white rounded-lg transition-colors ${option.color}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Notes */}
        {selectedReport && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Add Progress Notes</h3>
            
            {/* Quick Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Notes</label>
              <div className="flex flex-wrap gap-2">
                {quickNotes.map((note, index) => (
                  <button
                    key={index}
                    onClick={() => setQuickNote(note)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Note</label>
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Add any additional notes..."
                className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <button className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>Save Update</span>
            </button>
          </div>
        )}

        {/* Recent Updates */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Updates</h3>
          <div className="space-y-3">
            {[
              { time: '2:45 PM', status: 'Started work on pothole repair', type: 'status' },
              { time: '1:30 PM', status: 'Added photo documentation', type: 'photo' },
              { time: '12:15 PM', status: 'Assigned to street light maintenance', type: 'assignment' }
            ].map((update, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{update.status}</p>
                  <p className="text-xs text-gray-500">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}