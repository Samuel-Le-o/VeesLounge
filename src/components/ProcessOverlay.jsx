import React from 'react';
import { useShop } from '../../utilities/ShopContext';

export default function ProcessOverlay() {
    const { isProcessing } = useShop();

    if (!isProcessing) return null;

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                // Semi-transparent dark background
                backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                // Places it on top of all other elements
                zIndex: 99999, 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // Blocks clicks, touches, and selections across the entire viewport
                pointerEvents: 'auto', 
                // Smooth transition fade-in effect
                backdropFilter: 'blur(4px)', 
            }}
            // Accessibility safeguard to block clicks
            onClick={(e) => e.stopPropagation()} 
        >
            {/* Minimalist neon pink loading spinner to match Alluring Accent branding */}
            <div style={{ textAlign: 'center' }}>
                <div 
                    style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid rgba(255, 0, 127, 0.1)',
                        borderTop: '4px solid #ff007f',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 15px auto'
                    }}
                />
                {/* <p style={{ color: '#ffffff', fontFamily: 'sans-serif', fontSize: '14px', letterSpacing: '1px' }}>
                    Please wait
                </p> */}
                <p style={{ color: '#ffffff', fontFamily: 'sans-serif', fontSize: '14px', letterSpacing: '1px' }}>
                    Processing...
                </p>
                {/* Injecting CSS keyframes directly into a style tag for the spinner animation */}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
