import { Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import CustomerLogin from './components/CustomerLogin';
import CustomerRegister from './components/CustomerRegister';
import StaffLogin from './components/StaffLogin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/staff-login" element={<StaffLogin />} />
    </Routes>
  )
}

export default App
