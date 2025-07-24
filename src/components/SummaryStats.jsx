// src/components/SummaryStats.jsx
import { FiList, FiSmartphone, FiClock } from 'react-icons/fi';

export default function SummaryStats({ totalLogs, uniqueDevices, lastUpdated }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h4 className="text-sm text-muted-foreground flex items-center gap-2">
          <FiList /> Total Logs
        </h4>
        <p className="text-2xl font-bold mt-1">{totalLogs}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h4 className="text-sm text-muted-foreground flex items-center gap-2">
          <FiSmartphone /> Unique Devices
        </h4>
        <p className="text-2xl font-bold mt-1">{uniqueDevices}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h4 className="text-sm text-muted-foreground flex items-center gap-2">
          <FiClock /> Last Updated
        </h4>
        <p className="text-2xl font-bold mt-1">{lastUpdated}</p>
      </div>
    </div>
  );
}
