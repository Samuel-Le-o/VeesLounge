import React, { useEffect, useState } from 'react';
import '../Category.css';
import SideBar from '../components/SideBar';
import { useAdminBackButton } from '../hooks/useAdminBackButton.jsx';
import { useShop } from '../../utilities/ShopContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Dialog from '../components/Dialog';

function Category() {
  const { categories, loadCategories } = useShop();
  useAdminBackButton();

  // Starts completely empty as requested - built from scratch
  const [allCategories, setAllCategories] = useState(categories);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isFetchCategories, setFetchCategories] = useState(false);

  const [isDialog, setDialog] = useState(false);
  const [categoryId, setCategoryId] = useState();

  // Form input states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/category/all`);

      if (categoryResponse.status === 200) {
        loadCategories(categoryResponse.data);
        setAllCategories(categoryResponse.data)
        setFetchCategories(false);
      }
    }

    if (categories.length === 0 || isFetchCategories) {
      fetchCategories();
    }
  }, [isFetchCategories])

  // Handle single image selection and render a local preview URL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Submit and save new category entry
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    setError('');
    setSubmitting(true);
    const loadId = toast.loading("Submitting category...");

    if (!newCategoryName.trim()) {
      setError('Please type a category name.');
      return;
    }

    // Verify uniqueness (case-insensitive) to prevent database collisions
    const duplicateExists = allCategories.some(
      (cat) => (cat.name).toLowerCase() === (newCategoryName.trim()).toLowerCase()
    );
    if (duplicateExists) {
      setError('This category already exists.');
      return;
    }

    formData.append("image", selectedImage);

    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/category/create`,
      formData,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          "Content-Type": "multipart/form-data",
        }
      }
    );

    if (res.status === 201 || res.status === 200) {
      toast.dismiss(loadId);
      toast.success('Category Publised', {duration: 2000});
      setNewCategoryName('');
      setSelectedImage(null);
      setImagePreview(null);
      setFetchCategories(true);
      setSubmitting(false);
    }

    setAllCategories([...allCategories, newCategory]);
  };

  // Delete handler for any created categories
  const handleDeleteCategory = async (id) => {
    setDialog(false);
    const loadId = toast.loading("Deleting category...");

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/category/delete/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
          }
        }
      )
  
      if (res.status === 200) {
        toast.dismiss(loadId);
        setFetchCategories(true);
      }
      else {
        toast.dismiss(loadId);
        setDialog(false);
        toast.error('Unsuccesfull', {duration: 2000});
      }
    } catch (error) {
        toast.dismiss(loadId);
        toast.error('Unsuccesfull', {duration: 2000});
        console.log(error)
        setDialog(false);
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <Dialog
      isOpen={isDialog}
      title={'Remove Category'}
      message={'Confirm to remove category'}
      onConfirm={() => handleDeleteCategory(categoryId)}
      onCancel={() => {
        setDialog(false)
      }}
      />
      <SideBar />


      {/* Main Panel Content Area */}
      <main className="admin-content-container">
        <header className="content-header-bar">
          <h1>Category Workspace</h1>
          <p>Configure structural catalog layouts and assign feature photos for your public website display.</p>
        </header>

        <div className="category-split-grid">
          
          {/* Form Action Engine */}
          <section className="category-card-form">
            <h2>Create Category </h2>
            <form onSubmit={handleCreateCategory} className="modern-form-stack">
              
              {error && <div className="form-error-toast">{error}</div>}

              <div className="form-input-group">
                <label htmlFor="categoryName">Category Name</label>
                <input
                name='name'
                  id="categoryName"
                  type="text"
                  placeholder="eg., Rings"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>

              <div className="form-input-group">
                <label>Display Banner </label>
                <div className="media-uploader-box">
                  <input
                    type="file"
                    id="singleCategoryFileInput"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                  <label htmlFor="singleCategoryFileInput" className="uploader-trigger-label">
                    <span className="upload-icon">📸</span>
                    {selectedImage ? 'Change Selected File' : 'Choose Photo from Device Gallery'}
                  </label>
                </div>
              </div>

              {/* Live Preview Display Box */}
              {imagePreview && (
                <div className="single-preview-wrapper">
                  <p>Target Cover Preview:</p>
                  <div className="preview-frame">
                    <img src={imagePreview} alt="Selected Category Preview" />
                    <button 
                      type="button" 
                      className="remove-preview-btn"
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    >
                      ✕ Remove Photo
                    </button>
                  </div>
                </div>
              )}

              

              {
                isSubmitting ? (
                  <div className="submit-action-btn">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <button type="submit" className="submit-action-btn">
                    Submit
                  </button>
                )
              }
            </form>
          </section>

          {/* Active Live Grid Display */}
          <section className="category-card-display">
            <h2>Active Catalog Channels ({allCategories.length})</h2>
            
            {allCategories.length === 0 ? (
              <div className="empty-state-notice">
                <span className="empty-state-icon">📂</span>
                <h3>No categories active yet</h3>
                <p>Use the creation terminal to build your storefront configuration patterns.</p>
              </div>
            ) : (
              <div className="categories-scroller-list">
                {allCategories.map((category) => (
                  <div key={category.id} className="category-row-item">
                    <div className="row-item-meta">
                      <div className="row-thumbnail-box">
                        {category.image ? (
                          <img src={category.image} alt={category.name} />
                        ) : (
                          <div className="empty-thumbnail-fallback">💎</div>
                        )}
                      </div>
                      <div className="row-text-info">
                        <h3 className='capitalize'>{category.name}</h3>
                        {/* <span className="badge custom-badge">Live Storefront</span> */}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="delete-category-btn"
                      onClick={() => {
                        setDialog(true);
                        setCategoryId(category.id)
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

    </div>
  );
}

export default Category;