import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

export const useAdminBackButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Push a state to the history stack so we can detect back button
    window.history.pushState(null, null, window.location.pathname);

    const handleBackButton = (e) => {
      // Prevent default back behavior
      e.preventDefault();
      
      // Push state again to maintain history
      window.history.pushState(null, null, window.location.pathname);

      // Show toast with action buttons
      const toastId = toast.custom((t) => (
        <div style={{
          background: '#18181b',
          border: '1px solid #e11d48',
          borderRadius: '12px',
          padding: '16px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              You are about to leave the admin area
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a1a1a1' }}>
              Do you want to log out or stay?
            </p>
          </div>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              // Log out logic
              localStorage.removeItem('adminLoggedIn');
              localStorage.removeItem('ACCESS_TOKEN');
              localStorage.removeItem('ADMIN_ID');
              navigate('/login', { replace: true });
            }}
            style={{
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#be123c';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#e11d48';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Log Out
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId);
            }}
            style={{
              background: '#27272a',
              color: '#ffffff',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#3f3f46';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#27272a';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Stay
          </button>
        </div>
      ), {
        duration: Infinity,
        position: 'top-center'
      });
    };

    // Listen for browser back button
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);
};
