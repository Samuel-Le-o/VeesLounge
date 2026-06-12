import { useState } from "react"
import { Link, useNavigate } from "react-router" 
import { Sparkles, UserRound, Heart, ShoppingBag, Menu, X, Trash2, Plus, Minus, CheckSquare, Check, CheckSquare2Icon, Square } from "lucide-react"
import toast from "react-hot-toast"

import { useShop } from "../../utilities/ShopContext"
import ProductPage from "../pages/ProductPage"

import vespic from '../assets/vespic.png'
import logo from '../assets/logo.png'
import PurchaseOrderSummary from "./PurchaseOrderSummary"
import axios from "axios"

const colors= []

export default function NavBar({ activePage, favoriteCount, cartCount, setFavorites, bestSellers, setBestSellers }) {
    const { wholesaleMinOrderQty, allProducts, addOrder, cart, addToCart, setCart, updateCartItemStock, updateCartItemQty, updateCartItemQtyInput, removeCartItem, updateCartItemColor, updateCartItemUseMOQ, favorites, removeFavorite, viewingProduct, setViewingProductDetails, loadShopCategory, loadActivePage, isOpenPaymentSummary, openPaymentSummary, announcement, setProcessOverlay } = useShop();
    const navigate = useNavigate();

    // Drawer Interface Visibility States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [isOpenPurchaseOrderSummary, setIsOpenPurchaseOrderSummary] = useState(false);

    const totalCartCost = cart.reduce((acc, curr) => acc + (curr.purchasingPrice * curr.purchaseQty), 0);

    const moveToCart = (item) => {
        removeFavorite(item.id);
        addToCart(item);
        toast.success('Added to cart', {duration: 2000});
    };

    // Cart Modification Logic
    const updateQuantity = (id, change) => {
        
        
    };

    const handleInputChange = (id, val) => {
        // Strip out anything that isn't a numeric digit
        const numericValue = val.replace(/\D/g, '');
        updateCartItemQtyInput(id, numericValue)
    };

    const handleInputBlur = (id, val) => {

    }

    // Global route state handlers
    function closeAllDrawers() {
        setIsMenuOpen(false);
        setIsFavoritesOpen(false);
        setIsCartOpen(false);
    }

    function homeHandler() { navigate('/'); closeAllDrawers(); }

    function shopHandler() { loadShopCategory('All Jewellery'); navigate('/shop'); closeAllDrawers(); }

    function contactHandler() { navigate('/contact'); closeAllDrawers(); }

    function loginHandler() { navigate('/login'); closeAllDrawers(); };

    function viewProduct(product, source) {
        setViewingProductDetails(product);
        navigate('/product', {state: {source: source}}); 
    }

    function handleRemoveCartItem(product) {
        if (activePage === 'product' && product.id === viewingProduct.id) {
            return;
         }

         removeCartItem(product.id);
    }

    // UseMOQ Modification Logic
    const updateUseMOQ = (index) => {
        let list = cart;
        list[index].isUseMOQ = !item.isUseMOQ;
        setCart(list)
        
    };

    const proceedToPayment = async () => {
        try {
            setProcessOverlay(true);
    
            const orders = cart.map(item => {
                let buyingPrice = item.purchasingPrice;
    
                if (!item.isBuyWholesale && item.purchaseQty >= wholesaleMinOrderQty) {
                    buyingPrice = item.wholesalePrice
                }
    
                const order = {
                    id: item.id,
                    category: item.category,
                    name: item.name,
                    color: item.preferedColor,
                    price: buyingPrice,
                    wholesalePrice: item.wholesalePrice,
                    quantity: item.purchaseQty,
                    totalPrice: buyingPrice * item.purchaseQty,
                };
    
                return order;
            });
    
            // checking availability
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/order/product/availability`,
                {order: orders},
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
            console.log('results:', availabilityResults)

            let isItemUnavailable = false;
            let isItemLowStock = false;

            for (let i = 0; i < availabilityResults.length; i++) {
                const id = availabilityResults[i].productId;
                const isAvailable = availabilityResults[i].isAvailable;
                const orderQty = availabilityResults[i].orderQty;
                const currentStock = availabilityResults[i].stock;

                if (!isAvailable) {
                    isItemUnavailable = true;
                    updateCartItemStock(id, currentStock);
                }
                else {
                    if (currentStock < orderQty) {
                        isItemLowStock = true;
                        updateCartItemStock(id, currentStock);
                    }
                }
            }

            if (isItemUnavailable || isItemLowStock) {
                setProcessOverlay(false);
                return toast.error('Some items are in low stock or unavailable', { duration: 3000});
            }
    
            // count same categories
            const categories = [];
    
            orders.map((order) => {
                const category = order.category;
    
                let isNew = true;
    
                for (let i = 0; i < categories.length; i++) {
                    if (categories[i].name === category) {
                        categories[i].count = categories[i].count + 1;
                        isNew = false;
                        break;
                    }
                }
    
                if (isNew) {
                    categories.push({name: category, count: 1});
                }
            })
    
            // change prices to wholesale if quantity is 6 or more
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].count >= wholesaleMinOrderQty) {
                    orders.map(order => {
                        if (order.category === categories[i].name) {
                            order.price = order.wholesalePrice;
                            order.totalPrice = order.wholesalePrice * order.quantity;
                        }
                    })
                }
            }
    
            addOrder(orders);
            openPaymentSummary(true);
            setIsMenuOpen(false);
            setIsFavoritesOpen(false);
            setIsCartOpen(false);
            setProcessOverlay(false);
            
        } catch (error) {
            console.log(error)
            setProcessOverlay(false);
            return toast.error('Something went wrong', {duration: 2500,});
        }
    }

    return (
        <>
            <div className="fixed top-0 left-0 w-full bg-white shadow z-50 font-sans">
                {/* ANNOUNCEMENT BAR */}
                <div className="w-full overflow-hidden bg-pink-200 py-[2px] text-[10px] md:text-xs font-semibold tracking-wider text-pink-800 uppercase">
                    {
                        announcement.isDisplay && (
                            <>
                                <style>{`
                                    @keyframes marquee {
                                    0% { transform: translate3d(100%, 0, 0); }
                                    100% { transform: translate3d(-100%, 0, 0); }
                                    }
                                    .animate-marquee {
                                    animation: marquee 15s linear infinite;
                                    }
                                `}</style>

                                <div className="animate-marquee whitespace-nowrap will-change-transform inline-flex  gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                                    <span>{announcement.message}</span>
                                </div>
                            </>
                        )
                    }
                </div>

                {/* <div 
                style={{ animation: 'fadeInOut 3s ease-in-out infinite' }}
                className="flex flex-row justify-center items-center gap-1 py-[2px] bg-pink-200 text-[10px] md:text-xs font-semibold tracking-wider text-pink-800 uppercase"
                >
                <style>{`
                    @keyframes fadeInOut {
                    0%, 100% { opacity: 0.5; transform: translate3d(0, 2px, 0); }
                    50% { opacity: 1; transform: translate3d(0, 0, 0); }
                    }
                `}</style>

                <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                <span>{announcement.message}</span>
                </div> */}


                
                {/* MAIN DESKTOP NAVIGATION BAR */}
                <div className="flex flex-row items-center justify-between px-4 md:px-8 py-2">
                    <button className="md:hidden cursor-pointer active:opacity-25 p-1" onClick={() => setIsMenuOpen(true)}>
                        <Menu className="w-6 h-5"/>
                    </button>
                    
                    <div className="logo cursor-pointer" onClick={homeHandler}>
                        <img src={vespic} alt="Logo" className="w-24 h-8 md:w-28 md:h-10 object-contain" />
                    </div>

                    {
                        activePage === 'product' ? <></> :
                        <>
                            <div className="hidden md:flex flex-row items-center gap-10">
                                <div>
                                    <span className={`${activePage === 'home' ? 'text-pink-600' : 'text-black'} font-medium cursor-pointer hover:text-pink-500 transition-colors`} onClick={homeHandler}>Home</span>
                                    <div className={`${activePage === 'home' ? 'bg-pink-600' : 'bg-transparent'} w-full h-[2px] mt-1 transition-all`}></div>
                                </div>
                                <div>
                                    <span className={`${activePage === 'shop' ? 'text-pink-600' : 'text-black'} font-medium cursor-pointer hover:text-pink-500 transition-colors`} onClick={shopHandler}>Shop</span>
                                    <div className={`${activePage === 'shop' ? 'bg-pink-600' : 'bg-transparent'} w-full h-[2px] mt-1 transition-all`}></div>
                                </div>
                                <div>
                                    <span className={`${activePage === 'contact' ? 'text-pink-600' : 'text-black'} font-medium cursor-pointer hover:text-pink-500 transition-colors`} onClick={contactHandler}>Contact</span>
                                    <div className={`${activePage === 'contact' ? 'bg-pink-600' : 'bg-transparent'} w-full h-[2px] mt-1 transition-all`}></div>
                                </div>
                            </div>
                        </>
                    }

                    <div className="flex flex-row items-center gap-5 md:gap-5">
                        {/* {
                            activePage === 'product' ? '' :
                            <>
                                <button className="hidden md:flex cursor-pointer hover:text-pink-500 transition-colors" onClick={loginHandler}>
                                    <UserRound className="w-5 h-5 text-zinc-700 font-bold"/>
                                </button>
                            </>
                        } */}
                        
                        {/* Favorites Activation Button Hook */}
                        <button onClick={() => setIsFavoritesOpen(true)} className="flex flex-row items-center relative cursor-pointer hover:text-pink-500 transition-colors">
                            <Heart className="w-5 h-5 text-zinc-700 font-bold"/>
                            {favorites.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-scaleIn">
                                    {favorites.length}
                                </span>
                            )}
                        </button>
                        
                        {/* Cart Activation Button Hook */}
                        <button onClick={() => setIsCartOpen(true)} className="flex flex-row items-center relative cursor-pointer hover:text-pink-500 transition-colors">
                            <ShoppingBag className="w-5 h-5 text-zinc-700 font-bold"/>
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-scaleIn">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* LEFT SIDE DRAWER - MOBILE NAVIGATION MENU */}
                <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isMenuOpen ? "visible" : "invisible pointer-events-none"}`}>
                    <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMenuOpen ? "opacity-40" : "opacity-0"}`} onClick={() => setIsMenuOpen(false)} />
                    <div className={`absolute top-0 left-0 w-[75%] max-w-[300px] h-full bg-white shadow-xl flex flex-col p-6 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <div className="flex justify-between items-center pb-4 border-b border-pink-200">
                            <img src={logo} alt="Logo" className="w-20 h- object-contain" />
                            <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6 mt-8">
                            <span onClick={homeHandler} className={`text-base font-semibold transition-colors ${activePage === 'home' ? 'text-pink-600' : 'text-gray-800'}`}>Home</span>
                            <span onClick={shopHandler} className={`text-base font-semibold transition-colors ${activePage === 'shop' ? 'text-pink-600' : 'text-gray-800'}`}>Shop</span>
                            <span onClick={contactHandler} className={`text-base font-semibold transition-colors ${activePage === 'contact' ? 'text-pink-600' : 'text-gray-800'}`}>Contact Us</span>
                        </div>
                        {/* <div className="mt-auto pt-6 border-t border-gray-100">
                            <button onClick={loginHandler} className="w-full flex items-center justify-center gap-2 bg-pink-500 text-white font-bold py-3 px-4 rounded-xl text-sm active:scale-95 transition-all cursor-pointer">
                                <UserRound className="w-4 h-4" /> Account Login
                            </button>
                        </div> */}
                    </div>
                </div>

                {/* RIGHT SIDE DRAWER - FAVORITES (WISHLIST) PANEL */}
                <div className={`fixed inset-0 z-50 transition-all duration-300 ${isFavoritesOpen ? "visible" : "invisible pointer-events-none"}`}>
                    <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isFavoritesOpen ? "opacity-40" : "opacity-0"}`} onClick={() => setIsFavoritesOpen(false)} />
                    <div className={`absolute top-0 right-0 w-[85%] max-w-[400px] h-full bg-white shadow-2xl flex flex-col p-6 transition-transform duration-300 ease-in-out transform ${isFavoritesOpen ? "translate-x-0" : "translate-x-full"}`}>
                        <div className="flex justify-between items-center pb-4 border-b border-zinc-600">
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                <h2 className="text-sm font-bold font-mono uppercase tracking-wide text-zinc-800">Your Wishlist ({favorites.length})</h2>
                            </div>
                            <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer" onClick={() => setIsFavoritesOpen(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 no-scrollbar">
                            {favorites.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                                    <Heart className="w-10 h-10 text-zinc-200 mb-2" />
                                    <p className="text-xs font-mono font-medium text-zinc-400">Your wishlist is currently empty.</p>
                                </div>
                            ) : (
                                favorites.map(item => (
                                    <div key={item.id} className="flex gap-3 bg-pink-50 p-3 items-center">
                                        <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover  shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold font-sans text-zinc-800 truncate capitalize font-mono mb-1">{item.name}</h4>
                                                <button onClick={() => removeFavorite(item.id)} className="text-xs font-mono text-[grey] hover:text-[maroon] p-0.5 transition-colors flex items-center gap-1 cursor-pointer active:text-red-500">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-pink-600 font-sans font-bold mt-0.5">Gh₵ {item.sellingPrice.toLocaleString()}</p>
                                            <div className="flex gap-3 items-center mt-2">
                                                <button onClick={() => moveToCart(item)} className="bg-zinc-800 text-white text-[10px] font-bold px-3 py-1 rounded-md hover:bg-pink-500 transition-colors cursor-pointer active:opacity-25">
                                                    Add To Cart
                                                </button>

                                                <button onClick={() => viewProduct(item, 'favorite')} className="active:opacity-25"><p className="text-[12px] font-bold text-zinc-400 px-3 py-[1px] rounded-md hover:bg-pink-500 border-1 border-zinc-400">View</p></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE DRAWER - SHOPPING CART PANEL */}
                <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? "visible" : "invisible pointer-events-none"}`}>
                    <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isCartOpen ? "opacity-40" : "opacity-0"}`} onClick={() => setIsCartOpen(false)} />
                    <div className={`absolute top-0 right-0 w-[85%] max-w-[400px] h-full bg-white shadow-2xl flex flex-col p-6 transition-transform duration-300 ease-in-out transform ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
                        <div className="flex justify-between items-center pb-4 border-b border-zinc-600">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-pink-600" />
                                <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-800 font-mono">Your Cart ({cart.length})</h2>
                            </div>
                            <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer" onClick={() => setIsCartOpen(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* SCROLLABLE CART LIST */}
                        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                                    <ShoppingBag className="w-10 h-10 text-zinc-200 mb-2" />
                                    <p className="text-xs font-medium font-mono text-zinc-400">Your shopping cart is empty.</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className={`flex gap-3  p-3 ${activePage === 'product' && item.id === viewingProduct.id ? ' bg-pink-0' : ' bg-pink-50'}`}>

                                        <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                                        <div className="flex-1 min-w-0">
                                        <div className="">
                                            {
                                                item.stock < item.purchaseQty && (
                                                    <p className="text-[red] text-sm font-bold ">Available stock: {item.stock}</p>
                                                )
                                            }
                                            {
                                                item.stock <= 0 && (
                                                    <p className="text-[red] text-sm font-bold">Unavailable</p>
                                                )
                                            }
                                        </div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="text-sm font-bold text-zinc-800 font-sans truncate pr-2 capitalize mb-">{item.name}</h5>
                                                <button onClick={() => handleRemoveCartItem(item)} className="text-[gray] hover:text-[maroon] p-0.5 active:text-red-500 transition-colors cursor-pointer">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-pink-400  font-bold  mb-2">Gh₵ {item.purchasingPrice.toLocaleString()}</p>
                                            <div className=""></div>

                                            {/* Product Colors Display */}
                                            <div className="flex flex-wrap mb-2">
                                                <p className="text-xs font-sans capitalize mr-2">color:</p>
                                                {item.colors.map((color, colorIndex) => (
                                                <div key={colorIndex} className={`${item.preferedColor === color ? 'bg-zinc-100':'bg-zinc-0'} mr-2 px-[5px] py-[2px] rounded mb-1 cursor-pointer`}
                                                    onClick={() => {
                                                        if (activePage === 'product') {
                                                            return;
                                                            }

                                                        updateCartItemColor(color, index)
                                                    }}
                                                >
                                                    <p className="text-xs font-sans capitalize ">{color} </p>
                                                </div>
                                                ))}
                                            </div>

                                            {/* Minimum Order and Purchase Quantity */}
                                            <div className="">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <p className="text-xs font-sans">Quantity</p>
                                                    <div className="flex items-center shadow borde border-zinc-500 bg-white rounded-md">
                                                        <button onClick={() => {
                                                            if (activePage === 'product') {
                                                                return;
                                                                }

                                                            let subValue = -1;

                                                            if (item.isBuyWholesale && item.purchaseQty <= item.WholesaleMOQ) {subValue = 0}

                                                            updateCartItemQty(item.id, subValue)
                                                            
                                                        }} className="p-1 text-zinc-500 hover:bg-gray-50 cursor-pointer">
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <input 
                                                            type="text" 
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            className="w-8 text-center text-xs font-sans text-zinc-700 border-none focus:outline-none bg-transparent" 
                                                            value={item.purchaseQty} 
                                                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                                                            onBlur={() => handleInputBlur(item.id)}
                                                            readOnly={activePage === 'product'}
                                                        />
                                                        <button onClick={() => {
                                                            if (activePage === 'product') {
                                                                return;
                                                                }
                                                            updateCartItemQty(item.id, 1)
                                                        }} className="p-1 text-zinc-500 hover:bg-gray-50 cursor-pointer">
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="">
                                                    <div 
                                                        onClick={() => {
                                                            if (activePage === 'product') {
                                                                return;
                                                                }

                                                            updateCartItemUseMOQ(index);
                                                        }}

                                                        className={`flex items-center cursor-pointer ${activePage === 'product' ? 'active:opacity-100' : 'active:opacity-25'} mb-1`}
                                                    >
                                                        {!item.isBuyWholesale ? <Square className="h-3 ml-[-5px]"/>:<CheckSquare className="h-3 ml-[-5px]"/>}
                                                        <p className="text-xs text-zinc-500 font-mono">₵{item.wholesalePrice} @ wholesale</p>
                                                    </div>

                                                    <p className={`${item.isBuyWholesale ? '':'line-throug'} text-zinc-500 text-xs pl-5 font-mono font-bld`}>minimum order: {item.WholesaleMOQ}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Dynamic Quantity Controller & Price Summation Row */}
                                            <div className="flex items-center justify-between mt-3">
                                                {
                                                    !(activePage === 'product' && item.id === viewingProduct.id) && (
                                                        <button onClick={() => viewProduct(item, 'cart')} className='px-[8px] py-[3px] bg-zinc-800 rounded-[5px] cursor-pointer'>
                                                            <p className="text-xs font-bold font-sans text-white">View</p>
                                                        </button>
                                                    )
                                                }
                                                <div className=""></div>
                                                <p className="text-sm text-zinc-800 font-bold">₵{(item.purchasingPrice * item.purchaseQty).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* FOOTER CHECKOUT CARD (TOTAL ACCUMULATION VALUES) */}
                        {cart.length > 0 && (
                            <div className="pt-4 border-t border-gray-150 mt-auto bg-white">
                                <div className="flex justify-between items-baseline mb-4">
                                    <span className="text-[13px] md:text-sm font-bold text-zinc-500 uppercase tracking-wider">Subtotal:</span>
                                    <span className="text-lg md:text-xl font-bold  font-mono text-pink-600">₵{totalCartCost.toLocaleString()}</span>
                                </div>
                                <button className="w-full bg-zinc-900 text-white text-xs md:text-sm font-bold py-3.5 rounded-xl uppercase tracking-widest hover:bg-pink-600 active:scale-[0.99] transition-all shadow-md cursor-pointer"
                                onClick={proceedToPayment}
                                >
                                    Proceed To Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <PurchaseOrderSummary
                isOpen={isOpenPaymentSummary}
                setIsOpen={openPaymentSummary}
            />
        </>
    )
}
