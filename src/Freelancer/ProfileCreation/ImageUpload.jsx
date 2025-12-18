import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ImageUpload.css';

console.log('🔄 ImageUpload.jsx - VERSION 2.0 - LOADED ' + new Date().toLocaleTimeString());



const ImageUpload = ({ multiple = false, onImageUpload, currentImage, maxSizeMB = 5, maxImages = 10 }) => {
  const [preview, setPreview] = useState(currentImage || '');
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Function to upload a file to the server
  const uploadToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file); // Field name must match Multer 'image'
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const endpoint = `${API_URL}/api/upload/upload`;
      
      console.log('Uploading to:', endpoint);
      console.log('Field name:', 'image');
      console.log('File:', file.name, file.size, file.type);
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      
      console.log('Upload successful:', response.data);
      return response.data; // Return server response with filePath, fullUrl, etc.
      
    } catch (error) {
      console.log('Upload error:', error);
      if (error.response) {
        console.log('Error response:', error.response.data);
        console.log('Error status:', error.response.status);
      }
      throw error;
    }
  };

  const handleFileChange = async (files) => {
    if (!files || files.length === 0) return;

    setError('');
    setUploadProgress(10);
    
    // Check max images limit
    if (multiple && previews.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You have ${previews.length} and tried to add ${files.length} more.`);
      setUploadProgress(0);
      return;
    }

    // Check file size and type
    const maxSize = maxSizeMB * 1024 * 1024;
    const validFiles = [];
    const invalidFiles = [];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      } else if (file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        invalidFiles.push(`${file.name} (not an image)`);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`Cannot upload: ${invalidFiles.join(', ')}. Max size: ${maxSizeMB}MB`);
      setUploadProgress(0);
    }

    if (validFiles.length > 0) {
      const newServerImages = [];
      const newBase64Previews = [];

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          
          // Create base64 preview first
          const base64Preview = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          newBase64Previews.push(base64Preview);
          
          // Update preview immediately for better UX
          if (multiple) {
            setPreviews(prev => [...prev, base64Preview]);
          } else {
            setPreview(base64Preview);
          }
          
          // Upload to server
          const serverResponse = await uploadToServer(file);
          newServerImages.push(serverResponse);
          
          // Update progress
          const currentProgress = 10 + ((i + 1) / validFiles.length) * 80;
          setUploadProgress(currentProgress);
        }
        
        // All files uploaded successfully
        setUploadProgress(100);
        
        // Pass the server response to parent component
        if (onImageUpload) {
          if (multiple) {
            onImageUpload(newServerImages); // Pass array of server responses
          } else {
            onImageUpload(newServerImages[0]); // Pass single server response
          }
        }
        
        // Reset progress after a delay
        setTimeout(() => setUploadProgress(0), 1000);
        
      } catch (error) {
        setError(`Upload failed: ${error.message || 'Unknown error'}`);
        setUploadProgress(0);
        
        // Rollback previews if upload failed
        if (multiple) {
          setPreviews(prev => prev.slice(0, -validFiles.length));
        } else {
          setPreview('');
        }
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    handleFileChange(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileChange(files);
  };

  const removeImage = async (index) => {
    if (multiple) {
      const newPreviews = [...previews];
      newPreviews.splice(index, 1);
      setPreviews(newPreviews);
      
      // Note: Server file deletion would need another API endpoint
      if (onImageUpload) {
        onImageUpload(newPreviews);
      }
    } else {
      setPreview('');
      if (onImageUpload) {
        onImageUpload(null);
      }
    }
  };

  const clearAllImages = () => {
    setPreviews([]);
    if (onImageUpload) {
      onImageUpload([]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="image-upload-container">
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleInputChange}
          className="file-input"
        />
        <div className="upload-label">
          <div className="upload-icon">📁</div>
          <div className="upload-text">
            {multiple ? 'Click or drag to upload images' : 'Click or drag to upload image'}
          </div>
          <div className="upload-subtext">
            PNG, JPG, GIF up to {maxSizeMB}MB {multiple && `(max ${maxImages} images)`}
          </div>
          {multiple && previews.length > 0 && (
            <div className="upload-subtext">
              {previews.length} image{previews.length !== 1 ? 's' : ''} uploaded
            </div>
          )}
        </div>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Uploading... {Math.round(uploadProgress)}%
          </div>
        </div>
      )}

      {uploadProgress === 100 && (
        <div className="upload-success">
          ✓ Upload complete!
        </div>
      )}

      {error && (
        <div className="upload-error">{error}</div>
      )}

      {multiple ? (
        <>
          {previews.length > 0 && (
            <>
              <div className="images-grid">
                {previews.map((img, index) => (
                  <div key={index} className="image-item">
                    <img src={img} alt={`Upload ${index + 1}`} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="remove-grid-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={clearAllImages}
                className="remove-image-btn"
                style={{ marginTop: '10px' }}
              >
                Clear All Images
              </button>
            </>
          )}
        </>
      ) : (
        preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" className="preview-image" />
            <button 
              type="button" 
              onClick={() => removeImage(-1)} 
              className="remove-image-btn"
            >
              Remove Image
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default ImageUpload;