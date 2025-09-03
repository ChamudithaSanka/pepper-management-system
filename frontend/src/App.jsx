import { Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import CustomerLogin from './components/CustomerLogin';
import CustomerRegister from './components/CustomerRegister';
import StaffLogin from './components/StaffLogin';
import ProductListing from './components/ProductListing';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import CheckoutCustomerDetails from './components/CheckoutCustomerDetails';
import CheckoutPayment from './components/CheckoutPayment';
import OrderConfirmation from './components/OrderConfirmation';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/shop" element={<ProductListing />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<CheckoutCustomerDetails />} />
      <Route path="/checkout/payment" element={<CheckoutPayment />} />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
    </Routes>
  )
}

export default App
