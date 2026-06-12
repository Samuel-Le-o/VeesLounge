import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useShop } from "../../utilities/ShopContext";

import lady from '../assets/hero-lady.png'
import heroLady from '../assets/hero-lady-2.png'
import lady2 from '../assets/hero-image-2.png'
import lady3 from '../assets/hero-image-3.png'
import lady4 from '../assets/hero-image-4.png'
import collection1 from '../assets/hero-collection.png'
import collection2 from '../assets/collection-2.png'
import newCollection from '../assets/new-collection.png'
import newCollection1 from '../assets/new-collection-1.png'
import collection3 from '../assets/collection-1.png'
import collectiongold from '../assets/collection-gold.png'
import necklace from '../assets/hero-necklace.png'
import necklacegold from '../assets/necklace-gold.png'
import ring from '../assets/ring-2.png'
import trippleRing from '../assets/tripple-ring.png'

const slides = [
  {
    id: 1,
    title: "Elegance in Every Detail",
    subtitle: "PURE LUXURY JEWELRY",
    // subtitle: "TIMELESS BEAUTY.",
    description: "Discover stunning jewellery pieces designed to make every moment special",
    image: necklace,
  },
  {
    id: 2,
    // title: "Shine With Confidence",
    title: "Elegance in Every Detail",
    subtitle: "CLASSIC FINE JEWELRY",
    // subtitle: "TIMELESS BEAUTY.",
    // description: "Designed to elevate your everyday style.",
    description: "Discover stunning jewellery pieces designed to make every moment special",
    // image: collection3,
    image: heroLady,
    // image: lady,
  },
  {
    id: 3,
    // title: "Luxury That Speaks",
    title: "Elegance in Every Detail",
    subtitle: "JEWELRY FOR LEADERS",
    // subtitle: "TIMELESS BEAUTY.",
    // description: "Crafted with precision and passion for modern elegance.",
    description: "Discover stunning jewellery pieces designed to make every moment special",
    image: trippleRing,
    // image: lady2,
  },
  {
    id: 4,
    // title: "Shine With Confidence",
    title: "Elegance in Every Detail",
    subtitle: "EXCLUSIVE PERFECT JEWELRY",
    // subtitle: "TIMELESS BEAUTY.",
    // description: "Designed to elevate your everyday style.",
    description: "Discover stunning jewellery pieces designed to make every moment special",
    image: newCollection1,
  },
];

export default function Hero() {
  const { loadShopCategory } = useShop();
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className=" w-full pt-[53px] bg-[linear-gradient(90deg,#f7e9ea_0%,#e9d4d2_40%,#d8b1ad_75%,#c7938f_100%)]">
      <div className="relative h-[90vh] md:h-[70vh] overflow-hidden">

        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="relative w-full h-full md:flex">
              {/* TEXT */}
              <div className="
                absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20
                md:static md:items-start md:text-left md:justify-center w-full md:w-1/2 md:pl-16
              ">
                <h1 className="h-18 text-xl md:text-3xl tracking-widest text-pink-600 font-bold mb-">
                  {slide.subtitle}
                </h1>

                {/* <h1 className="text-3xl md:text-5xl font-serif text-black md:text-black leading-tight mb-4">
                  {slide.title}
                </h1> */}

                <h2 className="text-base md:text-lg capitalize mb-15 md:mb-8 w-[70%] md:w-[90%] text-[rgba(0,0,0,0.6)] font-medium font-mono">Discover stunning jewellery pieces designed to make every moment special</h2>

                <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                  {/* <button className="md:flex text-[rgba(0,0,0,0.6)] border border-[rgba(0,0,0,0.2)] px-6 py-3 rounded-md hover:bg-gray-100 transition active:scale-95 transition-all">
                    EXPLORE COLLECTION
                  </button> */}

                  <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 md:px-12 py-3 rounded-md font-bold transition active:scale-95 transition-all"
                  onClick={() => {
                    loadShopCategory('All Jewellery')
                    navigate('/shop');
                  }}
                  >
                    SHOP NOW
                  </button>
                </div>
              </div>
              {/* IMAGE (Background on mobile) */}
              <div className="w-full md:w-1/2 h-full">
                <img
                  src={slide.image}
                  alt="Jewellery"
                  className="absolute inset-0 w-full h-full  md:static md:h-full"
                />
              </div>

              {/* OVERLAY (for readability on mobile) */}
              {/* <div className="absolute inset-0 bg-black/20 md:hidden"></div> */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}