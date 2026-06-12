import '../SignupPage.css';
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faLock, 
  faEyeSlash, 
  faEye, 
  faEnvelope,
  faShoppingBag // Added icon for storefront navigation consistency
} from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-hot-toast';
import axios from 'axios'; 
import { useNavigate } from "react-router";

function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  // Unified form state management
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmedPassword: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirmedPassword } = formData;

    // Basic frontend verification fields
    if (!username || !password || !confirmedPassword) {
      toast.error("Please fill in all layout credentials.");
      return;
    }

    if (password !== confirmedPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setIsSubmitting(true);

      // Send the payload to your live Render backend
      const response = await axios.post(
        'https://alluring-accent-backend.onrender.com/api/admin/signup', 
        {
          username: username.trim(),
          password: password,
          confirmedPassword: confirmedPassword
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Signup response:", response);

      // Handle successful creation based on standard HTTP success statuses
      if (response.status === 200 || response.status === 201) {
        toast.success(`Admin account for ${username} created successfully!`);
        
        // Clear form entries on success
        setFormData({
          username: "",
          password: "",
          confirmedPassword: ""
        });
      }

      setTimeout(() => {
        navigate("/login");
      }, 2000); // Redirect after a short delay to allow users to see the success message

    } catch (error) {
      console.error("Signup network error:", error);
      
      const backendMessage = error.response?.data?.message || "Could not connect to the authentication host.";
      toast.error(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-sp bg-[linear-gradient(90deg,#f7e9ea_0%,#e9d4d2_40%,#d8b1ad_75%,#c7938f_100%)]">

      <div className="background-glow glow-1"></div>
      <div className="background-glow glow-2"></div>

      <div className="singup-cont">
        <div className="signup-card">
          <h1 className="signup-title">Admin Sign Up</h1>
          <p className='p-text'>Please fill in the details below to create an admin account.</p>

          <form onSubmit={handleSignupSubmit} noValidate>
            {/* USERNAME */}
            <div className="sup-input-group">
              <label className='signup-label' htmlFor="username">USERNAME</label>
              <div className="sup-input-box">
                <FontAwesomeIcon icon={faUser} className="sup-left-icon" />
                <input 
                  type="text" 
                  name="username"
                  id="username"
                  placeholder="Enter Your Username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isSubmitting} 
                  required
                />
              </div>
            </div> 

            {/* PASSWORD */}
            <div className="sup-input-group">
              <label className='signup-label' htmlFor="password">PASSWORD</label>
              <div className="sup-input-box">
                <FontAwesomeIcon icon={faLock} className="sup-left-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  name="password"
                  placeholder='Enter Your Password' 
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isSubmitting} 
                  required
                />
                <FontAwesomeIcon 
                  icon={showPassword ? faEye : faEyeSlash} 
                  className="sup-right-icon" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)} 
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="sup-input-group">
              <label className='signup-label' htmlFor="confirmedPassword">CONFIRM PASSWORD</label>
              <div className="sup-input-box">
                <FontAwesomeIcon icon={faLock} className="sup-left-icon" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmedPassword"
                  name="confirmedPassword"
                  placeholder='Confirm Your Password' 
                  value={formData.confirmedPassword} // Fixed typo value assignment point here
                  onChange={handleInputChange}
                  disabled={isSubmitting} 
                  required
                />
                <FontAwesomeIcon 
                  icon={showConfirmPassword ? faEye : faEyeSlash} 
                  className="sup-right-icon"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                />
              </div>
            </div>

            {/* SIGN UP BUTTON */}
            <button 
              type="submit" 
              className="signup-btn"
              disabled={isSubmitting} 
              style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>

            {/* DECORATIVE SEPARATOR LINE */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px', color: 'rgba(0,0,0,0.15)' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'currentColor' }}></div>
              <span style={{ padding: '0 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'currentColor' }}></div>
            </div>


            
          <div className="login-redirect-text" style={{ marginTop: '-40px', fontSize: '13px', textAlign: 'center' }}>
            Already have an account? <a href="/login" className="login-link">Login</a>
          </div>

          

            {/* CUSTOMER FACING STOREFRONT REDIRECT BUTTON */}
            <button
              type="button"
              className="storefront-redirect-btn"
              onClick={() => navigate("/")}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px dashed #be185d',
                background: 'transparent',
                color: '#be185d',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FontAwesomeIcon icon={faShoppingBag} />
              Go to Customer Storefront
            </button>
          </form>

          </div>
        </div>
      </div>
  );
}

export default SignupPage;