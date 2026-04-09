import React, { useState, useEffect } from 'react';
import { useTheme } from '../App';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? dark ? 'bg-[#080c14]/90 backdrop-blur-lg border-b border-white/10' : 'bg-white/90 backdrop-blur-lg border-b border-black/10 shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <span className="font-display font-semibold text-lg tracking-tight">SmartCity</span>
            <span className="font-display font-light text-lg text-teal-400 ml-1">AI</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Overview', 'Dashboard', 'Insights'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className={`font-display text-sm font-medium transition-colors hover:text-teal-400 ${
                dark ? 'text-white/60' : 'text-black/60'
              }`}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggle}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${
              dark
                ? 'border-white/15 text-white/70 hover:bg-white/10'
                : 'border-black/15 text-black/70 hover:bg-black/5'
            }`}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <a href="#dashboard"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-display font-medium text-sm hover:opacity-90 transition-opacity">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
