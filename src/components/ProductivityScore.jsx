import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const productivityApps = ['vscode', 'slack', 'figma', 'notion', 'github'];
const distractingApps = ['youtube', 'netflix', 'spotify', 'instagram', 'facebook'];

export default function ProductivityScore() {
  const [score, setScore] = useState(0);
  const [trend, setTrend] = useState('neutral');

  useEffect(() => {
    const calculateScore = async () => {
      const { data } = await supabase
        .from('logs')
        .select('active_app, timestamp')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (data) {
        const productive = data.filter(log => 
          productivityApps.some(app => log.active_app?.toLowerCase().includes(app))
        ).length;
        
        const distracting = data.filter(log => 
          distractingApps.some(app => log.active_app?.toLowerCase().includes(app))
        ).length;
        
        const total = productive + distracting;
        const newScore = total > 0 ? Math.round((productive / total) * 100) : 0;
        setScore(newScore);
        
        // Compare with previous day
        const yesterdayData = data.filter(log => 
          new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        const yesterdayProductive = yesterdayData.filter(log => 
          productivityApps.some(app => log.active_app?.toLowerCase().includes(app))
        ).length;
        
        const yesterdayDistracting = yesterdayData.filter(log => 
          distractingApps.some(app => log.active_app?.toLowerCase().includes(app))
        ).length;
        
        const yesterdayTotal = yesterdayProductive + yesterdayDistracting;
        const yesterdayScore = yesterdayTotal > 0 ? Math.round((yesterdayProductive / yesterdayTotal) * 100) : 0;
        
        setTrend(newScore > yesterdayScore ? 'up' : newScore < yesterdayScore ? 'down' : 'neutral');
      }
    };
    
    calculateScore();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Productivity Score</h3>
      <div className="flex items-center justify-between">
        <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full ${
              score > 70 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="ml-4 flex items-center">
          <span className="text-2xl font-bold mr-2">{score}%</span>
          {trend === 'up' ? (
            <FiTrendingUp className="text-emerald-500 text-xl" />
          ) : trend === 'down' ? (
            <FiTrendingDown className="text-red-500 text-xl" />
          ) : null}
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Based on app usage patterns ({productivityApps.length} productive vs {distractingApps.length} distracting apps)
      </p>
    </div>
  );
}
