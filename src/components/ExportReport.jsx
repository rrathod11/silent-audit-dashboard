// components/ExportReport.jsx
import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { supabase } from '../supabaseClient';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportReport() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [deviceId, setDeviceId] = useState('');
  const [allDeviceIds, setAllDeviceIds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    let query = supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (dateRange.start) query = query.gte('timestamp', dateRange.start);
    if (dateRange.end) query = query.lte('timestamp', dateRange.end);
    if (deviceId) query = query.eq('device_id', deviceId);

    const { data, error } = await query;
    if (!error) {
      setLogs(data);
    }
    setIsLoading(false);
  };

  const fetchDevices = async () => {
    const { data } = await supabase
      .from('logs')
      .select('device_id')
      .neq('device_id', '')
      .limit(500);

    const unique = Array.from(new Set(data.map((r) => r.device_id)));
    setAllDeviceIds(unique);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('SilentAudit Activity Report', 105, 20, { align: 'center' });
    
    // Date range
    doc.setFontSize(12);
    const dateText = dateRange.start && dateRange.end 
      ? `Date Range: ${dateRange.start} to ${dateRange.end}`
      : 'All Dates';
    doc.text(dateText, 105, 30, { align: 'center' });
    
    // Device filter
    if (deviceId) {
      doc.text(`Device ID: ${deviceId}`, 105, 36, { align: 'center' });
    }
    
    // Table data
    const tableData = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.device_id,
      log.active_app || '—',
      log.browser_url || '—',
      log.is_productive ? 'Yes' : 'No',
      log.is_distracting ? 'Yes' : 'No'
    ]);
    
    // Table
    doc.autoTable({
      head: [['Timestamp', 'Device ID', 'App', 'URL', 'Productive', 'Distracting']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [55, 65, 81] }
    });
    
    // Save the PDF
    doc.save('SilentAudit_Report.pdf');
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Export Activity Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device ID</label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
          >
            <option value="">All Devices</option>
            {allDeviceIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>
      
      {logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CSVLink 
            data={logs} 
            filename="SilentAudit_Data.csv"
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center justify-center gap-2"
          >
            <FiFileText /> Export as CSV
          </CSVLink>
          
          <button
            onClick={generatePDF}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center gap-2"
          >
            <FiFile /> Export as PDF
          </button>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Preview Data ({logs.length} records)</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Device</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.slice(0, 5).map(log => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {log.device_id}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {log.active_app || '—'}
                    </td>
                  </tr>
                ))}
                {logs.length > 5 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                      + {logs.length - 5} more records...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
