
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { EbayItem } from '../types';

interface ResultsListProps {
  items: EbayItem[];
}

const ResultsList: React.FC<ResultsListProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-square bg-slate-100 relative overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
            )}
            <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${item.status === 'SOLD' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {item.status}
            </div>
          </div>
          
          <div className="p-4">
            <h4 className="text-sm font-medium line-clamp-2 mb-2 h-10" title={item.title}>
              {item.title}
            </h4>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {item.currency} {item.price.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsList;
