import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>🌶️ Pepper Management System</h1>
        <p>Frontend is ready with Vite + React!</p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Ready to build your pepper management features!
          </p>
        </div>
      </div>
    </>
  )
}

export default App
