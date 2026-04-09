import React from 'react';
import { useTheme } from '../App';

const stats = [
  { value: '1,042+', label: 'Cities Analyzed' },
  { value: '94.7%', label: 'Model Accuracy' },
  { value: '11', label: 'Urban Metrics' },
  { value: 'Real-time', label: 'Predictions' },
];

export default function Hero() {
  const { dark } = useTheme();

  return (
    <section id="overview" className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* bg orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full bg-cyan-400/8 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-display font-medium mb-8 border ${
            dark ? 'bg-teal-400/10 border-teal-400/25 text-teal-400' : 'bg-teal-50 border-teal-200 text-teal-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse inline-block" />
            AI-Powered Urban Intelligence
          </div>

          <h1 className={`text-5xl md:text-7xl font-display font-semibold leading-[1.05] tracking-tight mb-6 ${
            dark ? 'text-white' : 'text-gray-900'
          }`}>
            Predict the Future
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              of Smart Cities
            </span>
          </h1>

          <p className={`text-lg leading-relaxed mb-10 font-body ${
            dark ? 'text-white/55' : 'text-black/55'
          }`}>
            Harness machine learning to evaluate 11 urban indicators and classify cities
            with enterprise-grade accuracy. Built for urban planners, researchers, and policymakers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#dashboard"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-display font-medium text-base hover:opacity-90 hover:scale-[1.02] transition-all">
              Launch Dashboard →
            </a>
            <a href="#insights"
              className={`px-8 py-4 rounded-2xl border font-display font-medium text-base transition-all hover:scale-[1.02] ${
                dark ? 'border-white/20 text-white/70 hover:bg-white/5' : 'border-black/20 text-black/70 hover:bg-black/5'
              }`}>
              View Insights
            </a>
          </div>
        </div>

        {/* stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`p-6 rounded-2xl border text-center transition-all hover:scale-[1.02] ${
              dark ? 'bg-white/4 border-white/8 hover:bg-white/6' : 'bg-white border-black/8 shadow-sm hover:shadow-md'
            }`}>
              <div className="text-3xl font-display font-semibold text-teal-400 mb-1 tabular-nums">{s.value}</div>
              <div className={`text-sm font-body ${dark ? 'text-white/50' : 'text-black/50'}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* global status strip */}
        <div className={`mt-8 p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          dark ? 'bg-white/3 border-white/8' : 'bg-white border-black/8 shadow-sm'
        }`}>
          <div className={`text-sm font-display font-medium ${dark ? 'text-white/60' : 'text-black/60'}`}>
            Global Smart City Status (2024)
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { region: 'North America', pct: 68, color: 'from-teal-400 to-cyan-400' },
              { region: 'Europe', pct: 74, color: 'from-blue-400 to-indigo-400' },
              { region: 'Asia Pacific', pct: 61, color: 'from-purple-400 to-pink-400' },
              { region: 'Latin America', pct: 38, color: 'from-amber-400 to-orange-400' },
            ].map(r => (
              <div key={r.region} className="flex items-center gap-2.5">
                <div className={`text-xs font-body ${dark ? 'text-white/50' : 'text-black/50'}`}>{r.region}</div>
                <div className={`w-20 h-1.5 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-black/10'}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${r.color}`} style={{ width: `${r.pct}%` }} />
                </div>
                <div className={`text-xs font-display font-medium tabular-nums ${dark ? 'text-white/70' : 'text-black/70'}`}>{r.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
