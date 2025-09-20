import React, { useState, useEffect } from 'react';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Premium Ceylon Black Pepper",
      subtitle: "Finest quality black pepper from Sri Lankan highlands",
      description: "Hand-picked and sun-dried to perfection, our black pepper delivers exceptional flavor and aroma.",
      bgColor: "bg-gradient-to-r from-green-100 to-green-200"
    },
    {
      id: 2,
      title: "Fresh Green Pepper",
      subtitle: "Aromatic green pepper straight from our farms",
      description: "Experience the fresh, vibrant taste of our premium green pepper products.",
      bgColor: "bg-gradient-to-r from-gray-100 to-green-100"
    },
    {
      id: 3,
      title: "Processed Pepper Products",
      subtitle: "Value-added products for modern kitchens",
      description: "From ground pepper to pepper sauces, discover our range of processed products.",
      bgColor: "bg-gradient-to-r from-green-50 to-gray-100"
    },
    {
      id: 4,
      title: "Farm to Table Quality",
      subtitle: "Direct from Sri Lankan pepper farms",
      description: "We ensure the highest quality by maintaining direct relationships with local farmers.",
      bgColor: "bg-gradient-to-r from-gray-50 to-green-50"
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
    <div className="relative h-96 overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className={`${slide.bgColor} h-full flex items-center justify-center text-gray-900`}>
            <div className="text-center max-w-4xl px-8">
              {/* Placeholder for image */}
              <div className="w-32 h-32 bg-green-600 mx-auto mb-6 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">IMG</span>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 text-green-700">{slide.title}</h2>
              <h3 className="text-xl mb-4 text-gray-700">{slide.subtitle}</h3>
              <p className="text-lg text-gray-600 mb-6">{slide.description}</p>
              
              <div className="space-x-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Shop Now
                </button>
                <button className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Learn More
                </button>
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
  );
};

export default Carousel;
