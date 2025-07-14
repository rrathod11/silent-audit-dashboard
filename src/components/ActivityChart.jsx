import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ActivityChart({ logs }) {
  // Process logs to get hourly activity
  const hourlyData = Array(24).fill().map((_, hour) => ({
    hour: hour.toString().padStart(2, '0'),
    activity: logs.filter(log => new Date(log.timestamp).getHours() === hour).length
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="font-bold text-gray-800 mb-3">Hourly Activity</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <Bar dataKey="activity" fill="#8884d8" radius={[4, 4, 0, 0]} />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
