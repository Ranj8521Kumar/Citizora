/**
 * Mock data for development and testing when API server is not available
 */

export const mockReports = [
  {
    _id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic hazards near the intersection of Main St and Oak Ave',
    status: 'in_progress',
    priority: 'high',
    location: {
      address: '123 Main Street',
      coordinates: [40.7128, -74.0060]
    },
    createdAt: '2025-07-25T10:30:00.000Z',
    updatedAt: '2025-08-01T14:20:00.000Z',
    submittedBy: {
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe'
    },
    estimatedResolution: '3 days',
    images: [
      {
        _id: 'img1',
        url: 'https://placehold.co/600x400?text=Pothole+Photo',
        uploadedAt: '2025-07-25T10:35:00.000Z'
      },
      {
        _id: 'img2',
        url: 'https://placehold.co/600x400?text=Worker+Progress',
        uploadedAt: '2025-08-01T14:15:00.000Z'
      }
    ],
    timeline: [
      {
        status: 'submitted',
        timestamp: '2025-07-25T10:30:00.000Z',
        comment: 'Report submitted'
      },
      {
        status: 'assigned',
        timestamp: '2025-07-26T09:15:00.000Z',
        comment: 'Assigned to repair team'
      },
      {
        status: 'in_progress',
        timestamp: '2025-08-01T14:20:00.000Z',
        comment: 'Team is working on repairs'
      }
    ],
    votes: 15
  },
  {
    _id: '2',
    title: 'Broken Street Light',
    description: 'Street light has been out for over a week at the corner of Pine and 3rd',
    status: 'submitted',
    priority: 'medium',
    location: {
      address: '300 Pine Street',
      coordinates: [40.7150, -74.0080]
    },
    createdAt: '2025-08-05T16:45:00.000Z',
    submittedBy: {
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe'
    },
    images: [
      {
        _id: 'img3',
        url: 'https://placehold.co/600x400?text=Broken+Light',
        uploadedAt: '2025-08-05T16:48:00.000Z'
      }
    ],
    timeline: [
      {
        status: 'submitted',
        timestamp: '2025-08-05T16:45:00.000Z',
        comment: 'Report submitted'
      }
    ],
    votes: 3
  },
  {
    _id: '3',
    title: 'Graffiti on Public Building',
    description: 'Inappropriate graffiti on the side of the community center building',
    status: 'resolved',
    priority: 'low',
    location: {
      address: '500 Center Avenue',
      coordinates: [40.7180, -74.0100]
    },
    createdAt: '2025-07-15T08:20:00.000Z',
    updatedAt: '2025-07-18T13:10:00.000Z',
    submittedBy: {
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe'
    },
    images: [
      {
        _id: 'img4',
        url: 'https://placehold.co/600x400?text=Graffiti+Before',
        uploadedAt: '2025-07-15T08:25:00.000Z'
      },
      {
        _id: 'img5',
        url: 'https://placehold.co/600x400?text=Graffiti+Removed',
        uploadedAt: '2025-07-18T13:05:00.000Z'
      }
    ],
    timeline: [
      {
        status: 'submitted',
        timestamp: '2025-07-15T08:20:00.000Z',
        comment: 'Report submitted'
      },
      {
        status: 'in_progress',
        timestamp: '2025-07-17T09:30:00.000Z',
        comment: 'Clean-up crew scheduled'
      },
      {
        status: 'resolved',
        timestamp: '2025-07-18T13:10:00.000Z',
        comment: 'Graffiti removed'
      }
    ],
    votes: 8
  }
];
