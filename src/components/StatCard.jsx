export default function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-800',
    red: 'bg-red-100 text-red-800',
    amber: 'bg-amber-100 text-amber-800',
    emerald: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <div className={`${colorClasses[color]} p-4 rounded-lg flex items-center gap-3 shadow-sm`}>
      <div className="text-2xl">{icon}</div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
