import { useState, useEffect, useRef, } from 'react'
import { Filter, Heart, ListFilter, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import axios from 'axios'

import { useShop } from '../../utilities/ShopContext'
import { allProductsDummy } from '../../utilities/dummyData'

import Hero from '../components/Hero'
import NavBar from '../components/NavBar'

import collection from '../assets/hero-collection.png'
import ring from '../assets/ring-2.png'
import silverCharmBracelet from '../assets/silver-charm-bracelet.png'
import earring from '../assets/earring.png'
import bracelet from '../assets/bracelet.png'
import necklacegold from '../assets/necklace-gold.png'
import necklacesilver from '../assets/silver-necklace.png'
import flowernecklace from '../assets/necklace-flower.png'
import collection1 from '../assets/hero-collection.png'
import collection2 from '../assets/collection-2.png'

import { ArrowUp } from "lucide-react";
import Footer from '../components/Footer'
import WhyShopWithUs from '../components/WhyShopWithUs'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import OrderSuccessModal from '../components/OrderSuccessModal'
import ProcessOverlay from '../components/ProcessOverlay'



export default function Shop() {
    const { allProducts, loadAllProducts, loadBestSellers, setViewingProductDetails, manageFavorite, shopCategory, shopColor, shopCollection, shopPrice, setHomeDataLoading, setBestSellersDataLoading, setShopDataLoading, isShopDataLoading, isOpenPaymentSummary, openPaymentSummary, setAnnouncementData, loadCategories } = useShop();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const ITEMS_PER_LOAD = 4;
    const [productsData, setProductData] = useState(allProducts);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
    const [showTopBtn, setShowTopBtn] = useState(false);

    const [dataloading, setDataLoading] = useState(false);
    const [isDataError, setDataError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
          try {
            setShopDataLoading(true);

            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/product/all`);
            const products = response.data;

            const announcementResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/announcement`);

            const categoryResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/category/all`);

            if (announcementResponse.status === 200) {
                setAnnouncementData(announcementResponse.data[0]);
            }

            if (categoryResponse.status === 200) {
                const allCategories = categoryResponse.data;
                const filteredCategories = allCategories.filter(cat => {
                    const catName = cat.name.toLowerCase();
                    if (catName === 'rings' || catName === 'necklaces' || catName === 'earrings' || catName === 'bracelets') {
                        return cat;
                    }
                })

                loadCategories(filteredCategories);
            }
            else {
                loadCategories(['All Jewellery'])
            }

            const availableProducts = products.filter(product => product.stock > 0);

            availableProducts.map((product) => {
                product.isFavorite = false
                product.preferedColor = product.colors[0]
                product.purchaseQty = 1 // product.minimumOrder
                product.orderQty = 1 // product.minimumOrder
                product.isBuyWholesale = false
                product.purchasingPrice = product.sellingPrice
            })

            loadAllProducts(availableProducts); 
            setProductData(availableProducts);
            const bestSellers = availableProducts.filter(product => product.tag === 'Best Seller');
            loadBestSellers(bestSellers);

          } catch (error) {
            setDataError(true);

          } finally {
            setShopDataLoading(false);
            setBestSellersDataLoading(false)
            setHomeDataLoading(false)
          }
        };

        if (allProducts.length <= 0) {
            fetchData();
        }
    
    }, []);

    const loaderRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
      }, [pathname]); 

    useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              setVisibleCount((prev) => prev + ITEMS_PER_LOAD);
            }
          },
          { threshold: 1 }
        );
      
        if (loaderRef.current) observer.observe(loaderRef.current);
      
        return () => observer.disconnect();
      }, []);

      useEffect(() => {
        const handleScroll = () => {
          setShowTopBtn(window.scrollY > 300);
        };
      
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }, []);
      
      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      };

    //  /////////////////////////////////////////////


    // ACTIVE (applied filters)
    const [activeCategory, setActiveCategory] = useState(shopCategory);
    const [activeColor, setActiveColor] = useState(shopColor);
    const [activePrice, setActivePrice] = useState(shopPrice);
    const [activeCollection, setActiveCollection] = useState(shopCollection);

    // TEMP (user selecting before apply)
    const [selectedCategory, setSelectedCategory] = useState(shopCategory);
    const [selectedColor, setSelectedColor] = useState(shopColor);
    const [selectedPrice, setSelectedPrice] = useState(shopPrice);
    const [selectedCollection, setSelectedCollection] = useState(shopCollection);

    const [cartCount, setCartCount] = useState(2);

    // Filter Logic
    // const filteredProducts = productsData.filter(product => {
    //   const matchCat = selectedCategory === "All Jewellery" || product.category === selectedCategory;
    //   const matchColl = selectedCollection === "All Collections" || product.collection === selectedCollection;
    //   return matchCat && matchColl;
    // });

    const filteredProducts = productsData.filter(product => {
        const matchCat =
          activeCategory === "All Jewellery" || product.category === activeCategory;
      
        const matchColl =
          activeCollection === "All Collections" || product.collection === activeCollection;
      
        const matchMaterial =
          activeColor === "All Colors" ||
          product.colors?.some(c => c.toLowerCase() === activeColor.toLowerCase());
      
        const matchPrice =
          activePrice === "All Prices" ||
          (activePrice === "Under GHC 300" && product.sellingPrice < 300) ||
          (activePrice === "GHC 300 - GHC 500" && product.sellingPrice >= 300 && product.sellingPrice <= 500) ||
          (activePrice === "Over GHC 500" && product.sellingPrice > 500);
      
        return matchCat && matchColl && matchMaterial && matchPrice;
      });

    // function viewProduct(product) {
    //     const details = {
    //         productId: product.id,
    //         title: product.title, 
    //         description: product.description, 
    //         images: product.images,
    //         price: product.price,
    //         oldPrice: product.oldPrice,
    //         colors: product.colors,
    //         preferedColor: product.preferedColor,
    //         minimumOrder: product.minimumOrder,
    //         purchaseQty: product.purchaseQty,
    //         isUseMOQ: product.isUseMOQ,
    //         belowMOQPrice: product.belowMOQPrice,
    //         // price: product.price,
    //     }

    //     setViewingProductDetails(details);
    //     navigate('/product'); 
    // }

    function viewProduct(product, source) {
        setViewingProductDetails(product);
        navigate('/product', {state: {source: source}}); 
    }

    const filterProducts = () => {
        setActiveCategory(selectedCategory);
        setActiveColor(selectedColor);
        setActivePrice(selectedPrice);
        setActiveCollection(selectedCollection);
        setVisibleCount(ITEMS_PER_LOAD); // reset pagination
        // window.scrollTo({ top: 0, behavior: "smooth" }); // optional UX
    }

    const resetFilter = () => {
        setSelectedCategory("All Jewellery");
        setSelectedColor("All Colors");
        setSelectedPrice("All Prices");
        setSelectedCollection("All Collections");
    
        setActiveCategory("All Jewellery");
        setActiveColor("All Colors");
        setActivePrice("All Prices");
        setActiveCollection("All Collections");
    }

    return (
        <>
            {
                isShopDataLoading ? 
                (
                    <LoadingState/>
                ) : isDataError ? 
                (
                    <ErrorState/>
                ) : 
                (
                    <div>
                        <NavBar activePage={'shop'}/>
                        {/* Banner */}
                        <section className=" w-full h-[35vh] md:h-[50vh] pt-[60px] bg-[linear-gradient(90deg,#f7e9ea_0%,#e9d4d2_40%,#d8b1ad_75%,#c7938f_100%)]">
                            <div className="relative h-full  overflow-hidden">
                                <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                                    <div className="relative w-full h-full md:flex">
                                        {/* TEXT */}
                                        <div className="
                                            absolute inset-0 flex flex-col items-center justify-center text-center pt-1 px-6 z-20
                                            md:static md:items-start md:text-left md:justify-center w-full md:w-1/2 md:pl-16
                                        ">
                                            <h1 className=" text-sm md:text-lg font-sans uppercase tracking-widest text-pink-600 font-bold mb-1">
                                                timeless beauty 
                                            </h1>
                                            <h2 className="text-2xl md:text-3xl capitalize mb-15 md:mb-8 w-[70%] md:w-[90%] text-zinc-800 font-bold font-serif">Discover Luxury Jewellery</h2>
                                        </div>
                                        <div className="w-full md:w-1/2 h-full">
                                            <img
                                            src={silverCharmBracelet}
                                            alt="Jewellery"
                                            className="absolute inset-0 w-full h-full  md:static md:h-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-6 sm:pb-8 md:pt-8 md:pb-10 ">
                            <div className="w-full bg-pink-50 border border-stone-200/60 shadow-sm p-2 sm:p-6 rounded-lg">
                                {/* ✅ GRID DEFINED AS 2 COLUMNS ON MOBILE, 5 COLUMNS ON DESKTOP */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-end">
                                
                                {/* Category Filter */}
                                <div className="flex flex-col space-y-0.5 sm:space-y-1.5">
                                    <label className="text-[9px] md:text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans pl-1">
                                    Category
                                    </label>
                                    <div className="relative">
                                    <select 
                                        value={selectedCategory} 
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full h-9 sm:h-11 bg-white border border-stone-200 text-stone-800 rounded-xl px-3 py-1 text-[11px] md:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-sans transition-all cursor-pointer appearance-none"
                                    >
                                        <option>All Jewellery</option>
                                        <option>Rings</option>
                                        <option>Necklaces</option>
                                        <option>Earrings</option>
                                        <option>Bracelets</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400">
                                        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                    </div>
                                </div>

                                {/* Color Filter */}
                                <div className="flex flex-col space-y-0.5 sm:space-y-1.5">
                                    <label className="text-[9px] md:text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans pl-1">
                                    Color
                                    </label>
                                    <div className="relative">
                                    <select 
                                        value={selectedColor} 
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                        className="w-full h-9 sm:h-11 bg-white border border-stone-200 text-stone-800 rounded-xl px-3 py-1 text-[11px] md:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all cursor-pointer appearance-none"
                                    >
                                        <option>All Colors</option>
                                        <option>Rose Gold</option>
                                        <option>White Gold</option>
                                        <option>Yellow Gold</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400">
                                        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div className="flex flex-col space-y-0.5 sm:space-y-1.5">
                                    <label className="text-[9px] md:text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans pl-1">
                                    Price
                                    </label>
                                    <div className="relative">
                                    <select 
                                        value={selectedPrice} 
                                        onChange={(e) => setSelectedPrice(e.target.value)}
                                        className="w-full h-9 sm:h-11 bg-white border border-stone-200 text-stone-800 rounded-xl px-3 py-1 text-[11px] md:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all cursor-pointer appearance-none"
                                    >
                                        <option>All Prices</option>
                                        <option>Under GHC 300</option>
                                        <option>GHC 300 - GHC 500</option>
                                        <option>Over GHC 500</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400">
                                        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                    </div>
                                </div>

                                {/* Collection Filter */}
                                {/* <div className="flex flex-col space-y-0.5 sm:space-y-1.5">
                                    <label className="text-[9px] md:text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans pl-1">
                                    Collection
                                    </label>
                                    <div className="relative">
                                    <select 
                                        value={selectedCollection} 
                                        onChange={(e) => setSelectedCollection(e.target.value)}
                                        className="w-full h-9 sm:h-11 bg-white border border-stone-200 text-stone-800 rounded-xl px-3 py-1 text-[11px] md:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all cursor-pointer appearance-none"
                                    >
                                        <option>All Collections</option>
                                        <option>Classic</option>
                                        <option>Elegance</option>
                                        <option>Luxury</option>
                                        <option>Royal</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400">
                                        <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                    </div>
                                </div> */}

                                {/* Filter Button */}
                                {/* ✅ SPANS ACROSS BOTH COLUMNS ON MOBILE, RESETS TO 1 COLUMN ON DESKTOP */}
                                <div className="col-span-1 sm:col-span-1">
                                    <button className="w-full h-9 sm:h-11 bg-pink-600 hover:bg-pink-700 active:scale-[0.98] flex items-center justify-center gap-2 rounded-xl sm:rounded-xl md:rounded-full shadow-sm hover:shadow transition-all duration-200 group cursor-pointer"
                                    onClick={filterProducts}
                                    >
                                    <ListFilter className="w-4 h-4 text-white transition-transform group-hover:scale-110" />
                                    <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider font-sans">
                                        Apply Filter
                                    </span>
                                    </button>
                                </div>

                                </div>
                            </div>
                        </section>


                        
                        {/* Display Product */}
                        <section className="px-4 md:px-6 pb-20">
                            <h2 className="text-lg md:text-2xl font-bold mb-">
                                {activeCategory}
                            </h2>

                            {/* GRID */}
                            {/* GRID OR EMPTY STATE */}
                            {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {filteredProducts.slice(0, visibleCount).map((product, index) => (
                                <div
                                    key={product.id}
                                    className="rounded-xl shadow-sm overflow-hidden
                                    transform transition-all duration-500 opacity-0 translate-y-6 animate-fadeIn"
                                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                                >
                                    {/* IMAGE */}
                                    <div className="relative h-[140px] md:h-[200px] overflow-hidden">
                                    <img
                                        src={product.images[0]}
                                        className="w-full h-full object-cover hover:scale-110 transition duration-500"
                                    />

                                    <div className="absolute top-2 inset-x-0 px-2 flex items-center justify-between pointer-events-none">
                                        <div>
                                        {product.tag !== '' && (
                                            <span className="bg-pink-600 text-white text-[11px] px-2 py-1 rounded shadow-sm pointer-events-auto">
                                            {product.tag}
                                            </span>
                                        )}
                                        </div>

                                        <button
                                        className="p-1 md-p-1.5 bg-white/80 backdrop-blur-xs hover:bg-white text-stone-800 hover:text-pink-600 rounded-full shadow-xs transition-all pointer-events-auto active:scale-90 cursor-pointer"
                                        onClick={() => manageFavorite(product.id)}
                                        >
                                        <Heart
                                            className={`w-4 h-4 md:w-5 md:h-5 ${
                                            product.isFavorite
                                                ? "fill-pink-600 text-pink-600"
                                                : "text-stone-700"
                                            }`}
                                        />
                                        </button>
                                    </div>
                                    </div>

                                    {/* INFO */}
                                    <div className="p-3">
                                        <h3 className="text-xs md:text-sm font-bold capitalize">
                                            {product.name}
                                        </h3>

                                        <div className="flex gap-3">
                                            {product.oldSellingPrice > product.sellingPrice && (
                                            <p className="text-xs md:text-sm font-semibold mt-1 line-through text-[grey]">
                                                Gh₵ {Number(product.oldSellingPrice).toFixed(2)}
                                            </p>
                                            )}
                                            <p className="text-xs md:text-sm font-semibold mt-1">
                                            Gh₵ {Number(product.sellingPrice).toFixed(2)}
                                            </p>
                                        </div>

                                        {
                                            product.isPromotion && (
                                                <div className="mt-2.5 flex items-center justify-between gap-1.5 border border-pink-500/20 bg-pink-500/5 px-2 py-1 rounded-md text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                                                    <span>Limited Time Offer</span>
                                                    <span className="text-white bg-pink-600 px-1 rounded text-[9px]">SAVE</span>
                                                </div>
                                            )
                                        }
                                    </div>

                                    {/* VIEW PRODUCT */}
                                    <button
                                    className="w-full text-xs py-[8px] font-bold border-t border-zinc-200 text-zinc-400 hover:text-white hover:bg-zinc-800 active:bg-pink-600 transition-all cursor-pointer uppercase tracking-wider"
                                    onClick={() => viewProduct(product, 'shop')}
                                    >
                                    View Product
                                    </button>
                                </div>
                                ))}
                            </div>
                            ) : (
                            /* EMPTY STATE */
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                
                                {/* ICON */}
                                <div className="bg-pink-100 text-pink-600 p-4 rounded-full mb-4">
                                <Filter className="w-8 h-8" />
                                </div>

                                {/* MESSAGE */}
                                <h3 className="text-lg font-semibold text-zinc-800 mb-2">
                                No Products Found
                                </h3>
                                
                                <p className="text-sm text-zinc-500 max-w-sm">
                                Try adjusting your filters or selecting a different category to find what you're looking for.
                                </p>

                                {/* ACTION */}
                                <button
                                onClick={resetFilter}
                                className="mt-5 px-5 py-2 bg-pink-600 text-white text-sm rounded-full hover:bg-pink-700 transition"
                                >
                                Reset Filters
                                </button>
                            </div>
                            )}

                            {/* EMPTY PRODUCT */}
                            <div className="flex justify-center h-[200px0"></div>

                            {/* LOAD TRIGGER */}
                            <div ref={loaderRef} className="h-10"></div>
                        </section>

                        <WhyShopWithUs/>
                        <Footer/>

                        {/* Scroll to top */}
                        {showTopBtn && (
                            <button
                                onClick={scrollToTop}
                                className="fixed bottom-6 right-6 z-50 bg-black text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        )}


                        <OrderSuccessModal/>
                        <ProcessOverlay/>
                        {/* <PurchaseOrderSummary
                            isOpen={isOpenPaymentSummary}
                            setIsOpen={openPaymentSummary}
                        /> */}
                        {/* <section id="center">
                            <div class="flex flex-row items-center justify-cennter gap-2">
                                <p class=" md:text-[14px] text-center text-[grey] font-bold">Shop Page Under Development</p>
                                <Settings class="w-4 h-4 animate-spin text-[grey] font-bold"/>
                            </div>
                        </section> */}
                    </div>
                )
            }
        </>
    )
}