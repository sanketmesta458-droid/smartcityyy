import React, { useState, createContext, useContext } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';

export const ThemeContext = createContext({ dark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [dark, setDark] = useState(true);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(p => !p) }}>
      <div className={dark ? 'dark' : ''}>
        <div className={`min-h-screen transition-colors duration-300 ${
          dark
            ? 'bg-[#080c14] text-white bg-grid-dark'
            : 'bg-[#f4f6f9] text-gray-900 bg-grid-light'
        }`}>
          <Navbar />
          <main>
            <Hero />
            <Dashboard />
          </main>
          <footer className={`py-8 text-center text-sm mt-20 border-t ${
            dark ? 'border-white/10 text-white/30' : 'border-black/10 text-black/30'
          }`}>
            <p className="font-display">SmartCity AI — Urban Intelligence Platform &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
