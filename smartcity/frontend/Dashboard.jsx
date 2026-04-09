import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../App';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PolarRadiusAxis, Legend
} from 'recharts';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const DEFAULT_VALUES = {
  population_density: 5000,
  literacy_rate: 75,
  internet_penetration: 65,
  public_transport: 'Medium',
  aqi: 90,
  waste_management: 72,
  water_supply: 80,
  energy_consumption: 2500,
  gdp_per_capita: 25000,
  crime_rate: 35,
  smart_governance: 70,
};

const FIELD_CONFIG = [
  { key: 'population_density', label: 'Population Density', unit: '/km²', min: 100, max: 20000, step: 100, type: 'range' },
  { key: 'literacy_rate', label: 'Literacy Rate', unit: '%', min: 0, max: 100, step: 1, type: 'range' },
  { key: 'internet_penetration', label: 'Internet Penetration', unit: '%', min: 0, max: 100, step: 1, type: 'range' },
  { key: 'public_transport', label: 'Public Transport', type: 'select', options: ['Low', 'Medium', 'High'] },
  { key: 'aqi', label: 'Air Quality Index (AQI)', unit: '', min: 0, max: 500, step: 5, type: 'range', inverted: true },
  { key: 'waste_management', label: 'Waste Management', unit: '%', min: 0, max: 100, step: 1, type: 'range' },
  { key: 'water_supply', label: 'Water Supply', unit: '%', min: 0, max: 100, step: 1, type: 'range' },
  { key: 'energy_consumption', label: 'Energy Consumption', unit: ' kWh', min: 200, max: 8000, step: 100, type: 'range', inverted: true },
  { key: 'gdp_per_capita', label: 'GDP per Capita', unit: ' USD', min: 1000, max: 100000, step: 500, type: 'range' },
  { key: 'crime_rate', label: 'Crime Rate', unit: '/100k', min: 0, max: 100, step: 1, type: 'range', inverted: true },
  { key: 'smart_governance', label: 'Smart Governance', unit: '%', min: 0, max: 100, step: 1, type: 'range' },
];

const TEAL = '#2dd4aa';
const RED = '#ef4444';
const CYAN = '#22d3ee';
const PURPLE = '#a78bfa';

const TREND_DATA = (isSmartCity) => {
  const base = isSmartCity ? 60 : 35;
  return Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    score: Math.min(100, Math.round(base + i * (isSmartCity ? 2.5 : 0.8) + (Math.random() - 0.5) * 6)),
  }));
};

function SliderInput({ field, value, onChange, dark }) {
  const pct = ((value - field.min) / (field.max - field.min)) * 100;
  const color = field.inverted
    ? pct > 66 ? '#ef4444' : pct > 33 ? '#f59e0b' : TEAL
    : pct > 66 ? TEAL : pct > 33 ? '#f59e0b' : '#ef4444';

  return (
    <div className={`p-4 rounded-xl border transition-all ${dark ? 'bg-white/3 border-white/8 hover:bg-white/5' : 'bg-white border-black/8 shadow-sm hover:shadow-md'}`}>
      <div className="flex items-center justify-between mb-3">
        <label className={`text-sm font-display font-medium ${dark ? 'text-white/80' : 'text-black/80'}`}>{field.label}</label>
        <span className="font-mono text-sm font-semibold tabular-nums" style={{ color }}>
          {field.key === 'gdp_per_capita' ? `$${value.toLocaleString()}` : `${value}${field.unit || ''}`}
        </span>
      </div>
      <input
        type="range" min={field.min} max={field.max} step={field.step}
        value={value} onChange={e => onChange(field.key, Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${pct}%)`,
          '--thumb-color': color,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className={`text-xs font-body tabular-nums ${dark ? 'text-white/25' : 'text-black/25'}`}>
          {field.key === 'gdp_per_capita' ? `$${field.min.toLocaleString()}` : `${field.min}${field.unit || ''}`}
        </span>
        <span className={`text-xs font-body tabular-nums ${dark ? 'text-white/25' : 'text-black/25'}`}>
          {field.key === 'gdp_per_capita' ? `$${field.max.toLocaleString()}` : `${field.max}${field.unit || ''}`}
        </span>
      </div>
    </div>
  );
}

function SelectInput({ field, value, onChange, dark }) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${dark ? 'bg-white/3 border-white/8 hover:bg-white/5' : 'bg-white border-black/8 shadow-sm'}`}>
      <label className={`block text-sm font-display font-medium mb-3 ${dark ? 'text-white/80' : 'text-black/80'}`}>{field.label}</label>
      <div className="flex gap-2">
        {field.options.map(opt => (
          <button key={opt} onClick={() => onChange(field.key, opt)}
            className={`flex-1 py-2 rounded-lg text-sm font-display font-medium transition-all ${
              value === opt
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                : dark ? 'bg-white/8 text-white/60 hover:bg-white/12' : 'bg-black/5 text-black/50 hover:bg-black/10'
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs font-mono ${dark ? 'bg-[#0f1624] border-white/15 text-white' : 'bg-white border-black/10 text-black shadow-md'}`}>
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>)}
    </div>
  );
};

export default function Dashboard() {
  const { dark } = useTheme();
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const fileRef = useRef();

  const handleChange = useCallback((key, val) => setValues(p => ({ ...p, [key]: val })), []);

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/predict`, values);
      setResult(data);
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;
    setBulkLoading(true);
    try {
      const form = new FormData();
      form.append('file', csvFile);
      const { data } = await axios.post(`${API_URL}/predict-bulk`, form, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url; a.download = 'predictions.csv'; a.click();
    } catch {
      setError('Bulk prediction failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const csv = ['field,value', ...Object.entries(values).map(([k, v]) => `${k},${v}`), `prediction,${result.prediction}`, `confidence,${result.confidence}`].join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = 'city_prediction.csv'; a.click();
  };

  const isSmartCity = result?.prediction === 'Smart City';

  const barData = Object.entries(values)
    .filter(([k]) => k !== 'public_transport')
    .map(([k, v]) => ({
      name: k.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ').replace('Gdp', 'GDP').replace('Aqi', 'AQI'),
      value: k === 'gdp_per_capita' ? v / 1000 : k === 'energy_consumption' ? v / 100 : v,
    }));

  const radarData = [
    { metric: 'Internet', value: values.internet_penetration },
    { metric: 'Literacy', value: values.literacy_rate },
    { metric: 'Water', value: values.water_supply },
    { metric: 'Waste', value: values.waste_management },
    { metric: 'Governance', value: values.smart_governance },
    { metric: 'Air (inv)', value: 100 - (values.aqi / 5) },
    { metric: 'Safety (inv)', value: 100 - values.crime_rate },
    { metric: 'GDP (norm)', value: Math.min(100, values.gdp_per_capita / 1000) },
  ];

  const pieData = result ? [
    { name: 'Smart City', value: result.probability_smart },
    { name: 'Not Smart', value: result.probability_not_smart },
  ] : [
    { name: 'Smart City', value: 50 },
    { name: 'Not Smart', value: 50 },
  ];

  const trendData = TREND_DATA(isSmartCity);

  const card = `p-6 rounded-2xl border ${dark ? 'bg-white/3 border-white/8' : 'bg-white border-black/8 shadow-sm'}`;
  const labelCls = `text-xs font-display font-medium uppercase tracking-wide ${dark ? 'text-white/40' : 'text-black/40'}`;
  const textPrimary = dark ? 'text-white' : 'text-gray-900';
  const textSec = dark ? 'text-white/60' : 'text-black/60';

  return (
    <div className="max-w-7xl mx-auto px-6" id="dashboard">
      {/* Input Panel */}
      <div className="mb-12">
        <div className="mb-8">
          <p className={`text-sm font-display uppercase tracking-widest mb-2 ${dark ? 'text-teal-400/70' : 'text-teal-600/70'}`}>Urban Indicators</p>
          <h2 className={`text-3xl font-display font-semibold tracking-tight ${textPrimary}`}>Configure Your City</h2>
          <p className={`mt-2 font-body ${textSec}`}>Adjust the 11 urban metrics to match your city's profile</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {FIELD_CONFIG.map(field =>
            field.type === 'select'
              ? <SelectInput key={field.key} field={field} value={values[field.key]} onChange={handleChange} dark={dark} />
              : <SliderInput key={field.key} field={field} value={values[field.key]} onChange={handleChange} dark={dark} />
          )}
        </div>

        {/* Action bar */}
        <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${dark ? 'bg-white/3 border-white/8' : 'bg-white border-black/8 shadow-sm'}`}>
          <div className="flex flex-wrap gap-3">
            <button onClick={handlePredict} disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-display font-medium text-sm hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />}
              {loading ? 'Analyzing...' : 'Predict Smart City'}
            </button>
            <button onClick={() => setValues(DEFAULT_VALUES)}
              className={`px-6 py-3 rounded-xl border font-display font-medium text-sm transition-all hover:scale-[1.02] ${dark ? 'border-white/15 text-white/60 hover:bg-white/5' : 'border-black/15 text-black/60 hover:bg-black/5'}`}>
              Reset
            </button>
            {result && (
              <button onClick={handleDownload}
                className={`px-6 py-3 rounded-xl border font-display font-medium text-sm transition-all hover:scale-[1.02] ${dark ? 'border-teal-400/30 text-teal-400 hover:bg-teal-400/8' : 'border-teal-600/30 text-teal-600 hover:bg-teal-50'}`}>
                ↓ Download CSV
              </button>
            )}
          </div>

          {/* Bulk upload */}
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files[0])} />
            <button onClick={() => fileRef.current?.click()}
              className={`px-4 py-2.5 rounded-xl border text-sm font-display transition-all ${dark ? 'border-white/15 text-white/50 hover:bg-white/5' : 'border-black/15 text-black/50 hover:bg-black/5'}`}>
              {csvFile ? `📁 ${csvFile.name.slice(0, 18)}…` : '+ Upload CSV'}
            </button>
            {csvFile && (
              <button onClick={handleBulkUpload} disabled={bulkLoading}
                className="px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-400/25 text-sm font-display hover:bg-purple-500/30 transition-all disabled:opacity-50">
                {bulkLoading ? 'Processing…' : 'Bulk Predict'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-body animate-slide-up">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div id="results" className="animate-slide-up">
          {/* Prediction Hero */}
          <div className={`mb-8 p-8 rounded-2xl border relative overflow-hidden ${
            isSmartCity
              ? dark ? 'bg-teal-500/8 border-teal-500/25 glow-green' : 'bg-teal-50 border-teal-200'
              : dark ? 'bg-red-500/8 border-red-500/25 glow-red' : 'bg-red-50 border-red-200'
          }`}>
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className={`text-sm font-display uppercase tracking-widest mb-2 ${isSmartCity ? 'text-teal-500' : 'text-red-500'}`}>
                  Classification Result
                </p>
                <h2 className={`text-5xl font-display font-semibold tracking-tight mb-3 ${textPrimary}`}>
                  {isSmartCity ? '✓' : '✗'} {result.prediction}
                </h2>
                <p className={`font-body ${textSec}`}>
                  AI confidence: <span className="font-display font-semibold" style={{ color: isSmartCity ? TEAL : RED }}>{result.confidence}%</span>
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-display font-semibold tabular-nums" style={{ color: TEAL }}>{result.probability_smart}%</div>
                  <div className={`text-xs font-display mt-1 ${textSec}`}>Smart City</div>
                </div>
                <div className={`w-px ${dark ? 'bg-white/10' : 'bg-black/10'}`} />
                <div className="text-center">
                  <div className="text-3xl font-display font-semibold tabular-nums" style={{ color: RED }}>{result.probability_not_smart}%</div>
                  <div className={`text-xs font-display mt-1 ${textSec}`}>Not Smart</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div id="insights" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className={card}>
              <h3 className={`font-display font-medium mb-4 ${textPrimary}`}>Feature Values</h3>
              <p className={`text-xs font-body mb-4 ${textSec}`}>Normalized view of input indicators</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                  <XAxis dataKey="name" tick={{ fill: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10, fontFamily: 'JetBrains Mono' }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip dark={dark} />} />
                  <Bar dataKey="value" fill={TEAL} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className={card}>
              <h3 className={`font-display font-medium mb-1 ${textPrimary}`}>City Performance Radar</h3>
              <p className={`text-xs font-body mb-4 ${textSec}`}>Multidimensional performance profile</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke={TEAL} fill={TEAL} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className={card}>
              <h3 className={`font-display font-medium mb-1 ${textPrimary}`}>Probability Distribution</h3>
              <p className={`text-xs font-body mb-4 ${textSec}`}>Smart vs Not Smart classification probability</p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    <Cell fill={TEAL} fillOpacity={0.85} />
                    <Cell fill={RED} fillOpacity={0.75} />
                  </Pie>
                  <Tooltip content={<CustomTooltip dark={dark} />} />
                  <Legend formatter={(v) => <span style={{ color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: 12, fontFamily: 'DM Sans' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Chart */}
            <div className={card}>
              <h3 className={`font-display font-medium mb-1 ${textPrimary}`}>Simulated Trend</h3>
              <p className={`text-xs font-body mb-4 ${textSec}`}>Projected 12-month smart city score trajectory</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                  <XAxis dataKey="month" tick={{ fill: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip dark={dark} />} />
                  <Line type="monotone" dataKey="score" stroke={isSmartCity ? TEAL : RED} strokeWidth={2.5} dot={{ r: 3, fill: isSmartCity ? TEAL : RED }} activeDot={{ r: 5 }} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Importance */}
          <div className={`${card} mb-8`}>
            <h3 className={`font-display font-medium mb-1 ${textPrimary}`}>Feature Importance</h3>
            <p className={`text-xs font-body mb-5 ${textSec}`}>Relative importance of each feature in the prediction model</p>
            <div className="space-y-3">
              {Object.entries(result.feature_importance)
                .sort(([, a], [, b]) => b - a)
                .map(([feat, imp]) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className={`w-32 text-xs font-mono ${textSec} truncate`}>{feat.replace('_enc', '').replace(/_/g, ' ')}</div>
                    <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? 'bg-white/8' : 'bg-black/8'}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-700"
                        style={{ width: `${Math.min(100, imp * 5)}%` }} />
                    </div>
                    <div className={`w-12 text-right text-xs font-mono tabular-nums ${textSec}`}>{imp.toFixed(1)}%</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Insights Panel */}
          <div className={card}>
            <h3 className={`font-display font-medium mb-1 ${textPrimary}`}>AI Insights</h3>
            <p className={`text-xs font-body mb-5 ${textSec}`}>Auto-generated analysis based on your city's profile</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.insights.map((ins, i) => (
                <div key={i} className={`flex gap-3 p-4 rounded-xl border ${
                  ins.type === 'positive'
                    ? dark ? 'bg-teal-500/8 border-teal-500/20' : 'bg-teal-50 border-teal-100'
                    : dark ? 'bg-red-500/8 border-red-500/20' : 'bg-red-50 border-red-100'
                }`}>
                  <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    ins.type === 'positive' ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {ins.type === 'positive' ? '↑' : '↓'}
                  </div>
                  <p className={`text-sm font-body leading-relaxed ${dark ? 'text-white/70' : 'text-black/70'}`}>{ins.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className={`py-20 text-center ${card}`}>
          <div className="text-5xl mb-4 opacity-30">🏙</div>
          <h3 className={`font-display font-medium text-xl mb-2 ${textPrimary}`}>Ready to Analyze</h3>
          <p className={`font-body text-sm ${textSec}`}>Configure the urban indicators above and click "Predict Smart City" to see results</p>
        </div>
      )}
    </div>
  );
}
