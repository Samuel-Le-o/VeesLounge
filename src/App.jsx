import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { ShopProvider } from '../utilities/ShopContext';
import { Toaster } from 'react-hot-toast'; // Kept your existing toast import

import HomePage from './pages/Home';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductPage from './pages/ProductPage';
import DashBoard from './pages/DashBoard';
import Inventory from './pages/Inventory';
import Order from './pages/Order';
import AddProduct from './pages/AddProduct';
import Promotion from './pages/Promotion';
import ManageProduct from './pages/ManageProduct';
import AllProducts from './pages/AllProducts';
import AllBestSellers from './pages/AllBestSellers';
import Category from './pages/Category';
import ProtectedRoute from './components/ProtectedRoute';




const appRouter = createBrowserRouter([
  { path: '/', element: <HomePage/> },
  { path: '/shop', element: <Shop/> },
  { path: '/contact', element: <Contact/> },
  { path: '/bestsellers', element: <AllBestSellers/> },
  { path: '/product', element: <ProductPage/> },
  { path: '/login', element: <LoginPage/> },
  { path: '/signup', element: <SignupPage/> },
  {
    path: '/',
    element: <ProtectedRoute />, 
    children: [
      { path: '/dashboard', element: <DashBoard/> },
      { path: '/inventory', element: <Inventory/> },
      { path: '/order', element: <Order/> },
      { path: '/addproduct', element: <AddProduct/> },
      { path: '/promotion', element: <Promotion/> },
      { path: '/manageproduct', element: <ManageProduct/> },
      { path: '/category', element: <Category/> }

    ]
  },
  { path: '/*', element: <NotFound/> }
])

function App() {
  return (
    <ShopProvider>
        <Toaster 
          position="top-right" 
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#18181b', // Dark zinc-900 look matching your footer
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid #27272a',
              marginTop: '35px',
              marginRight: '-15px',
            },
            success: {
              iconTheme: {
                primary: '#db2777', 
                secondary: '#ffffff',
              },
            },
          }}
        />
        
        <RouterProvider router={appRouter}/>
    </ShopProvider>
  )
}

export default App
