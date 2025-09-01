import { useState } from 'react';

export default function CeylonPepperHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides = [
    {
      title: "Premium Ceylon Black Pepper",
      subtitle: "Authentic Sri Lankan Quality",
      description: "Experience the rich, bold flavor of our premium Ceylon black pepper, harvested from the finest plantations in Sri Lanka.",
      bgColor: "bg-gradient-to-r from-orange-600 to-red-600"
    },
    {
      title: "White Pepper Collection",
      subtitle: "Mild & Aromatic",
      description: "Our carefully processed white pepper offers a delicate, refined taste perfect for gourmet cooking.",
      bgColor: "bg-gradient-to-r from-amber-600 to-orange-600"
    },
    {
      title: "Pepper Powder & Blends",
      subtitle: "Ground to Perfection",
      description: "Freshly ground pepper powders and custom spice blends to elevate your culinary creations.",
      bgColor: "bg-gradient-to-r from-red-600 to-pink-600"
    },
    {
      title: "Organic Ceylon Pepper",
      subtitle: "100% Natural & Pure",
      description: "Certified organic pepper grown without chemicals, maintaining the authentic Ceylon pepper tradition.",
      bgColor: "bg-gradient-to-r from-green-600 to-emerald-600"
    }
  ];

  const categories = [
    { name: "Black Pepper", description: "Premium whole peppercorns", bgColor: "bg-gray-800" },
    { name: "White Pepper", description: "Mild and aromatic", bgColor: "bg-amber-100" },
    { name: "Pepper Powder", description: "Freshly ground varieties", bgColor: "bg-orange-200" },
    { name: "Spice Blends", description: "Curated pepper blends", bgColor: "bg-red-100" },
    { name: "Organic Range", description: "Certified organic products", bgColor: "bg-green-100" },
    { name: "Gift Sets", description: "Perfect for pepper lovers", bgColor: "bg-purple-100" }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-2xl">CP</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Ceylon Pepper</h1>
            </div>

            {/* Main Navigation */}
            <nav className="flex space-x-10">
              <a href="#" className="text-gray-700 hover:text-orange-600 font-semibold text-lg transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-orange-600 font-semibold text-lg transition-colors">Shop</a>
              <a href="#" className="text-gray-700 hover:text-orange-600 font-semibold text-lg transition-colors">About</a>
              <a href="#" className="text-gray-700 hover:text-orange-600 font-semibold text-lg transition-colors">Contact</a>
              <a href="#" className="text-gray-700 hover:text-orange-600 font-semibold text-lg transition-colors">FAQ</a>
            </nav>

            {/* Login/Cart */}
            <div className="flex items-center space-x-6">
              <button className="text-gray-700 hover:text-orange-600 font-semibold transition-colors">Login</button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Register</button>
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                  <span className="text-gray-600 text-xl">🛒</span>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Carousel */}
      <section className="relative h-96 overflow-hidden">
        <div className="relative w-full h-full">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              } ${slide.bgColor}`}
            >
              <div className="container mx-auto px-8 h-full flex items-center">
                <div className="text-white max-w-2xl">
                  <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
                  <h3 className="text-2xl font-semibold mb-4 opacity-90">{slide.subtitle}</h3>
                  <p className="text-xl mb-8 opacity-80">{slide.description}</p>
                  <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
                    Shop Now
                  </button>
                </div>
                <div className="flex-1 flex justify-center items-center">
                  <div className="w-80 h-80 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-6xl">📸</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
        >
          <span className="text-2xl">‹</span>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
        >
          <span className="text-2xl">›</span>
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Our Product Categories</h2>
          <p className="text-xl text-gray-600 text-center mb-16">Discover our premium range of Ceylon pepper and spice products</p>
          
          <div className="grid grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`${category.bgColor} rounded-2xl p-8 h-64 flex flex-col justify-between hover:scale-105 transition-transform duration-300`}>
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <span className="text-4xl">📸</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{category.name}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Ceylon Pepper Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <div className="flex items-center">
            <div className="flex-1 pr-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Why Ceylon Pepper?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Quality</h3>
                    <p className="text-gray-600">Sourced directly from the finest pepper plantations in Sri Lanka, ensuring authentic Ceylon pepper quality.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Rich Heritage</h3>
                    <p className="text-gray-600">Ceylon pepper has been prized for centuries for its superior flavor profile and aromatic properties.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Sustainable Farming</h3>
                    <p className="text-gray-600">We support local farmers and sustainable farming practices that preserve the environment.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Fresh & Pure</h3>
                    <p className="text-gray-600">Our products are processed and packaged with care to maintain freshness and purity.</p>
                  </div>
                </div>
              </div>
              
              <button className="mt-8 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                Learn More About Ceylon Pepper
              </button>
            </div>
            
            <div className="flex-1">
              <div className="w-full h-96 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                <span className="text-8xl">📸</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">CP</span>
                </div>
                <h3 className="text-xl font-bold">Ceylon Pepper</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Your trusted source for premium Ceylon pepper and authentic Sri Lankan spices. 
                Bringing you the finest quality directly from our partner farms.
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-bold mb-6">Contact Us</h3>
              <div className="space-y-3 text-gray-300">
                <p>📧 info@ceylonpepper.com</p>
                <p>📞 +94 11 234 5678</p>
                <p>📍 123 Spice Street, Colombo, Sri Lanka</p>
                <p>🕒 Mon - Fri: 9:00 AM - 6:00 PM</p>
              </div>
            </div>

            {/* Shipping & Returns */}
            <div>
              <h3 className="text-xl font-bold mb-6">Policies</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-300 hover:text-orange-400 transition-colors">Shipping Information</a>
                <a href="#" className="block text-gray-300 hover:text-orange-400 transition-colors">Return Policy</a>
                <a href="#" className="block text-gray-300 hover:text-orange-400 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-gray-300 hover:text-orange-400 transition-colors">Terms of Service</a>
                <a href="#" className="block text-gray-300 hover:text-orange-400 transition-colors">Quality Guarantee</a>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-bold mb-6">Follow Us</h3>
              <div className="flex space-x-4 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <span className="text-white">f</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-pink-700 transition-colors">
                  <span className="text-white">📷</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                  <span className="text-white">🐦</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Newsletter</h4>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 rounded-l-lg text-gray-800"
                  />
                  <button className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-r-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2025 Ceylon Pepper. All rights reserved. | Bringing you authentic Sri Lankan spices since 1985</p>
          </div>
        </div>
      </footer>
    </div>
  );
}