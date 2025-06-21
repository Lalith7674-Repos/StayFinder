import React, { useState, useEffect } from 'react';

const backgroundImages = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1380&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1562790351-d273a9d1e1fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1528&q=80',
];

const AuthLayout = ({ children, title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
    }, 10000); // Change image every 10 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {backgroundImages.map((imgUrl, index) => (
        <div
          key={imgUrl}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${imgUrl})`,
            opacity: index === currentImageIndex ? 1 : 0,
            zIndex: 1
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      <div className="relative w-full max-w-md p-8 space-y-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-2xl z-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">
            StayFinder
          </h1>
          <h2 className="mt-2 text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout; 