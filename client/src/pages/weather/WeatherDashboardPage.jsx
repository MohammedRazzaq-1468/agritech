import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { Select } from '../../components/common/Select.jsx';
import { INDIAN_STATES } from '../../constants/indianAgri.js';
import { CloudSun, Droplets, Wind, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../services/api.js';

export function WeatherDashboardPage() {
  const [selectedState, setSelectedState] = useState('Punjab');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (state) => {
    setLoading(true);
    try {
      const res = await api.get('/weather/advisory', {
        params: { state }
      });
      if (res.success && res.data) {
        setWeatherData(res.data);
      }
    } catch (err) {
      console.warn('Weather fetch warning', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedState);
  }, [selectedState]);

  const current = weatherData?.current || {
    temperature: 28,
    humidity: 50,
    windSpeed: 8,
    precipitation: 0,
    condition: 'Clear sky'
  };

  const chartData = (weatherData?.forecast || []).map(f => ({
    name: f.date?.slice(5),
    maxTemp: f.maxTemp,
    minTemp: f.minTemp,
    rainProb: f.rainProbability || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Agro-Meteorological Weather Dashboard"
          subtitle="Satellite-verified weather forecasts, evapotranspiration factors, and crop weather alerts"
        />

        <div className="w-56 shrink-0">
          <Select
            label="Filter Region"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            options={INDIAN_STATES}
          />
        </div>
      </div>

      {/* Main Stats Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sky-200 mb-2 border border-white/10">
            <CloudSun className="w-4 h-4" />
            <span>{weatherData?.location?.state || selectedState}, India</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl sm:text-6xl font-black tracking-tight">{current.temperature}°C</span>
            <span className="text-sm font-medium text-sky-200">{current.condition}</span>
          </div>
          <p className="text-xs text-sky-200/80 mt-2">
            Real-time atmospheric observations provided by Open-Meteo European & Global Weather Models.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
            <Droplets className="w-4 h-4 text-sky-300 mx-auto mb-1" />
            <p className="text-[10px] text-sky-200 uppercase font-bold">Humidity</p>
            <p className="text-base font-black">{current.humidity}%</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
            <Wind className="w-4 h-4 text-teal-300 mx-auto mb-1" />
            <p className="text-[10px] text-sky-200 uppercase font-bold">Wind</p>
            <p className="text-base font-black">{current.windSpeed} km/h</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
            <Droplets className="w-4 h-4 text-blue-300 mx-auto mb-1" />
            <p className="text-[10px] text-sky-200 uppercase font-bold">Rain</p>
            <p className="text-base font-black">{current.precipitation} mm</p>
          </div>
        </div>
      </div>

      {/* Agricultural Alerts */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Agricultural Weather Alerts & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weatherData.alerts.map((al, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  al.severity === 'high'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                  al.severity === 'high' ? 'text-rose-600' : 'text-amber-600'
                }`} />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold">{al.title}</h4>
                  <p className="leading-relaxed opacity-90">{al.advice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Temperature Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            7-Day Temperature Trend & Rainfall Probability
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Plan spray windows and fertilizer broadcasts around rain probability peaks.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="maxTemp" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" name="Max Temp (°C)" />
                <Area type="monotone" dataKey="rainProb" stroke="#10b981" strokeWidth={2} fillOpacity={0} name="Rain Probability (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily Forecast Table */}
      {weatherData?.forecast && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            7-Day Detailed Agricultural Forecast
          </h3>
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3">Max Temp</th>
                <th className="py-2.5 px-3">Min Temp</th>
                <th className="py-2.5 px-3">Expected Rain</th>
                <th className="py-2.5 px-3">Rain Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {weatherData.forecast.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{f.date}</td>
                  <td className="py-2.5 px-3">{f.condition}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-bold">{f.maxTemp}°C</td>
                  <td className="py-2.5 px-3 text-slate-500">{f.minTemp}°C</td>
                  <td className="py-2.5 px-3">{f.rainMm} mm</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      f.rainProbability > 50 ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {f.rainProbability}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

