import { useState } from 'react';
import { X, CheckCircle2, Copy, Check, ShieldCheck, MapPin, Search } from 'lucide-react';
import { toast } from 'react-hot-toast'; 

import { useShop } from '../../utilities/ShopContext';

export default function OrderSuccessModal() {
  const { isOrderSuccess, updateIsOrderSuccess, orderReceipt } = useShop();
  // console.log('orderReceipt...:', orderReceipt)

  const [isOpen, setIsOpen] = useState(true); 
  const [copied, setCopied] = useState(false);

  // Sample static payload mirroring live checkout transactional receipts data
  // const orderReceipt = {
  //   orderId: "LUV-8392-GHX5",
  //   customerName: "Ama Serwaa",
  //   phoneNumber: "+233 24 000 0000",
  //   city: "East Legon",
  //   region: "Greater Accra",
  //   deliveryTimeline: "1 - 2 Business Days",
  //   totalPaid: "GH₵ 510.00"
  // };

  // Helper action: Copy Order Identifier straight to user hardware clipboard
  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderReceipt.orderId);
      setCopied(true);
      
      // Optional react-hot-toast notification trigger
      if (typeof toast !== 'undefined' && toast.success) {
        toast.success("Order ID copied to clipboard!");
      }

      // Revert copied check icon state back to icon defaults after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text data to host device: ", err);
    }
  };

  return (
    <div>
      {isOrderSuccess && (
        <div className="flex flex-col items-center justify-center p-4 min-h-[300px]">
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Mask Dimmer Layout */}
          <div 
            onClick={() => updateIsOrderSuccess(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fadeIn cursor-pointer"
          />

          {/* Modal chassis architecture frame */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 md:p-7 max-h-[92vh] overflow-y-auto animate-scaleIn z-10 border border-zinc-100 font-sans no-scrollbar">
            
            {/* Modal Exit Action button hook */}
            <button 
              onClick={() => updateIsOrderSuccess(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* UPPER CORE: ANIMATED SUCCESS GRAPHIC HERO STATUS */}
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <div className="relative flex items-center justify-center mb-3">
                <span className="absolute inline-flex h-12 w-12 rounded-full bg-green-400 opacity-20 animate-ping" />
                <CheckCircle2 className="w-14 h-14 text-green-500 fill-green-50 relative z-10" />
              </div>
              <h2 className="font-serif text-lg md:text-xl font-black text-zinc-900 tracking-wide">Order Placed Safely!</h2>
              <p className="text-xs text-zinc-400 font-medium max-w-xs mt-1">
                Your payment authorization processed securely. Thank you for shopping with Alluring Accent.
              </p>
            </div>

            {/* IMPORTANT COMPLIANCE ALERT: DATA RETENTION WARNING BOX */}
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-center text-amber-800 space-y-1 my-2">
              <p className="text-[11px] font-black uppercase tracking-wider">⚠️ Action Required: Save Receipt</p>
              <p className="text-[11px] font-medium leading-relaxed text-amber-700">
                Please **screenshot this screen** or **copy your Order ID** immediately. You will need these explicit details to check delivery progress logs.
              </p>
            </div>

            {/* SEGMENT A: CRITICAL ORDER TRACKING CODES & PARAMETERS */}
            <div className="space-y-3.5 mt-5">
              
              {/* Unique Copyable ID Component module item block */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Unique Order Ref ID</span>
                  <span className="text-xs font-black text-zinc-800 tracking-wide select-all font-mono">{orderReceipt.orderId}</span>
                </div>
                <button 
                  onClick={handleCopyOrderId}
                  className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-pink-600 hover:border-pink-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500 animate-scaleIn" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* TRANSACTIONAL PARAMETERS READOUT CONTAINER SECTION GRID */}
              <div className="border border-zinc-100 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-zinc-500 font-medium">
                  <span>Recipient Name</span>
                  <span className="font-bold text-zinc-800">{orderReceipt.recipient}</span>
                </div>
                
                <div className="flex justify-between items-center text-zinc-500 font-medium">
                  <span>Phone Number</span>
                  <span className="font-bold text-zinc-800 font-sans">{orderReceipt.phone}</span>
                </div>
                
                <div className="flex justify-between items-start text-zinc-500 font-medium">
                  <span>Destination</span>
                  <div className="text-right flex flex-col items-end gap-0.5">
                    <span className="font-bold text-zinc-800 flex items-center gap-0.5"><MapPin className="w-3 h-3 text-pink-500" /> {orderReceipt.city}</span>
                    <span className="text-[10px] text-zinc-400 font-semibold">{orderReceipt.region} Region</span>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-2.5 mt-1 flex justify-between items-center font-bold">
                  <span className="text-zinc-500">Amount Transacted</span>
                  <span className="text-sm font-black text-pink-600 font-sans">GH₵ {orderReceipt.totalCost}</span>
                </div>
              </div>

              {/* SEGMENT B: LOGISTICAL COURIER DELIVERY TRACKING SCHEDULING NOTE */}
              <div className="bg-zinc-50/60 border border-zinc-100 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-2 bg-white border border-zinc-100 rounded-lg text-pink-600 shadow-2xs mt-0.5">
                  <Search className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wide text-zinc-800">Fulfillment Tracking</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Expected Arrival: <span className="font-bold text-zinc-700">{orderReceipt.deliveryTimeline}</span>. 
                    You can use your reference code inside our **Track Order** panel to monitor courier movement updates.
                  </p>
                </div>
              </div>

            </div>

            {/* LOWER PORTAL DISMISS BUTTON ACTIONS FOOTER CONTAINER */}
            <div className="pt-4 border-t border-zinc-100 mt-5 space-y-2">
              <button 
                onClick={() => updateIsOrderSuccess(false)}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-3.5 rounded-xl uppercase tracking-widest active:scale-[0.99] transition-all shadow-md text-center cursor-pointer block"
              >
                Acknowledge & Continue
              </button>
              
              <div className="flex items-center justify-center gap-1 text-[9px] text-zinc-400 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>Verified  &bull; Alluring Accent</span>
              </div>
            </div>

          </div>
        </div>
    </div>
      )}
    </div>
  );
}
