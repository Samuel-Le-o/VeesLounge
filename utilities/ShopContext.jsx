import { createContext, useContext, useState } from 'react';

// Initialize the raw context instance object
const ShopContext = createContext(undefined);

// Structural Wrapper Component Provider
export function ShopProvider({ children }) {
    const [wholesaleMinOrderQty, setWholesaleMinOrderQty] = useState(6);

    const [allProducts, setAllProducts] = useState([]);
    const [viewingProduct, setViewingProduct] = useState({});

    const [categories, setCategories] = useState([])

    const [ishomeDataLoading, setisHomeDataLoading] = useState(true);
    const [isShopDataLoading, setisShopDataLoading] = useState(true);
    const [isBestSellersDataLoading, setIsBestSellersDataLoading] = useState(true);
    const [] = useState([]);
    
    const [isOpenPaymentSummary, setOpenPaymentSummary] = useState(false);
    const [paystackResponse, setPaystackResponse] = useState(null);

    const [orders, setOrders] = useState([]);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [successfulOrders, setSuccessfulOrders] = useState([]);
    const [trackingOrder, setTrackingOrder] = useState({});
    const [orderReceipt, setOrderReceipt] = useState({});

    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    
    const [bestSellers, setBestSellers] = useState([]);

    const [activePage, setActivePage] = useState('home');

    const [shopCategory, setShopAllCategory] = useState("All Jewellery");
    const [shopColor, setShopColor] = useState("All Colors");
    const [shopPrice, setShopPrice] = useState("All Prices");
    const [shopCollection, setShopCollection] = useState("All Collections");

    const [isProcessing, setProcessing] = useState(false);

    const [announcement, setAnnouncement] = useState({message: "", isDisplay: false});

    const paystackKey = 'pk_live_b719b05ba80b43fa0efa101aabaaf40cd5fa4691';
    // const paystackKey = 'pk_test_db11b399b9f558c72508d218d313f13b35e2658d';

    const setHomeDataLoading = (val) => {
        setisHomeDataLoading(val);
    }

    const setShopDataLoading = (val) => {
        setisShopDataLoading(val);
    }

    const setBestSellersDataLoading = (val) => {
        setIsBestSellersDataLoading(val);
    }

    const activatePage = (page) => {
        setActivePage(page);
    }

    const loadAllProducts = (products) => {
        setAllProducts(products);
    }

    const loadCategories = (cats) => {
        setCategories(cats);
    }

    const loadAllBestSellers = (products) => {
        setBestSellers(products);
    }

    const addOrder = (newOrder) => {
            setOrders(newOrder);
    }

    const loadOrderReceipt = (receipt) => {
            setOrderReceipt(receipt);
    }

    const updateIsOrderSuccess = (value) => {
        setIsOrderSuccess(value);
    }

    const clearOrders = () => {
        setOrders([]);
    }

    const addToCart = (product) => {
        try {
            setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart;
            }
            removeFavorite(product.id);
            return [...prevCart, product];
            });
        } catch (error) {
            console.log(error)
        }
    };

    const updateCartItemUseMOQ = (index) => {
        const updated = [...cart];

        let isBuyWholesalePrice = updated[index].isBuyWholesale;
        isBuyWholesalePrice = !isBuyWholesalePrice;

        updated[index].isBuyWholesale = isBuyWholesalePrice;

        if (isBuyWholesalePrice) {
            updated[index].purchaseQty = updated[index].WholesaleMOQ;
            updated[index].purchasingPrice = updated[index].wholesalePrice;
        }
        else {
            updated[index].purchaseQty = 1;
            updated[index].purchasingPrice = updated[index].retailPrice;
        }
                                            
        setCart(updated);
    }

    const updateCartItemQty = (id, change) => {
        setCart(cart.map(item => {
            if (item.id === id) {

                if (item.purchaseQty === '') {
                    return { ...item, purchaseQty: 1, isBuyWholesale: false };
                }

                const newQty = parseInt(item.purchaseQty) + change;
                return newQty > 0 ? { ...item, purchaseQty: newQty } : item;
            }
            
            return item;
        }));
    }

    const updateCartItemQtyInput = (id, change) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                return { ...item, purchaseQty: change };
            }
            return item;
        }));
    }

    const updateCartItemStock = (id, change) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                return { ...item, stock: change };
            }
            return item;
        }));
    }

    const updateCartItemColor = (color, index) => {
        const updated = [...cart];
        updated[index].preferedColor = color
        setCart(updated);
    }

    const removeCartItem = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const clearCart = (id) => {
        setCart([]);
    };

    const manageFavorite = (id) => {
        const updatedAllProduct = [...allProducts];
        let productIndex = -1;

        // toggle favorite
        updatedAllProduct.map((product, index) => {
            if (product.id === id) {
                product.isFavorite = !product.isFavorite;
                productIndex = index
            }
        })
        
        setAllProducts(updatedAllProduct);

        // update favorites list
        if (updatedAllProduct[productIndex].isFavorite) {
            setFavorites((prev) => [updatedAllProduct[productIndex], ...prev]);
        } else {
            const newFavorites = favorites.filter(
                (item, index) => item.id !== updatedAllProduct[productIndex].id
            );

            setFavorites(newFavorites);
        }
    };

    const removeFavorite = (id) => {
        setFavorites(favorites.filter(item => item.id !== id));

        // Remove favorite in all products
        allProducts.map((item, index) => {
            if (item.id === id) {
                const updated = allProducts;
                updated[index].isFavorite = false
                setAllProducts(updated);
            }
        });
    };

    const loadBestSellers = (products) => {
        setBestSellers(products);
    }

    const setViewingProductDetails = (productDetail) => {
        setViewingProduct(productDetail);
    }

    const loadShopCategory = (category) => {
        setShopAllCategory(category);
    }

    const loadSuccessfulOrder = (successfulOrder) => {
        setSuccessfulOrders(successfulOrder);
    }

    // set tracking or for viewing after validating orderId & phone
    const loadTrackingOrder = (order) => {
        setTrackingOrder(order);
    }

    const openPaymentSummary = (value) => {
        setOpenPaymentSummary(value);
    }

    const loadPaystackResponse = (response) => {
        setPaystackResponse(response);
    }

    const setProcessOverlay = (value) => {
        setProcessing(value);
    }

    const setAnnouncementData = (value) => {
        setAnnouncement(value);
    }

    return (
        <ShopContext.Provider 
            value={{
                paystackKey,
                wholesaleMinOrderQty,
                
                ishomeDataLoading,
                setHomeDataLoading,
                isShopDataLoading,
                setShopDataLoading,
                isBestSellersDataLoading,
                setBestSellersDataLoading,

                allProducts,
                loadAllProducts,

                categories,
                loadCategories,

                activePage,
                activatePage,
                
                orders,
                addOrder,
                clearOrders,
                isOrderSuccess,
                updateIsOrderSuccess,
                trackingOrder,
                loadTrackingOrder,
                orderReceipt,
                loadOrderReceipt,

                successfulOrders,
                loadSuccessfulOrder,

                cart, 
                addToCart,
                removeCartItem,
                updateCartItemUseMOQ,
                updateCartItemQty,
                updateCartItemQtyInput,
                updateCartItemColor,
                updateCartItemStock,
                clearCart,

                favorites, 
                manageFavorite,
                removeFavorite,

                bestSellers,
                loadBestSellers,

                viewingProduct,
                setViewingProductDetails,

                shopCategory,
                shopColor,
                shopCollection,
                shopPrice,
                loadShopCategory,

                isOpenPaymentSummary,
                openPaymentSummary,

                paystackResponse,
                loadPaystackResponse,

                isProcessing,
                setProcessOverlay,

                announcement,
                setAnnouncementData,
            }}
        >
        {children}
        </ShopContext.Provider>
    );
}

// 3. Create a clean customized Hook wrapper for rapid component access
export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useSart must be wrapped inside a valid <CartProvider /> component node context.");
  }
  return context;
}
