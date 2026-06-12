import { useEffect, useRef, useState } from 'react'
import { MoveRight, Heart, ChevronLeft, ChevronRight, HeartIcon, ShoppingBag } from 'lucide-react'
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';

import { useShop } from '../../utilities/ShopContext'
import { allProductsDummy } from '../../utilities/dummyData';

import ring from '../assets/ring-2.png'
import earring from '../assets/earring.png'
import bracelet from '../assets/bracelet.png'
import necklacegold from '../assets/necklace-gold.png'
import necklacesilver from '../assets/silver-necklace.png'
import flowernecklace from '../assets/necklace-flower.png'
import collection1 from '../assets/hero-collection.png'
import collection2 from '../assets/collection-2.png'


export default function BestSellers() {
    const { cart, addToCart, favorites, manageFavorite, bestSellers = [], loadShopCategory, setViewingProductDetails } = useShop();
    const navigate = useNavigate();

    const [] = useState([]);

    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
        const scrollAmount = 300; 
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
        }
    };

    function viewProduct(product, source) {
        setViewingProductDetails(product);
        navigate('/product', {state: {source: source}}); 
    }

    return (
        <section className='px-4 md:px-10 mb-15 md:mb-20'>
            {/* Header section wrapper layout */}
            <div className="flex justify-between items-center mb-">
                <div>
                    <h2 className='text-medium md:text-2xl font-bold'>Best <span className='text-pink-600'>Sellers</span></h2>
                </div>
                {bestSellers.length > 0 && (
                    <button className="text-[12px] text-pink-500 md:text-black md:text-sm font-bold capitalize cursor-pointer hover:text-pink-500 active:opacity-25"
                    onClick={() => {
                        loadShopCategory('All Jewellery');
                        navigate('/bestsellers');
                    }}
                    >
                    view all
                    </button>
                )}
            </div>

            <div className="relative w-full">
                {bestSellers.length === 0 ? (
                    /* EMPTY STATE VIEW VARIANT */
                    <div className="w-full flex flex-col items-center justify-center py-12 px-4 border border-dashed border-pink-200 rounded-2xl bg-pink-50/30 text-center animate-fadeIn">
                        <div className="p-4 bg-pink-50 text-pink-500 rounded-full mb-4">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        <h3 className="text-sm md:text-base font-bold text-stone-800 mb-1">
                            No Best Sellers Right Now
                        </h3>
                        <p className="text-[11px] md:text-xs text-stone-500 max-w-xs mb-5">
                            Our handpicked favorites are updating. Explore our fresh general jewelry vault catalog instead!
                        </p>
                        <button 
                            onClick={() => {
                                loadShopCategory('All Jewellery');
                                navigate('/shop');
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] md:text-xs uppercase tracking-wide active:scale-95 transition-all cursor-pointer shadow-xs"
                        >
                            <span>Browse Shop Vault</span>
                            <MoveRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    /* PRODUCT LOOP RENDER VIEW PLATFORM */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(bestSellers.slice(0, 8)).map((product, index) => (
                        <div
                            key={product.id}
                            className="rounded-xl shadow-sm overflow-hidden bg-white
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
                                <h3 className="text-xs md:text-sm font-bold capitalize text-stone-800">
                                    {product.name}
                                </h3>

                                <div className="flex gap-3">
                                    {product.oldSellingPrice > product.sellingPrice && (
                                    <p className="text-xs md:text-sm font-semibold mt-1 line-through text-[grey]">
                                        Gh₵ {product.oldSellingPrice}
                                    </p>
                                    )}
                                    <p className="text-xs md:text-sm font-semibold mt-1 text-stone-900">
                                    Gh₵ {product.sellingPrice}
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
                            onClick={() => viewProduct(product, 'bestsellers')}
                            >
                            View Product
                            </button>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
