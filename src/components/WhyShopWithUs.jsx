import { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Truck, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';

export default function WhyShopWithUs() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Controls whether the current view is fading in or fading out
  const [fadeState, setFadeState] = useState('fade-in');

  const reasons = [
    {
      icon: <Sparkles className="h-8 w-8 text-pink-600" />,
      title: "Exquisite Craftsmanship",
      description: "Every single design is meticulously shaped by master artisans using premium precious metals and ethically sourced stones to deliver flawless beauty that lasts generations."
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-pink-600" />,
      title: "100% Certified Quality",
      description: "Shop with absolute peace of mind. All our gold, diamonds, and precious gemstones undergo strict validation and come accompanied by authentic laboratory certifications."
    },
    {
      icon: <Truck className="h-8 w-8 text-pink-600" />,
      title: "Insured Secure Shipping",
      description: "We securely pack and ship your signature collections with real-time tracking checkpoints and comprehensive premium transit insurance right to your doorstep."
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-pink-600" />,
      title: "Lifetime Brand Guarantee",
      description: "Our empowered relationship doesn’t end at checkout. Enjoy exclusive access to professional jewelry cleaning, inspection servicing, and dedicated styling support."
    }
  ];

  // Helper function to handle the safe transitional cross-fade
  const triggerSlideChange = (nextIndex) => {
    setFadeState('fade-out');
    
    // Wait for the fade-out animation to complete (300ms) before swapping data
    setTimeout(() => {
      setCurrentSlide(nextIndex);
      setFadeState('fade-in');
    }, 300);
  };

  const nextSlide = () => {
    const nextIndex = currentSlide === reasons.length - 1 ? 0 : currentSlide + 1;
    triggerSlideChange(nextIndex);
  };

  const prevSlide = () => {
    const nextIndex = currentSlide === 0 ? reasons.length - 1 : currentSlide - 1;
    triggerSlideChange(nextIndex);
  };

  // Automated sliding timeline interval
  useEffect(() => {
    if (isPaused) return;

    const autoPlayTimer = setInterval(() => {
      nextSlide();
    }, 5000); // Bumped to 5s to allow smooth animation pacing

    return () => clearInterval(autoPlayTimer);
  }, [isPaused, currentSlide]); 

  return (
    <section className="mb-20">
        <div className="">
            <div className="max-w-xl mx-auto text-center ">
                
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide mb- text-gray-900">
                Why Shop <span className="text-pink-600">With Us</span>
                </h2>

                {/* Carousel Card Container */}
                <div 
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="relative pt-5 pb-5 flex flex-col justify-center items-center overflow-hidden"
                >
                
                {/* Dynamic transition classes applied directly to the content wrapper */}
                <div 
                    className={`flex flex-col items-center transition-all duration-300 transform ${
                    fadeState === 'fade-in' 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-2'
                    }`}
                >
                    <div className="p-4 bg-pink-50 rounded-2xl mb-5 shadow-sm">
                    {reasons[currentSlide].icon}
                    </div>
                    
                    <h3 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight mb-3">
                    {reasons[currentSlide].title}
                    </h3>
                    
                    <p className="text-[12px] md:text-sm text-gray-500 leading-relaxed px-3 max-w-lg">
                    {reasons[currentSlide].description}
                    </p>
                </div>

                {/* Navigation Controls */}
                <div className="hidden absolute inset-x-4 md:inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button 
                    onClick={prevSlide}
                    className="p-2 rounded-full border border-gray-100 bg-white hover:bg-gray-50 active:scale-90 pointer-events-auto transition-all shadow-sm cursor-pointer"
                    >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                    onClick={nextSlide}
                    className="p-2 rounded-full border border-gray-100 bg-white hover:bg-gray-50 active:scale-90 pointer-events-auto transition-all shadow-sm cursor-pointer"
                    >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                </div>

                {/* Active Slide Indicators */}
                <div className="flex justify-center gap-3">
                {reasons.map((_, idx) => (
                    <button
                    key={idx}
                    onClick={() => currentSlide !== idx && triggerSlideChange(idx)}
                    className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                        currentSlide === idx ? 'w-6 bg-pink-600' : 'w-1.5 bg-gray-200'
                    }`}
                    />
                ))}
                </div>

            </div>
      </div>
    </section>
  );
}
