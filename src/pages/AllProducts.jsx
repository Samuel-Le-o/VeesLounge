import React, { useState } from 'react';
import '../App.css';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';

// Mock product data matching the UI exactly
const productsData = [
  { id: 1, name: "Rose Gold Infinity Ring", price: 450, rating: 5, reviews: 126, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80", tag: "BEST SELLER", category: "Rings", collection: "Infinity" },
  { id: 2, name: "Dainty Heart Necklace", price: 380, rating: 4.5, reviews: 98, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80", tag: "NEW", category: "Necklaces", collection: "Romance" },
  { id: 3, name: "Classic Hoop Earrings", price: 270, originalPrice: 320, rating: 5, reviews: 74, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&q=80", tag: "-15%", category: "Earrings", collection: "Classics" },
  { id: 4, name: "Tennis Bracelet", price: 520, rating: 4.5, reviews: 113, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80", tag: "POPULAR", category: "Bracelets", collection: "Classics" },
  { id: 5, name: "Luxury Pearl Earrings", price: 410, rating: 5, reviews: 67, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80", tag: "NEW", category: "Earrings", collection: "Pearls" },
  { id: 6, name: "Elegant Gold Necklace", price: 610, rating: 4.5, reviews: 89, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80", tag: "HOT", category: "Necklaces", collection: "Classics" },
  { id: 7, name: "Golden Knot Ring", price: 420, rating: 5, reviews: 55, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&q=80", tag: null, category: "Rings", collection: "Knot" },
  { id: 8, name: "Baguette Bracelet", price: 480, rating: 4.5, reviews: 72, image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&q=80", tag: null, category: "Bracelets", collection: "Luxury" }
];

function AllProducts() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedMaterial, setSelectedMaterial] = useState("All Materials");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [selectedCollection, setSelectedCollection] = useState("All Collections");
  const [cartCount, setCartCount] = useState(2);

  // Filter Logic
  const filteredProducts = productsData.filter(product => {
    const matchCat = selectedCategory === "All Categories" || product.category === selectedCategory;
    const matchColl = selectedCollection === "All Collections" || product.collection === selectedCollection;
    return matchCat && matchColl;
  });

  return (

    <div>
        {/* <NavBar activePage={'shop'} cartCount={cartCount} /> */}
        <NavBar 
        activePage={'all-products'} 
        favoriteCount={0}
        cartCount={0}
        favorites={[]}
        setFavorites={null}
        cart={[]}
        setCart={null}
        bestSellers={[]}
        setBestSellers={null}
        />
        
    <div className="ac-shop-page pt-7 " >

      {/* Dynamic Filter Controls Toolbar */}
      <section className="filter-section ">
        <div className="filter-grid bg-pink-100 p-5">
          <div className="filter-group ">
            <label>Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option>All Categories</option>
              <option>Rings</option>
              <option>Necklaces</option>
              <option>Earrings</option>
              <option>Bracelets</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Color</label>
            <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
              <option>All Colors</option>
              <option>Rose Gold</option>
              <option>White Gold</option>
              <option>Yellow Gold</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price</label>
            <select value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)}>
              <option>All Prices</option>
              <option>Under GHC 300</option>
              <option>GHC 300 - GHC 500</option>
              <option>Over GHC 500</option>
            </select>
          </div>



          <button className="btn-filter-submit ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
            FILTER
          </button>
        </div>
      </section>

      {/* Catalog Display Section */}
      <main className="catalog-container">
        <div className="catalog-header">
          <div className="catalog-meta">
            <h2>All Jewellery</h2>
            <p>Showing 1–{filteredProducts.length} of {filteredProducts.length} products</p>
          </div>
          <div className="sort-wrapper">
            <select className="sort-select">
              <option>Sort by Latest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Popularity</option>
            </select>
          </div>
        </div>

        {/* Dynamic Products Grid Container */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                {product.tag && (
                  <span className={`product-badge ${product.tag.toLowerCase().replace('%', 'pct')}`}>
                    {product.tag}
                  </span>
                )}
                <button className="wishlist-heart-btn" aria-label="Add to wishlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                <img src={product.image} alt={product.name} className="product-img" />
              </div>

              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <div className="rating-stars">
                  {"★".repeat(Math.floor(product.rating))}
                  {product.rating % 1 !== 0 && "★"}
                  <span className="reviews-count">({product.reviews})</span>
                </div>
                <div className="price-container">
                  {product.originalPrice && <span className="old-price">GHC {product.originalPrice.toFixed(2)}</span>}
                  <span className="current-price">GHC {product.price.toFixed(2)}</span>
                </div>
              </div>
              <button className="add-to-cart-btn" onClick={() => setCartCount(cartCount + 1)}>ADD TO CART</button>
            </div>
          ))}
        </div>

        {/* Pagination Controls Component */}
        <div className="pagination">
          <button className="page-arrow" disabled>&lt;</button>
          <button className="page-num active">1</button>
          <button className="page-num">2</button>
          <button className="page-num">3</button>
          <button className="page-num">4</button>
          <span className="page-dots">...</span>
          <button className="page-num">10</button>
          <button className="page-arrow">&gt;</button>
        </div>
      </main>

      <Footer />
    </div>
    </div>
  );

    
  ;
}

export default AllProducts;