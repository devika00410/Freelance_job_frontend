import React, { useRef, useState } from 'react';
import axios from 'axios';
import './ImageUpload.css';
import { FaFileUpload } from 'react-icons/fa';

const ImageUpload = ({ 
  onImageUpload, 
  currentImage, 
  multiple = false, 
  aspectRatio = "1/1",
  circular = false,
  uploadUrl = "http://localhost:3000/api/upload",
  fieldName = "image"
}) => {
  const fileInputRef = useRef();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const uploadToServer = async (file) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      };

      // Add authorization header if we have a token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log('Uploading to:', uploadUrl);
      console.log('Field name:', fieldName);
      
      const response = await axios.post(uploadUrl, formData, config);

      setUploadStatus('success');
      setUploadProgress(100);
      
      console.log('Upload successful! Full response:', response.data);
      
      // Handle different response formats and ensure full URL
      let imageUrl;
      
      if (response.data.filePath) {
        // If it's a relative path, make it absolute
        if (response.data.filePath.startsWith('/')) {
          imageUrl = `http://localhost:3000${response.data.filePath}`;
        } else {
          imageUrl = response.data.filePath;
        }
      } else if (response.data.profileImage) {
        imageUrl = response.data.profileImage;
      } else if (response.data.coverImage) {
        imageUrl = response.data.coverImage;
      } else if (response.data.url) {
        imageUrl = response.data.url;
      } else if (response.data.imageUrl) {
        imageUrl = response.data.imageUrl;
      } else if (response.data.fullUrl) {
        imageUrl = response.data.fullUrl;
      } else {
        console.warn('Unexpected response format, using client-side URL:', response.data);
        // Fallback to client-side preview
        imageUrl = URL.createObjectURL(file);
      }
      
      console.log('Final image URL to display:', imageUrl);
      return imageUrl;

    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      setUploadStatus('error');
      
      // Show specific error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Upload failed';
      
      throw new Error(errorMessage);
    }
  };

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      try {
        if (multiple) {
          const uploadPromises = Array.from(files).map(file => uploadToServer(file));
          const uploadedPaths = await Promise.all(uploadPromises);
          onImageUpload(uploadedPaths);
        } else {
          const uploadedPath = await uploadToServer(files[0]);
          onImageUpload(uploadedPath);
        }
      } catch (error) {
        console.error('Upload failed:', error.message);
        alert(`Upload failed: ${error.message}`);
      }
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      try {
        if (multiple) {
          const uploadPromises = Array.from(files).map(file => uploadToServer(file));
          const uploadedPaths = await Promise.all(uploadPromises);
          onImageUpload(uploadedPaths);
        } else {
          const uploadedPath = await uploadToServer(files[0]);
          onImageUpload(uploadedPath);
        }
      } catch (error) {
        console.error('Upload failed:', error.message);
        alert(`Upload failed: ${error.message}`);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeImage = () => {
    onImageUpload(null);
    setUploadProgress(0);
    setUploadStatus('');
  };

  return (
    <div 
      className={`img-upload-container ${circular ? 'circular' : ''} ${uploadStatus ? uploadStatus : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
      style={{ aspectRatio }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple={multiple}
        style={{ display: 'none' }}
      />
      
      {currentImage ? (
        <div className={`img-upload-preview ${multiple ? 'multiple' : ''}`}>
          {multiple ? (
            currentImage.map((img, index) => (
              <div key={index} className="img-upload-preview-item">
                <img src={img} alt={`Preview ${index}`} />
                <button 
                  type="button" 
                  className="img-upload-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedImages = currentImage.filter((_, i) => i !== index);
                    onImageUpload(updatedImages);
                  }}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="img-upload-preview-item">
              <img src={currentImage} alt="Preview" />
              <button 
                type="button" 
                className="img-upload-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="img-upload-placeholder">
          <div className="img-upload-icon">
            <FaFileUpload className="img-upload-icon" size={48} />
          </div>
          <p>Click to upload {multiple ? 'images' : 'image'}</p>
          <small>or drag and drop</small>
          <small>PNG, JPG, GIF up to 10MB</small>
        </div>
      )}

      {uploadStatus === 'uploading' && (
        <div className="img-upload-progress">
          <div 
            className="img-upload-progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {uploadStatus && (
        <div className={`img-upload-status ${uploadStatus}`}>
          {uploadStatus === 'uploading' && `Uploading... ${uploadProgress}%`}
          {uploadStatus === 'success' && '✓ Uploaded'}
          {uploadStatus === 'error' && 'Upload failed'}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;