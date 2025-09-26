import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import CeylonPepperHomepage from './components/homepage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<CeylonPepperHomepage />} />
    </Routes>
  )
}

export default App
