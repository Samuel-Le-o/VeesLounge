import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Settings, MoveRight, Heart, ChevronLeft, ChevronRight, HeartIcon, Phone, Mail, MessageSquare,  } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import axios from 'axios'

import { useShop } from '../../utilities/ShopContext'
import { apiFetcher } from '../api/client'

import NavBar from '../components/NavBar'
import Hero from '../components/Hero'
import BestSellers from '../components/BestSellers'
import WhyShopWithUs from '../components/WhyShopWithUs'
import TrackYourOrder from '../components/TrackYourOrder'
import Footer from '../components/Footer'
import OrderProgress from '../components/OrderProgress'
import OrderNotFound from '../components/OrderNotFound'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { allProductsDummy, successfullOrdersDummy } from '../../utilities/dummyData'

import ring from '../assets/ring-2.png'
import earring from '../assets/earring.png'
import bracelet from '../assets/bracelet.png'
import necklacegold from '../assets/necklace-gold.png'
import necklacesilver from '../assets/silver-necklace.png'
import flowernecklace from '../assets/necklace-flower.png'
import collection1 from '../assets/hero-collection.png'
import collection2 from '../assets/collection-2.png'
import OrderSuccessModal from '../components/OrderSuccessModal'
import PurchaseOrderSummary from '../components/PurchaseOrderSummary'
import ProcessOverlay from '../components/ProcessOverlay'

const categories = [
    {title: 'Rings', image: ring},
    {title: 'Necklaces', image: flowernecklace},
    {title: 'Earrings', image: earring},
    {title: 'Bracelets', image: bracelet},
    // {title: 'bracelets', image: necklace},
];

export default function HomePage() {
    // const { data, isLoading, error, mutate } = useSWR('/product/all', apiFetcher);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const { allProducts, loadBestSellers, loadAllMainBestSellers, loadAllProducts, categories, loadCategories, loadShopCategory, loadSuccessfulOrder, ishomeDataLoading, setHomeDataLoading, setShopDataLoading, setBestSellersDataLoading, isOpenPaymentSummary, openPaymentSummary, setAnnouncementData } = useShop();

    const [favorites, setFavorites] = useState([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [bestSellersCopy, setBestSellersCopy] = useState();
    const [bestSellerFavoriteIndex, setBestSellerFavoriteIndex] = useState();

    const [cartCount, setCartCount] = useState(0);
    const [cart, setCart] = useState([]);

    const [] = useState(false);

    const [dataloading, setDataLoading] = useState(true);
    const [isDataError, setDataError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
          try {
            setHomeDataLoading(true);

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
                product.purchaseQty = 1 
                product.orderQty = 1 
                product.isBuyWholesale = false
                product.purchasingPrice = product.sellingPrice
            })

            loadAllProducts(availableProducts);
            const bestSellers = availableProducts.filter(product => product.tag === 'Best Seller');
            loadBestSellers(bestSellers);
            // loadSuccessfulOrder(successfullOrdersDummy);
            
          } catch (error) {
            setDataError(true);

          } finally {
            setShopDataLoading(false);
            setBestSellersDataLoading(false)
            setHomeDataLoading(false)
          }
        };

        const fetchCategories = async () => {
            try {
                
    
               
            } catch (error) {
                
            }
        }

        if (allProducts.length <= 0) {
            fetchData();
            fetchCategories();
        }
    
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
      }, [pathname]); 

    useEffect(() => {
        
    }, [allProducts])

    const scrollContainerRef = useRef(null);

    // 2. Navigation handler functions
    const scroll = (direction) => {
        if (scrollContainerRef.current) {
        const scrollAmount = 300; // Adjust this value to scroll more or less per click
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
        }
    };


    return (
        <>
            {
                ishomeDataLoading ? 
                (
                    <LoadingState/>
                ) : 
                isDataError ? (
                    <div>
                        <ErrorState page={'home'}/>
                    </div>
                ) :
                (
                    <div>
                        
                        <section className="mb-5 md:mb-10">
                            <NavBar 
                            activePage={'home'} 
                            favoriteCount={favoriteCount}
                            cartCount={cartCount}
                            favorites={favorites}
                            setFavorites={setFavorites}
                            cart={cart}
                            setCart={setCart}
                            bestSellers={bestSellersCopy}
                            setBestSellers={setBestSellersCopy}
                            />
                            <Hero/>
                        </section>
                        {/* <PurchaseOrderSummary
                            isOpen={isOpenPaymentSummary}
                            setIsOpen={openPaymentSummary}
                        /> */}
                        {/* categories */}
                        <section className='px-4 md:px-10 mb-5 md:mb-10'>
                            <div className="flex justify-between items-center mb-4 md:mb-4">
                                <div className="">
                                    <h2 className='text-medium md:text-2xl font-bold'>Shop <span className='text-pink-600'>Category</span></h2>
                                    {/* <h3 className="hidden md:flex text-sm">Explore our most loved pieces</h3> */}
                                </div>
                                <button className="text-[12px] text-pink-500 md:text-black md:text-sm font-bold capitalize cursor-pointer hover:text-pink-500 active:opacity-25"
                                onClick={() => {
                                    loadShopCategory('All Jewellery');
                                    navigate('/shop');
                                }}
                                >view all</button>
                            </div>
                            <div className="flex flex-wrap justify-between">
                                {categories.map((category, index) => (
                                    <div key={index}  className="w-[24%] mb-5">
                                        <div 
                                            className="group relative h-[70px] md:h-[200px] w-full rounded-full md:rounded-xl bg-[linear-gradient(90deg,#f7e9ea_0%,#e9d4d2_40%,#d8b1ad_75%,#c7938f_100%)] cursor-pointer overflow-hidden active:opacity-25"

                                            onClick={() => {
                                                loadShopCategory(category.name)
                                                navigate('/shop')
                                            }}
                                        >
                                            {/* Dark overlay that activates when parent (group) is hovered */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                                        
                                            <img src={category.image} alt="img " className='w-full h-full object-cover' />
                                            
                                            <div className="hidden md:flex flex-col relative left-[10px] bottom-[50px] z-20">
                                                <h1 className='text-[17px] capitalize font-bold'>{category.name}</h1>
                                                <div className='hidden md:flex items-center gap-2 cursor-pointer'>
                                                    <p className="capitalize text-[13px] group-hover:text-pink-600 group-hover:font-bold">shop now</p>
                                                    <MoveRight className='h-4 group-hover:text-pink-500'/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full flex justify-center md:hidden mt-1">
                                            <h1 className='text-xs capitalize font-bold'>{category.name}</h1>
                                        </div>
                                    </div>
                                
                                ))}
                            </div>
                        </section>
                        <BestSellers/>
                        <TrackYourOrder/>
                        <WhyShopWithUs/>
                        <OrderSuccessModal/>
                        <Footer/>
                        <ProcessOverlay/>
                    </div>
                )
            }
        </>
    )
}