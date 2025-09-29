import React, { useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import DashboardOverview from './DashboardOverview';
import UserProfile from './UserProfile';
import MyOrders from './MyOrders';
import PaymentMethods from './PaymentMethods';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'payments', label: 'Payments', icon: '💳' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'profile':
        return <UserProfile />;
      case 'orders':
        return <MyOrders />;
      case 'payments':
        return <PaymentMethods />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer <span className="text-green-600">Dashboard</span>
          </h1>
          <p className="text-gray-600">Manage your orders, profile, and payment methods</p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-lg border border-green-200 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md transform scale-[1.02]'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 hover:text-green-700'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-lg border border-blue-200 p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;
