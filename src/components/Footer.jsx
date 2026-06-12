import { FaInstagram, FaFacebookF, FaEnvelope, FaPinterestP, FaTiktok, FaPhone, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router";
import logo from '../assets/logo.png' // Feel free to drop this in where the text logo sits if preferred

export default function Footer() {
    return (
        <footer className="bg-black text-gray-400 font-sans border-t border-zinc-900 pt-16 pb-8">
            <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 md:pb-12 border-b border-zinc-900">
                
                {/* COLUMN 1: BRAND LOGO & STATEMENT */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-white font-bold text-lg md:text-xl tracking-wider font-serif">
                        ALLURING <span className='text-pink-500'>ACCENT</span>
                    </h1>
                    <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed max-w-xs">
                        Crafting timeless, empowered fine jewelry collections. Discover signature designs built with certified brilliance.
                    </p>
                    {/* Modern Circled Social Icons */}
                    <div className="flex gap-3 mt-2">
                        <a className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-pink-500 hover:text-white active:scale-90 transition-all cursor-pointer">
                            <FaInstagram className="text-sm" />
                        </a>
                        <a className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-pink-500 hover:text-white active:scale-90 transition-all cursor-pointer">
                            <FaFacebookF className="text-sm" />
                        </a>
                        <a className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-pink-500 hover:text-white active:scale-90 transition-all cursor-pointer">
                            <FaTiktok className="text-sm" />
                        </a>
                        <a className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-pink-500 hover:text-white active:scale-90 transition-all cursor-pointer">
                            <FaPinterestP className="text-sm" />
                        </a>
                    </div>
                </div>

                {/* COLUMN 2: QUICK NAVIGATION LINKS */}
                {/* <div>
                    <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest mb-4">
                        Quick Links
                    </h3>
                    <ul className="space-y-2.5 text-xs md:text-sm">
                        <li><Link to={'/'} className="hover:text-pink-500 transition-colors">Home</Link></li>
                        <li><Link href="#" className="hover:text-pink-500 transition-colors">Shop Collections</Link></li>
                        <li><Link to={'/contact'} href="#" className="hover:text-pink-500 transition-colors">Contact Us</Link></li>
                    </ul>
                </div> */}

                {/* COLUMN 3: CUSTOMER CARE PORTAL */}
                {/* <div>
                    <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest mb-4">
                        Customer Care
                    </h3>
                    <ul className="space-y-2.5 text-xs md:text-sm">
                        <li><a href="#" className="hover:text-pink-500 transition-colors">FAQs & Support</a></li>
                        <li><a href="#" className="hover:text-pink-500 transition-colors">Shipping & Returns</a></li>
                        <li><a href="#" className="hover:text-pink-500 transition-colors">Track Your Order</a></li>
                    </ul>
                </div> */}

                {/* COLUMN 4: REFINED CONTACT CHANNELS */}
                <div>
                    <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest mb-4">
                        Direct Desk
                    </h3>
                    <ul className="space-y-3 text-xs md:text-sm">
                        <li>
                            <a href="tel:+233556981498" className="flex items-center gap-3 hover:text-pink-500 transition-colors group">
                                <FaPhone className="text-zinc-600 group-hover:text-pink-500 transition-colors" />
                                <span className="font-semibold text-zinc-300">+233 55 698 1498</span>
                            </a>
                        </li>
                        <li>
                            <a href="mailto:alluringaccent@gmail.com" className="flex items-center gap-3 hover:text-pink-500 transition-colors group">
                                <FaEnvelope className="text-zinc-600 group-hover:text-pink-500 transition-colors" />
                                <span className="text-zinc-300">alluringaccent@gmail.com</span>
                            </a>
                        </li>
                        <li>
                            <div className="flex items-center gap-3">
                                <FaMapMarkerAlt className="text-zinc-600" />
                                <span className="text-zinc-400">Accra, Ghana</span>
                            </div>
                        </li>
                    </ul>
                </div>

                
                <div className="relative w-full min-h-[60px]">
                  <div className="flex justify-center items-center absolute md:static right-[20%] bottom-60 ">
                    <a className="rounded-full shadow-sm animate-pulse hover:animate-none cursor-pointer"
                         href={`https://wa.me/+233556981498`}
                         target="_blank"
                         rel="noreferrer"
                    >
                      <FaWhatsapp className="text-5xl md:text-5xl text-[#25D366]" />
                    </a>
                  </div>
                </div>
            </div>

            {/* LOWER SUB-FOOTER RE-COPYRIGHT REGION */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 flex md:flex-row justify-center items-center gap-4">
                <p className="text-center md:text-left text-[11px] md:text-xs text-zinc-600 font-medium">
                    &copy; 2026 Alluring Accent Shop. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
