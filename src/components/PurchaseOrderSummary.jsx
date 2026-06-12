import { useEffect, useState } from 'react';
import { X, Truck, ShieldCheck, MapPin, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useLocation } from 'react-router';

import Alert from './Alert';

import { useShop } from '../../utilities/ShopContext';
import toast from 'react-hot-toast';

export default function PurchaseOrderSummary({ isOpen, setIsOpen }) {
  const { orders, addOrder, loadOrderReceipt, cart, clearCart, removeCartItem, updateIsOrderSuccess, paystackResponse, loadPaystackResponse, setProcessOverlay, paystackKey } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  // console.log(orders)

  const [isAlert, setAlert] = useState(false);

  const [isProcessReceipt, setProcessReceipt] = useState(false);
  const [isSendEmail, setSendEmail] = useState(false);
  const [] = useState(false);
  const [] = useState(false);

  // 1. Initialize Controlled Form Input State Fields
  const [formData, setFormData] = useState({
    recipient: '',
    phone: '',
    email: '',
    region: 'Accra',
    city: '',
    address: ''
  });

  // Sample purchase cost payload attributes matching your item structure
  
  const orderDetails = {
    title: "Rose Gold Infinity Ring",
    purchasingPrice: 450.00,
    purchaseQty: 1,
    shippingFee: formData.region === 'Accra' ? 0.00 : 15.00, // Dynamic location pricing calculations
    currency: "GH₵"
  };

  const totalCost = (orderDetails.purchasingPrice * orderDetails.purchaseQty) + orderDetails.shippingFee;

  const itemsTotalCost = orders.reduce((totalCost, order) => {return totalCost + order.totalPrice}, 0);
  const serviceFee = itemsTotalCost * 0.02;
  const grandTotal = itemsTotalCost + orderDetails.shippingFee + serviceFee;

  // Form Field Change Listener Action
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmitOrder = () => {
  //   const handler = window.PaystackPop.setup({
  //     key: paystackKey,
  //     email: "info.alluringaccent@gmail.com",
  //     amount: 5000 * 100,
  //     currency: "GHS",
  
  //     callback: function (response) {
  //       // 👉 send reference to backend
  //       // verifyPayment(response.reference);
  //     },
  
  //     onClose: function () {
  //       toast.error('Payment cancelled', {duration: 2000})
  //     },
  //   });
  
  //   handler.openIframe();
  // };

  const handleRemoveOrdersFromCart = () => {
    if (orders.length > 1) {
      return clearCart();
    }

    orders.map((item) => {
      removeCartItem(item.id);
    })
  }

  const payWithPaystack = async (e) => {
    try {
      e.preventDefault()
      if (formData.email.trim() === '') {
        formData.email = 'null';
      }
  
      formData.isOrderPlaced = true
      formData.deliveryCost = orderDetails.shippingFee
      formData.subtotal = itemsTotalCost
      formData.totalCost = grandTotal
      formData.products = orders
  
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: "info.alluringaccent@gmail.com",
        amount: grandTotal * 100,
        currency: "GHS",
    
        callback: function (response) {
          // console.log("Success:", response.reference);
          // processReceipt();
          setProcessReceipt(true);
        },
    
        onClose: function () {
          console.log("Payment closed");
        },
      });
    
      handler.openIframe();
    } catch (error) {
      
    }
  };

  const sendEmail_Sms = async (orderInfo) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/order/email`,
        {...orderInfo},
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/order/sms`,
        {...orderInfo},
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

    } catch (error) {
      console.log(error)
    }
  }

  const processReceipt = async () => {
    try {
      setProcessOverlay(true);
      setIsOpen(false);
      if (location.key !== 'default') {
        navigate(-1);
      }
  
      if (formData.email.trim() === '') {
        formData.email = 'null';
      }
  
      formData.isOrderPlaced = true
      formData.deliveryCost = orderDetails.shippingFee
      formData.subtotal = itemsTotalCost
      formData.totalCost = grandTotal
      formData.products = orders
  
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/order/create`,
          {
            recipient: formData.recipient,
            phone: formData.phone,
            email: formData.email,
            region: formData.region,
            city: formData.city,
            address: formData.address,
            products: orders,
            isOrderPlaced: true,
            deliveryCost: orderDetails.shippingFee,
            subtotal: itemsTotalCost,
            totalCost: grandTotal,
          },
        // formData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
  
      const receipt = res.data.orderInfo
  
      if (res.status === 201) {
        loadOrderReceipt(receipt)
        setProcessOverlay(false)
        handleRemoveOrdersFromCart();
        addOrder([])
        updateIsOrderSuccess(true); // show upon transaction onsuccess
  
        sendEmail_Sms(receipt);
      }
      else {
        setProcessOverlay(false);
        toast.error('Something went wrong', {duration: 2000});
      }
    } catch (error) {
      setProcessOverlay(false);
      toast.error('Something went wrong', {duration: 2000});
    }
  }

  useEffect(() => {
    if (isProcessReceipt) {
      processReceipt();
      setProcessReceipt(false);
    }
  }, [isProcessReceipt])

  return (
    <div className="flex flex-col items-center justify-center p-">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          
          {/* Backdrop Blur Dimmer Mask */}
          <div 
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fadeIn cursor-pointer"
          />

          {/* Modal layout component structure */}
          <form 
            onSubmit={payWithPaystack}
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 md:p-7 max-h-[90vh] overflow-y-auto animate-scaleIn z-10 border border-zinc-100 font-sans no-scrollbar"
          >
            {/* Modal Exit Action button */}
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER BRANDING BANNER ROW */}
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
              <div className="p-2 bg-pink-50 rounded-xl text-pink-600">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-zinc-900 tracking-wide">Purchase Order</h2>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Confirm delivery details & items summary</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              
              {/* LEFT SIDE BLOCK: CUSTOMER RECIPIENT INFORMATION FORM */}
              <div className="space-y-3.5">
                <h3 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-pink-500" /> Delivery Address
                </h3>
                
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Recipient Full Name</label>
                  <input 
                    type="text"
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleInputChange}
                    placeholder="Ama Serwaa"
                    required
                    className="w-full mt-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 bg-[#fafafa]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Phone Number</label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="024 000 0000"
                    required
                    className="w-full mt-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 bg-[#fafafa]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@gmail.com"
                    className="w-full mt-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 bg-[#fafafa]"
                  />
                </div>

                {/* Ghanaian Regions Select Menu dropdown wrapper */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Region</label>
                  <select 
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="w-full mt-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 bg-[#fafafa] cursor-pointer"
                  >
                    <option value="Ahafo">Ahafo Region</option>
                    <option value="Ashanti">Ashanti Region</option>
                    <option value="Bono East">Bono East Region</option>
                    <option value="Bono">Bono Region</option>
                    <option value="Central">Central Region</option>
                    <option value="Eastern">Eastern Region</option>
                    <option value="Accra">Greater Accra Region</option>
                    <option value="North East">North East Region</option>
                    <option value="Nothern">Nothern Region</option>
                    <option value="Oti">Oti Region</option>
                    <option value="Savannah">Savannah Region</option>
                    <option value="Upper East">Upper East Region</option>
                    <option value="Upper West">Upper West Region</option>
                    <option value="Volta">Volta Region</option>
                    <option value="Western North">Western North Region</option>
                    <option value="Western">Western Region</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">City / Town</label>
                    <input 
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. East Legon"
                      required
                      className="w-full mt-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 bg-[#fafafa]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Address</label>
                    <input 
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. GA-123-4567"
                      required
                      className="w-full mt-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 bg-[#fafafa]"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE BLOCK: ORDER SUMMARY ITEM COST METRICS */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-3 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-pink-500" /> Order Summary
                  </h3>
                  
                  {/* Small inline preview panel containing line product metrics summary card */}
                  {
                    orders.map((order, index) => (
                      <div key={index} className="pb-3 mb-3 border-b border-zinc-200/60 flex flex-col gap-0.5">
                        <span className="text-xs font-bold font-sans capitalize text-zinc-800 truncate">{order.name}</span>
                        <div className="flex justify-between mt-[2px]">
                          <span className="text-[11px] font-semibold font-sans text-zinc-400">{order.quantity} x {orderDetails.currency}{order.price.toLocaleString()}</span>
                          <span className="text-[11px] font-semibold font-sans text-zinc-400">{orderDetails.currency}{order.totalPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-[11px] font-semibold font-sans text-zinc-400 capitalize">Color: {order.color}</span>
                      </div>
                    ))
                  }

                  <div className="space-y-2 text-[11px] font-medium text-zinc-500">
                    <div className="flex justify-between">
                      <span>Item Subtotal</span>
                      <span className="font-bold text-zinc-700">{orderDetails.currency} {(itemsTotalCost).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="font-bold text-zinc-700">{orderDetails.currency} {orderDetails.shippingFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service</span>
                      <span className="font-bold text-zinc-700">{orderDetails.currency} {serviceFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                {/* CUMULATIVE AGGREGATE TOTAL CALCULATION BLOCK CARD BAR */}
                <div className="pt-4 border-t border-zinc-200/60 mt-4">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total Cost</span>
                    <span className="text-base font-black text-pink-600 font-sans">
                    GH₵ {grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>

                  {/* Submission dispatch action button link hook */}
                  <button 
                    type="submit"
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold py-3 rounded-xl uppercase tracking-widest transition-colors shadow-sm active:scale-[0.98]"
                    // onClick={() => {console.log('.................')}}
                  >
                    Place Purchase Order
                  </button>
                </div>

              </div>

            </div>
          </form>
        </div>
      )}
    </div>
  );
}
