import React, { useState } from 'react';
import '../Collection.css';
import { FiFolder, FiType, FiFileText, FiImage, FiArrowLeft, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router'; // or 'react-router-dom' depending on your project setup
import axios from 'axios';
import SideBar from '../components/SideBar';

function Collection() {
  const navigate = useNavigate();
  
  // State variables for form inputs
  const [collectionName, setCollectionName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Component status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Automatically generate a URL slug when the user types a collection name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setCollectionName(name);
    
    // Convert to lowercase, replace spaces/special chars with hyphens
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-');         // Remove consecutive hyphens
    setSlug(generatedSlug);
  };

  // Handle local image selection and generate temporary preview URL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Form submission logic handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      setMessage({ text: 'Collection Name is strictly required.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ text: '', type: '' });

      // Using FormData to handle both text inputs and binary file data
      const formData = new FormData();
      formData.append('name', collectionName);
      formData.append('slug', slug);
      formData.append('description', description);
      formData.append('status', status);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const token = localStorage.getItem("ACCESS_TOKEN");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/collection/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${token}`
          }
        }
      );

      setMessage({ text: 'Collection created successfully!', type: 'success' });
      
      // Clear form inputs on success
      setCollectionName('');
      setSlug('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);

      // Redirect back to main dashboard or collection list after 1.5 seconds
      setTimeout(() => navigate(-1), 1500);

    } catch (error) {
      console.error("Collection creation operation failed:", error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to communicate with database engine.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="collection-page-container">
        <SideBar />



      {/* Top Navigation Row */}
      <header className="collection-page-header">
        <button className="back-btn-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> <span>Back</span>
        </button>
        <h1>New Category Collection</h1>
      </header>

      {/* Main Panel Content Card Form */}
      <form className="collection-form-card" onSubmit={handleFormSubmit}>
        
        {/* User Alert Banner */}
        {message.text && (
          <div className={`form-alert-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-layout-grid">
          
          {/* Left Block: Primary Properties */}
          <div className="form-main-inputs">
            
            {/* Input Row: Collection Name */}
            <div className="input-field-group">
              <label><FiType className="field-icon" /> Collection Title</label>
              <input 
                type="text" 
                placeholder="e.g., Diamond Engagement Rings" 
                value={collectionName}
                onChange={handleNameChange}
                required
              />
            </div>

            {/* Input Row: URL Slug (Auto Generated) */}
            <div className="input-field-group">
              <label><FiFolder className="field-icon" /> URL Handle Slug</label>
              <input 
                type="text" 
                placeholder="diamond-engagement-rings" 
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
              <small className="field-helper-text">This will be the web address structure used by customers to visit this catalog.</small>
            </div>

            {/* Input Row: Description */}
            <div className="input-field-group">
              <label><FiFileText className="field-icon" /> Description Summary</label>
              <textarea 
                rows="5" 
                placeholder="Describe the aesthetic background, item types, or designer notes for this grouping..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Right Block: Image Context & Status Controls */}
          <div className="form-sidebar-controls">
            
            {/* Control Block: Visibility Status */}
            <div className="input-field-group">
              <label>Visibility Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active (Visible Store-Wide)</option>
                <option value="hidden">Hidden (Internal Draft)</option>
              </select>
            </div>

            {/* Control Block: Media Image Upload */}
            <div className="input-field-group">
              <label><FiImage className="field-icon" /> Collection Cover Image</label>
              
              <div className="media-uploader-box">
                {imagePreview ? (
                  <div className="preview-container">
                    <img src={imagePreview} alt="Collection banner preview" />
                    <label htmlFor="file-upload-input" className="change-image-overlay">
                      Change Cover
                    </label>
                  </div>
                ) : (
                  <label htmlFor="file-upload-input" className="uploader-placeholder">
                    <FiImage className="placeholder-icon" />
                    <span>Upload Banner Image</span>
                    <small>Supports PNG, JPG, or WEBP formats</small>
                  </label>
                )}
                <input 
                  id="file-upload-input"
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Form Action Buttons */}
        <footer className="form-footer-actions">
          <button 
            type="button" 
            className="cancel-action-btn" 
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-action-btn" 
            disabled={isSubmitting}
          >
            <FiSave /> {isSubmitting ? 'Saving to Store...' : 'Create Collection'}
          </button>
        </footer>

      </form>
    </div>
  );
}

export default CreateCollection;