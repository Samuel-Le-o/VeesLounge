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



export default function AllBestSellers() {
    const { allProducts, loadAllProducts, setViewingProductDetails, manageFavorite, shopCategory, shopColor, shopCollection, shopPrice, bestSellers, loadBestSellers, setHomeDataLoading, setBestSellersDataLoading, setShopDataLoading, isBestSellersDataLoading } = useShop();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const ITEMS_PER_LOAD = 4;
    const [productsData, setProductData] = useState(allProducts);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
    const [showTopBtn, setShowTopBtn] = useState(false);

    const [dataloading, setDataLoading] = useState(false);
    const [isDataError, setDataError] = useState(false);

    const loaderRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
          try {
            setBestSellersDataLoading(true);
            
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/product/all`);
            const products = response.data;

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
            setHomeDataLoading(false)
            setBestSellersDataLoading(false)
          }
        };

        if (allProducts.length <= 0) {
            fetchData();
        }
    
    }, []);

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
                isBestSellersDataLoading ? 
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
                        <section className=" w-full h-[50vh] pt-[60px] bg-[linear-gradient(90deg,#f7e9ea_0%,#e9d4d2_40%,#d8b1ad_75%,#c7938f_100%)]">
                            <div className="relative h-full  overflow-hidden">
                                <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                                    <div className="relative w-full h-full md:flex">
                                        {/* TEXT */}
                                        <div className="
                                            absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20
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

                        
                        {/* Display Product */}
                        <section className="px-4 md:px-6 pb-15 pt-5">
                            <h2 className='text-lg md:text-2xl font-bold'>All Best <span className='text-pink-600'>Sellers</span></h2>

                            {/* GRID */}
                            {/* GRID OR EMPTY STATE */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {bestSellers.map((product, index) => (
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
                                        {product.tag ? (
                                            <span className="bg-pink-600 text-white text-[11px] px-2 py-1 rounded shadow-sm pointer-events-auto">
                                            {product.tag}
                                            </span>
                                        ) : (
                                            <div />
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
                                            Gh₵ {product.oldSellingPrice}
                                        </p>
                                        )}
                                        <p className="text-xs md:text-sm font-semibold mt-1">
                                        Gh₵ {product.sellingPrice}
                                        </p>
                                    </div>
                                    </div>

                                    {/* VIEW PRODUCT */}
                                    <button
                                    className="w-full text-xs py-[8px] font-bold border-t border-zinc-200 text-zinc-400 hover:text-white hover:bg-zinc-800 active:bg-pink-600 transition-all cursor-pointer uppercase tracking-wider"
                                    onClick={() => viewProduct(product, 'all-bestsellers')}
                                    >
                                    View Product
                                    </button>
                                </div>
                                ))}
                            </div>

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
                    </div>
                )
            }
        </>
    )
}