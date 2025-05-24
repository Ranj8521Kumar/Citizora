/**
 * Upload Service
 * Handles file uploads to Cloudinary
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { ApiError } = require('../middleware/error.middleware');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError('Not an image! Please upload only images.', 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

/**
 * Convert buffer to readable stream for Cloudinary
 * @param {Buffer} buffer - File buffer
 * @returns {Readable} Readable stream
 */
const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });
  return readable;
};

/**
 * Upload a file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - File name
 * @param {String} uploadType - Type of upload (report, fieldwork, etc.)
 * @returns {Promise<String>} URL of the uploaded file
 */
const uploadToCloudinary = (fileBuffer, fileName, uploadType = 'general') => {
  return new Promise((resolve, reject) => {
    // Create folder based on upload type
    let folder = 'civic-connect/uploads';

    switch (uploadType) {
      case 'fieldwork':
        folder = 'civic-connect/fieldwork';
        break;
      case 'report':
        folder = 'civic-connect/reports';
        break;
      case 'progress':
        folder = 'civic-connect/fieldwork/progress';
        break;
      case 'completion':
        folder = 'civic-connect/fieldwork/completion';
        break;
      default:
        folder = 'civic-connect/uploads';
    }

    // Create a unique public_id (filename without extension)
    const publicId = `${folder}/${Date.now()}-${fileName.split('.')[0]}`;

    // Create upload stream
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        overwrite: true
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          return reject(new ApiError('File upload failed', 500));
        }
        resolve(result.secure_url);
      }
    );

    // Convert buffer to stream and pipe to upload stream
    bufferToStream(fileBuffer).pipe(stream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {String} fileUrl - URL of the file to delete
 * @returns {Promise<void>}
 */
const deleteFromCloudinary = async (fileUrl) => {
  try {
    // Extract the public_id from the URL
    // Cloudinary URLs look like: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const urlParts = fileUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicIdParts = publicIdWithExtension.split('.');

    // Remove the file extension to get the public_id
    const publicId = publicIdParts.slice(0, -1).join('.');

    // Delete the file from Cloudinary
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new ApiError('File deletion failed', 500);
  }
};

/**
 * Upload field worker images with metadata
 * @param {Array} files - Array of file objects
 * @param {Object} metadata - Additional metadata for the upload
 * @returns {Promise<Array>} Array of uploaded image objects
 */
const uploadFieldWorkerImages = async (files, metadata = {}) => {
  try {
    const uploadedImages = [];

    for (const file of files) {
      const downloadURL = await uploadToCloudinary(
        file.buffer,
        file.originalname,
        metadata.uploadType || 'fieldwork'
      );

      uploadedImages.push({
        url: downloadURL,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadType: metadata.uploadType || 'fieldwork',
        location: metadata.location || null,
        reportId: metadata.reportId || null,
        description: metadata.description || '',
        uploadedAt: new Date()
      });
    }

    return uploadedImages;
  } catch (error) {
    console.error('Error uploading field worker images:', error);
    throw new ApiError('Field worker image upload failed', 500);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadFieldWorkerImages
};
