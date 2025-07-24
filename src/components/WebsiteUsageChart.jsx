// components/WebsiteUsageChart.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function WebsiteUsageChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: logs } = await supabase
        .from('logs')
        .select('browser_url, timestamp')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('browser_url', 'is', null)
        .neq('browser_url', 'unknown');

      if (logs) {
        // Extract domains from URLs
        const domainCounts = logs.reduce((acc, log) => {
          try {
            const url = new URL(log.browser_url);
            const domain = url.hostname.replace('www.', '');
            acc[domain] = (acc[domain] || 0) + 1;
          } catch {}
          return acc;
        }, {});

        const sortedDomains = Object.entries(domainCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);

        setData(sortedDomains);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Most Visited Websites</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
