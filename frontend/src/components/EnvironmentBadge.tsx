import React, { useState, useEffect } from 'react';
import { getConfigDetails } from '../services/api';

const EnvironmentBadge: React.FC = () => {
  const [env, setEnv] = useState<string | null>(null);

  useEffect(() => {
    loadEnv();
  }, []);

  const loadEnv = async () => {
    try {
      const config = await getConfigDetails();
      if (config.configured && config.env) {
        setEnv(config.env);
      }
    } catch (err) {
      console.error('Failed to load environment:', err);
    }
  };

  if (!env) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      env === 'PRODUCTION' 
        ? 'bg-green-100 text-green-700 border border-green-300' 
        : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
    }`}>
      <span className={`w-2 h-2 rounded-full ${
        env === 'PRODUCTION' ? 'bg-green-500' : 'bg-yellow-500'
      }`}></span>
      {env}
    </div>
  );
};

export default EnvironmentBadge;

