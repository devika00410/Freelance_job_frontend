import React, { useState } from 'react';
import {
  FaFolderOpen,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileCode,
  FaFileArchive,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaDownload,
  FaEye,
  FaShare,
  FaTrash,
  FaUpload,
  FaSearch,
  FaFilter,
  FaSort,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaFolder,
  FaStar,
  FaTags
} from 'react-icons/fa';

// import './ClientFiles.css'
const ClientFiles = ({ workspace, files = [], loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Sample files data if none provided
  const sampleFiles = [
    {
      id: '1',
      name: 'Project_Brief.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'Freelancer',
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Initial project requirements and scope',
      tags: ['brief', 'requirements', 'scope'],
      starred: true
    },
    {
      id: '2',
      name: 'Design_Mockups.zip',
      type: 'archive',
      size: '15.7 MB',
      uploadedBy: 'Freelancer',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'UI/UX design mockups and wireframes',
      tags: ['design', 'ui', 'mockup'],
      starred: false
    },
    {
      id: '3',
      name: 'Contract_Agreement.docx',
      type: 'word',
      size: '1.2 MB',
      uploadedBy: 'Client',
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Signed contract agreement',
      tags: ['contract', 'legal'],
      starred: true
    },
    {
      id: '4',
      name: 'Progress_Report_Q1.xlsx',
      type: 'excel',
      size: '3.1 MB',
      uploadedBy: 'Freelancer',
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Quarterly progress report with metrics',
      tags: ['report', 'progress', 'metrics'],
      starred: false
    },
    {
      id: '5',
      name: 'Brand_Assets.zip',
      type: 'archive',
      size: '8.5 MB',
      uploadedBy: 'Client',
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Brand logos, colors, and guidelines',
      tags: ['brand', 'assets', 'logo'],
      starred: false
    },
    {
      id: '6',
      name: 'Meeting_Recording.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadedBy: 'System',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Video recording of weekly sync meeting',
      tags: ['meeting', 'recording', 'video'],
      starred: false
    },
    {
      id: '7',
      name: 'Final_Delivery.zip',
      type: 'archive',
      size: '32.8 MB',
      uploadedBy: 'Freelancer',
      uploadedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Final project deliverables',
      tags: ['delivery', 'final', 'source-code'],
      starred: true
    },
    {
      id: '8',
      name: 'Client_Feedback.pdf',
      type: 'pdf',
      size: '0.8 MB',
      uploadedBy: 'Client',
      uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Client feedback on milestone 2',
      tags: ['feedback', 'review'],
      starred: false
    }
  ];

  // Use sample files if none provided
  const fileList = files.length > 0 ? files : sampleFiles;

  // File type icons
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FaFilePdf className="pdf" />;
      case 'word': return <FaFileWord className="word" />;
      case 'excel': return <FaFileExcel className="excel" />;
      case 'powerpoint': return <FaFilePowerpoint className="powerpoint" />;
      case 'image': return <FaFileImage className="image" />;
      case 'video': return <FaFileVideo className="video" />;
      case 'archive': return <FaFileArchive className="archive" />;
      case 'code': return <FaFileCode className="code" />;
      default: return <FaFileAlt className="default" />;
    }
  };

  // File type colors
  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf': return '#ff6b6b';
      case 'word': return '#2b579a';
      case 'excel': return '#217346';
      case 'powerpoint': return '#d24726';
      case 'image': return '#4ecdc4';
      case 'video': return '#ff9f43';
      case 'archive': return '#95a5a6';
      case 'code': return '#3742fa';
      default: return '#7f8c8d';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter files
  const filteredFiles = fileList.filter(file => {
    // Search filter
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = filterType === 'all' || file.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      case 'date':
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      case 'starred':
        return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
      default:
        return 0;
    }
  });

  // Handle file selection
  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // Handle file download
  const handleDownload = (fileName) => {
    alert(`Downloading ${fileName}...`);
    // In real implementation, this would trigger actual download
  };

  // Handle file preview
  const handlePreview = (file) => {
    alert(`Previewing ${file.name}\n\nType: ${file.type}\nSize: ${file.size}\nUploaded: ${formatDate(file.uploadedAt)}`);
  };

  // Handle file share
  const handleShare = (fileName) => {
    const shareUrl = `${window.location.origin}/share/${fileName}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Share link copied to clipboard!`);
  };

  // Handle file upload
  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      alert(`Uploading ${files.length} file(s)...`);
      // In real implementation, this would upload to server
    };
    input.click();
  };

  // Get file statistics
  const getFileStats = () => {
    const totalFiles = fileList.length;
    const totalSize = fileList.reduce((sum, file) => {
      const sizeInMB = parseFloat(file.size);
      return sum + (isNaN(sizeInMB) ? 0 : sizeInMB);
    }, 0);
    const starredFiles = fileList.filter(f => f.starred).length;
    const yourFiles = fileList.filter(f => f.uploadedBy === 'Client').length;
    const freelancerFiles = fileList.filter(f => f.uploadedBy === 'Freelancer').length;

    return {
      totalFiles,
      totalSize: `${totalSize.toFixed(1)} MB`,
      starredFiles,
      yourFiles,
      freelancerFiles
    };
  };

  const stats = getFileStats();

  if (loading) {
    return (
      <div className="files-loading">
        <div className="spinner"></div>
        <p>Loading files...</p>
      </div>
    );
  }

  return (
    <div className="client-files">
      {/* Header */}
      <div className="files-header">
        <div className="header-left">
          <h2>
            <FaFolderOpen /> Project Files
          </h2>
          <p>All project-related documents, designs, and deliverables</p>
        </div>
        <div className="header-right">
          <button className="btn-primary" onClick={handleUpload}>
            <FaUpload /> Upload Files
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="files-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaFolderOpen />
          </div>
          <div className="stat-content">
            <h3>{stats.totalFiles}</h3>
            <p>Total Files</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon size">
            <FaFileArchive />
          </div>
          <div className="stat-content">
            <h3>{stats.totalSize}</h3>
            <p>Total Size</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon starred">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{stats.starredFiles}</h3>
            <p>Starred Files</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon shared">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>{stats.freelancerFiles}</h3>
            <p>Freelancer Files</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="files-controls">
        <div className="search-section">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search files by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>
              <FaFilter /> Filter by Type:
            </label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="word">Word Documents</option>
              <option value="excel">Excel Sheets</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="archive">Archives</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaSort /> Sort by:
            </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date Uploaded</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="starred">Starred First</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              □
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ≡
            </button>
          </div>
        </div>

        {/* Selected files actions */}
        {selectedFiles.length > 0 && (
          <div className="selection-actions">
            <span className="selected-count">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
            <div className="selection-buttons">
              <button className="btn-secondary">
                <FaDownload /> Download Selected
              </button>
              <button className="btn-secondary">
                <FaShare /> Share Selected
              </button>
              <button className="btn-danger">
                <FaTrash /> Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Files Grid/List */}
      <div className={`files-container ${viewMode}`}>
        {sortedFiles.length > 0 ? (
          sortedFiles.map(file => (
            <div 
              key={file.id} 
              className={`file-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}
              onClick={() => handleFileSelect(file.id)}
            >
              {/* File Icon/Preview */}
              <div className="file-preview" style={{ backgroundColor: getFileTypeColor(file.type) }}>
                {getFileIcon(file.type)}
                {file.starred && (
                  <div className="starred-badge">
                    <FaStar />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="file-info">
                <div className="file-header">
                  <h4 className="file-name" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="file-actions">
                    <button 
                      className="action-btn preview"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(file);
                      }}
                      title="Preview"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-btn download"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file.name);
                      }}
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                    <button 
                      className="action-btn share"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(file.name);
                      }}
                      title="Share"
                    >
                      <FaShare />
                    </button>
                  </div>
                </div>

                <p className="file-description">{file.description}</p>

                <div className="file-meta">
                  <span className="meta-item">
                    <FaTags /> {file.tags.map(tag => `#${tag}`).join(', ')}
                  </span>
                  <span className="meta-item">
                    <FaUser /> {file.uploadedBy}
                  </span>
                  <span className="meta-item">
                    <FaCalendarAlt /> {formatDate(file.uploadedAt)}
                  </span>
                  <span className="meta-item">
                    <FaFileAlt /> {file.size}
                  </span>
                </div>

                {/* Tags */}
                <div className="file-tags">
                  {file.tags.map((tag, index) => (
                    <span key={index} className="file-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selection checkbox */}
              <input
                type="checkbox"
                className="file-checkbox"
                checked={selectedFiles.includes(file.id)}
                onChange={() => handleFileSelect(file.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))
        ) : (
          <div className="no-files">
            <FaFolderOpen />
            <h3>No files found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button className="btn-primary" onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* File Categories */}
      <div className="file-categories">
        <h3>File Categories</h3>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon pdf">
              <FaFilePdf />
            </div>
            <div className="category-content">
              <h4>Documents</h4>
              <p>{fileList.filter(f => ['pdf', 'word', 'excel', 'powerpoint'].includes(f.type)).length} files</p>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-icon image">
              <FaFileImage />
            </div>
            <div className="category-content">
              <h4>Designs</h4>
              <p>{fileList.filter(f => f.tags.includes('design') || f.type === 'image').length} files</p>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-icon video">
              <FaFileVideo />
            </div>
            <div className="category-content">
              <h4>Media</h4>
              <p>{fileList.filter(f => ['video', 'image'].includes(f.type)).length} files</p>
            </div>
          </div>
          
          <div className="category-card">
            <div className="category-icon archive">
              <FaFileArchive />
            </div>
            <div className="category-content">
              <h4>Archives</h4>
              <p>{fileList.filter(f => f.type === 'archive').length} files</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Tips */}
      <div className="upload-tips">
        <h3>
          <FaStar /> Upload Tips
        </h3>
        <div className="tips-grid">
          <div className="tip">
            <h4>Supported Formats</h4>
            <p>PDF, DOC, DOCX, XLS, XLSX, PPT, JPG, PNG, GIF, MP4, ZIP, RAR</p>
          </div>
          <div className="tip">
            <h4>Maximum File Size</h4>
            <p>100 MB per file</p>
          </div>
          <div className="tip">
            <h4>Organization</h4>
            <p>Use descriptive names and tags for easy searching</p>
          </div>
          <div className="tip">
            <h4>Security</h4>
            <p>All files are encrypted and stored securely</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientFiles;
