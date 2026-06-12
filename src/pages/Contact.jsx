import '../App.css'
import NavBar from '../components/NavBar'
import { Settings } from 'lucide-react'
import {
    FaInstagram,
    FaFacebookF,
    FaWhatsapp,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaPinterestP,
    FaTiktok,
} from "react-icons/fa";
import Footer from '../components/Footer'



 function Contact() {
    return (


        <div>
            <NavBar activePage={'contact'} />

            <div className="contact-page bg-[linear-gradient(90deg,#f7e9ea_0%,#e9d4d2_40%,#d8b1ad_75%,#c7938f_100%)]">
                {/* LEFT SIDE */}
                <div className="contact-info">

                    <h1>Let’s Talk</h1>

                    <p>
                        Have questions about our jewelry collections, custom orders,
                        or deliveries? We would love to hear from you.
                    </p>

                    <div className="info-box">
                        <FaMapMarkerAlt className="info-icon" />
                        <span>Accra, Ghana</span>
                    </div>

                    <div className="info-box">
                        <FaPhoneAlt className="info-icon" />
                        <span>+233 55 698 1498</span>
                    </div>

                    <div className="info-box">
                        <FaEnvelope className="info-icon" />
                        <span>alluringaccent@gmail.com</span>
                    </div>

                    {/* SOCIALS */}
                    <div className="socials">
                        <a href="#">
                            <FaInstagram />
                        </a>

                        <a href="#">
                            <FaFacebookF />
                        </a>

                        <a href="#">
                            <FaWhatsapp />
                        </a>
                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div className="contact-form-container w-[300px] md:w-[700px]">

                    <form className="contact-form">

                        <h2>Send a Message</h2>

                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter your name" />
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="Enter your email" />
                        </div>

                        <div className="input-group">
                            <label>Subject</label>
                            <input type="text" placeholder="Enter subject" />
                        </div>

                        <div className="input-group">
                            <label>Message</label>
                            <textarea
                                rows="6"
                                placeholder="Write your message..."
                            ></textarea>
                        </div>

                        <button type="submit">Send Message</button>

                    </form>

                </div>

            </div>
            <Footer />

        </div>


    )
}

export default Contact 