import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Finest quality black pepper from Sri Lankan highlands",
      image: "/images/carousel1.jpg"
    },
    {
      id: 2,
      title: "Aromatic green pepper straight from our farms",
      image: "/images/carousel2.jpg"
    },
    {
      id: 3,
      title: "Value-added products for modern kitchens",
      image: "/images/carousel3.png"
    }
  ];

  // Auto-change slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="flex justify-center px-4 mt-6 md:mt-8">
      <div className="relative w-full max-w-6xl h-96 md:h-96 lg:h-[480px] overflow-hidden rounded-xl shadow-lg">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="h-full w-full relative rounded-xl overflow-hidden">
            {/* subtle gradient to improve text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none rounded-xl" />

            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center rounded-xl" />

            {/* Overlay content pinned to bottom-center */}
            <div className="absolute left-1/2 bottom-6 transform -translate-x-1/2 flex flex-col items-center text-center px-4">
              <div className="max-w-3xl">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white drop-shadow-lg">{slide.title}</h3>
                <Link to="/shop" className="mt-3 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium transition-colors inline-block text-center">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-green-600' : 'bg-gray-400 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
      </div>
    </div>
  );
};

export default Carousel;