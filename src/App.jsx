import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import WelcomeScreen from './components/WelcomeScreen'
import './App.css'

function App() {
  const [showWelcome, setShowWelcome] = useState(false) // Set to true to enable welcome screen

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />
  }

  return <ChatInterface />
}

export default App
