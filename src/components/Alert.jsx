import React from 'react';

export default function Alert({ isOpen, setIsOpen, title, message, onConfirm, onCancel }) {
  // Return nothing if the dialog box status is set to closed
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-md border-2 border-[#ff007f] bg-[#0c0c0c] p-8 text-center text-white rounded-xl shadow-[0_0_20px_rgba(255,0,127,0.3)] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Neon Accent Border Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff007f] to-[#ff66b2] rounded-t-[10px]" />
        
        <h3 className="mt-2 mb-3 text-2xl font-bold tracking-wide uppercase text-[#ff007f]">
          {title}
        </h3>
        
        <p className="mb-6 text-sm leading-relaxed text-gray-300">
          {message}
        </p>
        
        <div className="flex justify-end px-4">
          <button 
            className="flex-1 rounded-lg bg-[#ff007f] py-3 px-5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(255,0,127,0.4)] hover:bg-[#e00070] hover:shadow-[0_0_15px_rgba(255,0,127,0.6)] transition-all duration-200 cursor-pointer"
            onClick={onConfirm}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
