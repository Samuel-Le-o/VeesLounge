import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Heart, ShoppingBag, Search, Menu, UserRound, ChevronLeft, ChevronRight, Star, Plus, Minus, MessageCircle, Square, CheckSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useShop } from '../../utilities/ShopContext';
import NavBar from '../components/NavBar';
import WhyShopWithUs from '../components/WhyShopWithUs';
import Footer from '../components/Footer';
import { FaWhatsapp } from 'react-icons/fa';
import BestSellers from '../components/BestSellers';
import PurchaseOrderSummary from '../components/PurchaseOrderSummary';
import { ErrorState } from '../components/ErrorState'
import OrderSuccessModal from '../components/OrderSuccessModal';
import axios from 'axios';
import ProcessOverlay from '../components/ProcessOverlay';

export default function ProductPage() {
  const { allProducts, cart, addToCart, removeCartItem, removeFavorite, viewingProduct, addOrder, setProcessOverlay } = useShop();
  const { pathname } = useLocation();
  const location = useLocation();
  const navigationSource = (location.state).source;

  const { id, name, description, retailPrice, wholesalePrice, purchasingPrice, colors, preferedColor, WholesaleMOQ, purchaseQty, images, isBuyWholesale, } = viewingProduct;

    const [isOpenPurchaseOrderSummary, setIsOpenPurchaseOrderSummary] = useState(false);

    const [selectedColor, setSelectedColor] = useState();
    const [productPrice, setProductPrice] = useState();
    const [quantity, setQuantity] = useState(1);
    const [activeImg, setActiveImg] = useState();

    const [isBuyAtWholesale, setBuyAtWholesale] = useState(false);

    const [isError, setError] = useState(false);
    
    useEffect(() => {
        if (!viewingProduct.hasOwnProperty('name')) {
            setError(true);
        }
    }, [])

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]); 

    useEffect(() => {
      setIsOpenPurchaseOrderSummary(false);
      setSelectedColor(preferedColor);
      setBuyAtWholesale(isBuyWholesale);
      setProductPrice(purchasingPrice);
      setQuantity(purchaseQty);
      viewingProduct.hasOwnProperty('images') ? setActiveImg(images[0]) : setActiveImg();

    }, [viewingProduct])

    // Quantity modifiers
    const handleIncrement = () => setQuantity(prev => prev + 1);
    
    const handleDecrement = () => {
      if (isBuyAtWholesale) {
        return setQuantity(prev => (prev === WholesaleMOQ ? prev : prev -1))
      }

      setQuantity(prev => (prev > 1 ? prev - 1 : 1))
    };

    const handleInputChange = (val) => {
      // Strip out anything that isn't a numeric digit
      const numericValue = val.replace(/\D/g, '');

      if (numericValue === '') {
         return setQuantity('');
      }

      let parsedQty = parseInt(numericValue, 10);

      setQuantity(parsedQty);
    };

    const handleInputBlur = () => {
        if (quantity === '') {
          if (isBuyAtWholesale) {
            return setQuantity(WholesaleMOQ);
          }

          return setQuantity(1);
        }

        if (isBuyAtWholesale && quantity < WholesaleMOQ) {
          return setQuantity(WholesaleMOQ);
        }
    }

    const handleAddToCart = () => {
      const foundProduct = cart.find((item) => item.id === id);
      // console.log("is exist: ",foundProduct)

      if (!foundProduct) {
        const product = allProducts.find((item) => item.id === id);
        toast.success('Added to cart', {duration: 2000});
        return addToCart(product);
      }

      removeCartItem(id);
      
      foundProduct.purchasingPrice = productPrice;
      foundProduct.purchaseQty = quantity;
      foundProduct.preferedColor = selectedColor;
      foundProduct.isBuyWholesale = isBuyAtWholesale;

      addToCart(foundProduct);

      toast.success('Added to cart', {duration: 2000});
    }

    const prepareOrder = async () => {
        try {
            setProcessOverlay(true);
    
            let buyingPrice = productPrice;
    
            if (!isBuyAtWholesale && quantity >= WholesaleMOQ) {
                buyingPrice = wholesalePrice;
                setProductPrice(buyingPrice)
                setBuyAtWholesale(true);
            }
    
            const order =[ {
                id: viewingProduct.id,
                name: viewingProduct.name,
                image: viewingProduct.images[0],
                color: selectedColor,
                price: buyingPrice,
                quantity: quantity,
                totalPrice: quantity * buyingPrice,
            }];
    
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/order/product/availability`,
                {order: order},
                {
                    headers: {
                      "Content-Type": "application/json"
                    }
                }
            );
    
            if (res.status !== 200) {
                setProcessOverlay(false);
                return toast.error('Something went wrong', {duration: 2000,});
            }
    
            const availabilityResults = res.data.results;
            const product = availabilityResults[0];
            const currentStock = product.stock;
    
            if (!product.isAvailable) {
                setProcessOverlay(false);
                return toast.error('Out of Stock', {duration: 3000,});
            }
    
            if (quantity > currentStock) {
                setProcessOverlay(false);
                return toast.error(`Only ${currentStock} available`, {duration: 3000,});
            }
    
    
            addOrder(order);
            setIsOpenPurchaseOrderSummary(true);
            setProcessOverlay(false);
        } catch (error) {
            setProcessOverlay(false);
            return toast.error('Something went wrong', {duration: 2500,});
        }
    }

    return (
        <>
            {
                isError ? (
                    <ErrorState/>
                ) : (
                    <div className="">
                        <NavBar activePage={'product'}/>

                        <PurchaseOrderSummary
                            isOpen={isOpenPurchaseOrderSummary}
                            setIsOpen={setIsOpenPurchaseOrderSummary}
                        />

                        <OrderSuccessModal/>

                        <ProcessOverlay/>

                        <div className="min-h-screen bg-white text-zinc-800 font-sans pt-20 pb-">
                            <div className="px-8 mb-5">
                                {/* <h3 className="hidden md:flex text-sm">Explore our most loved pieces</h3> */}
                            </div>
                            {/* MAIN CORE HERO GRID */}
                            <main className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mt-4 mb-20">
                                
                                {/* LEFT ELEMENT: PRODUCT GALLERY VIEWER */}
                                <div className="space-y-4">
                                    <div className="relative rounded-2xl border-3 overflow-hidden border-zinc-300 flex items-center justify-center aspect-square group ">
                                        <img 
                                            src={activeImg} 
                                            alt="Rose Gold Infinity Ring Main Focus" 
                                            className="w-full h-full object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                                        />
                                        
                                    </div>

                                    {/* Horizontal Thumbnail Scroll Track Container */}
                                    <div className="flex items-center gap-3 relative px-6">
                                        {/* <button className="absolute left-0 p-1 bg-white border border-zinc-100 shadow-sm rounded-full cursor-pointer"><ChevronLeft className="h-4 w-4" /></button> */}
                                        
                                        <div className="flex gap-3 overflow-x-auto no-scrollbar w-full py-1">
                                            {images?.map((img, index) => (
                                                <button 
                                                    key={index}
                                                    onClick={() => setActiveImg(img)}
                                                    className={`w-[22%] aspect-square  rounded-xl overflow-hidden border-2 shrink-0 p-1.5 transition-all cursor-pointer ${
                                                        activeImg === img ? 'border-pink-500 ring-1 ring-pink-500' : 'border-zinc-200 hover:border-zinc-400'
                                                    }`}
                                                >
                                                    <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                                                </button>
                                            ))}
                                        </div>

                                        {/* <button className="absolute right-0 p-1 bg-white border border-zinc-100 shadow-sm rounded-full cursor-pointer"><ChevronRight className="h-4 w-4" /></button> */}
                                    </div>
                                </div>

                                {/* RIGHT ELEMENT: INLINE INFORMATION PURCHASE BOX */}
                                <div className="flex flex-col gap-6">
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 font-serif capitalize">{name}</h1>
                                    <div className="text-2xl font-black text-pink-600 tracking-wide font-sans">
                                        GH₵ {productPrice}
                                    </div>

                                    <p className="text-sm md:text-sm text-zinc-500 font-serif leading-relaxed max-w-md">{description}</p>

                                    {/* COMPONENT FILTER A: ATOMIZED SIZES TRACKER */}
                                    <div>
                                        {/* <div className="flex justify-between items-baseline mb-2">
                                            <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Size</label>
                                            <span className="text-[11px] font-semibold text-zinc-400 hover:text-pink-600 underline cursor-pointer">Size Guide</span>
                                        </div> */}
                                        {/* <div className="grid grid-cols-4 gap-2.5 max-w-sm">
                                            {['6', '7', '8', '9'].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                                                        selectedSize === size 
                                                            ? 'border-pink-500 text-pink-600 bg-pink-50/20 ring-1 ring-pink-500 font-bold' 
                                                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div> */}
                                    </div>

                                    {/* PRODUCT COLORS */}
                                    <div>
                                        <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block mb-2">COLOR</label>
                                        <div className="grid grid-cols-3 gap-2.5 max-w-md">
                                            {colors?.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-all truncate cursor-pointer capitalize ${
                                                        selectedColor === color 
                                                            ? 'border-pink-500 text-pink-600 bg-pink-50/20 ring-1 ring-pink-500 font-bold' 
                                                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                                                    }`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* STEPPER COUNTER QUANTITY WIDGET */}
                                    <div className="">
                                        <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">Quantity</label>
                                        <div className="flex gap-10 items-center">
                                            <div>
                                                <div className="flex items-center border border-zinc-200 rounded-lg w-max bg-[#fafafa]">
                                                    <button onClick={handleDecrement} className="p-2 text-zinc-500 hover:bg-zinc-100 transition-colors rounded-l-lg cursor-pointer">
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <input 
                                                        type="text" 
                                                        value={quantity} 
                                                        onChange={(e) => handleInputChange(e.target.value)}
                                                        onBlur={() => handleInputBlur()}
                                                        // readOnly
                                                        className="w-10 text-center text-xs font-bold text-zinc-800 bg-transparent focus:outline-none border-none"
                                                    />
                                                    <button onClick={handleIncrement} className="p-2 text-zinc-500 hover:bg-zinc-100 transition-colors rounded-r-lg cursor-pointer">
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="">
                                                

                                                <div className="flex items-center mb-1 active:opacity-25"
                                                    onClick={()=>{
                                                        const isWholesaleSelected = !isBuyAtWholesale

                                                        if (isWholesaleSelected) {
                                                            setBuyAtWholesale(true);
                                                            setQuantity(WholesaleMOQ);
                                                            setProductPrice(wholesalePrice)
                                                        }
                                                        else {
                                                            setBuyAtWholesale(false);
                                                            setQuantity(1);
                                                            setProductPrice(retailPrice)
                                                        }
                                                        
                                                    }}
                                                >
                                                    {!isBuyAtWholesale ? <Square className="h-4 ml-[-5px] text-zinc-500"/>:<CheckSquare className="h-4 ml-[-5px] text-zinc-500"/>}
                                                    <p className="text-xs text-zinc-500 font-mono font-bold">₵{wholesalePrice} @ wholesale</p>
                                                </div>
                                                <p className={`${isBuyAtWholesale ? '':'line-throug '} pl-5 text-xs text-zinc-500 font-mono font-bold`}>minimum order: {WholesaleMOQ}</p>
                                                {/* {
                                                    isAllowBelowMOQ && (
                                                        <div className="flex items-center active:opacity-25"
                                                            onClick={()=>{
                                                                setIsUseMOQSelected(!isUseMOQSelected);
                                                                setQuantity(minimumOrder);
                                                                setProductPrice(!isUseMOQSelected ? sellingPrice : belowMOQPrice)
                                                            }}
                                                        >
                                                            {isUseMOQSelected ? <Square className="h-4 ml-[-5px] text-zinc-400"/>:<CheckSquare className="h-4 ml-[-5px] text-zinc-400"/>}
                                                            <p className="text-xs text-zinc-400 font-mono font-bold">Order less</p>
                                                        </div>
                                                    )
                                                } */}
                                            </div>
                                        </div>
                                    </div>

                                    {/* PRICE SUMMATION ROW */}
                                    <div className="flex justify-between items-end gap-5 border-t-2 border-zinc-300 pt-2">
                                        <p className="text-[12px] font-serif font-bold text-zinc-600 uppercase">subtotal:</p>
                                        <h1 className="text-2xl font-black text-pink-600 tracking-wide font-sans text-zinc-800">₵ {(productPrice * quantity).toLocaleString()}</h1>
                                    </div>

                                    {/* TARGET TRANSACTION STRATEGIC BUTTON STACK */}
                                    <div className="space-y-3 max-w-md mt-2">
                                        {/* Add to Cart CTA */}
                                        {
                                            navigationSource !== 'cart' && (
                                            <button className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold py-3.5 rounded-xl uppercase tracking-widest active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                                            onClick={handleAddToCart}
                                            >
                                                <ShoppingBag className="h-4 w-4" /> Add To Cart
                                            </button>
                                            )
                                        }
                                        
                                        {/* Express Direct Checkout */}
                                        <button 
                                            onClick={prepareOrder}
                                            className="w-full max-w-md bg-black hover:bg-zinc-900 text-white text-xs font-bold py-3.5 rounded-xl uppercase tracking-widest active:scale-[0.99] transition-all shadow-md cursor-pointer text-center"
                                        >
                                            Buy Now
                                        </button>
                                        
                                        {/* Regional WhatsApp Order Funnel Anchor Link */}
                                        <a 
                                            href={`https://wa.me/+233556981498`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full flex items-center justify-center gap-2 border border-zinc-600 text-zinc-600 hover:bg-pink-50/50 text-xs font-bold py-3.5 rounded-xl uppercase tracking-widest transition-all cursor-pointer"
                                        >
                                            <FaWhatsapp className="h-4 w-4 text-zinc-600 fill-current" /> Order On WhatsApp
                                        </a>
                                    </div>

                                </div>
                            </main>
                            
                            {/* <BestSellers/> */}
                            
                        </div>
                        <WhyShopWithUs/>
                        <Footer/>
                    </div>
                )
            }
        </>
    );
}
