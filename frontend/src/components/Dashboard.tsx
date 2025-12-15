
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { EbayItem } from '../types';

interface DashboardProps {
  items: EbayItem[];
  type: 'active' | 'sold';
}

const Dashboard: React.FC<DashboardProps> = ({ items, type }) => {
  if (items.length === 0) return null;

  // Statistics
  const stats = useMemo(() => {
    const prices = items.map(i => i.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { min, max, avg };
  }, [items]);

  // Histogram Data
  const histogramData = useMemo(() => {
    const bucketCount = 10;
    const step = (stats.max - stats.min) / bucketCount || 1;
    const buckets = Array(bucketCount).fill(0).map((_, i) => ({
      range: `${Math.floor(stats.min + i * step)} - ${Math.floor(stats.min + (i + 1) * step)}`,
      count: 0
    }));

    items.forEach(item => {
      const index = Math.min(
        Math.floor((item.price - stats.min) / step), 
        bucketCount - 1
      );
      buckets[index].count++;
    });
    return buckets;
  }, [items, stats]);

  // Time Series Data
  const timeData = useMemo(() => {
    // Sort by date asc
    const sorted = [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      price: item.price
    }));
  }, [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Stats Cards */}
      <div className="lg:col-span-2 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Average Price</p>
          <p className="text-2xl font-bold text-blue-600">${stats.avg.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Lowest Price</p>
          <p className="text-2xl font-bold text-green-600">${stats.min.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Highest Price</p>
          <p className="text-2xl font-bold text-red-600">${stats.max.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 h-80">
        <h3 className="text-lg font-semibold mb-4">Price Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogramData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" tick={{fontSize: 10}} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 h-80">
        <h3 className="text-lg font-semibold mb-4">Price Trend ({type === 'sold' ? 'Sold Date' : 'Listing Date'})</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{fontSize: 10}} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
