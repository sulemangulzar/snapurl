import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">URL Shortener</h1>
      <p className="text-gray-600 mb-4">React + Tailwind CSS configured</p>
      <button 
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Count is {count}
      </button>
    </div>
  )
}

export default App
