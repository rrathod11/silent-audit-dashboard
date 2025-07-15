// LogTable.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { format } from 'date-fns';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export default function LogTable() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [deviceIdFilter, setDeviceIdFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [allDeviceIds, setAllDeviceIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLogs();

    const logsChannel = supabase
      .channel('logs-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, () => {
        loadLogs();
      })
      .subscribe();

    return () => supabase.removeChannel(logsChannel);
  }, [deviceIdFilter, dateRange.start, dateRange.end, searchQuery]);

  const loadLogs = async () => {
    setIsLoading(true);
    let query = supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);

    if (deviceIdFilter) query = query.eq('device_key', deviceIdFilter);
    if (dateRange.start && dateRange.end) {
      query = query.gte('timestamp', dateRange.start).lte('timestamp', dateRange.end);
    }

    const { data, error } = await query;
    setIsLoading(false);

    if (!error && data) {
      let filtered = data;

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        filtered = filtered.filter(
          log =>
            log.active_app?.toLowerCase().includes(lower) ||
            log.browser_url?.toLowerCase().includes(lower)
        );
      }

      setLogs(filtered);
      setFilteredLogs(filtered.slice(0, PAGE_SIZE));
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    async function fetchDevices() {
      const { data, error } = await supabase
        .from('logs')
        .select('device_key')
        .neq('device_key', '')
        .limit(500);

      if (!error && data) {
        const unique = [...new Set(data.map((r) => r.device_key))];
        setAllDeviceIds(unique);
      }
    }

    fetchDevices();
  }, []);

  const handlePageChange = (dir) => {
    const newPage = currentPage + dir;
    const start = (newPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setFilteredLogs(logs.slice(start, end));
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search app / URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={deviceIdFilter}
              onChange={(e) => setDeviceIdFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Devices</option>
              {allDeviceIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(r => ({ ...r, start: e.target.value }))}
              className="h-10 rounded-md border px-2 text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(r => ({ ...r, end: e.target.value }))}
              className="h-10 rounded-md border px-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">No logs found</p>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Device</th>
                <th className="px-4 py-2">App</th>
                <th className="px-4 py-2">Browser URL</th>
                <th className="px-4 py-2">Screenshot</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div>
                      <div>{format(new Date(log.timestamp), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(log.timestamp), 'HH:mm:ss')}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{log.device_key || '—'}</td>
                  <td className="px-4 py-2">{log.active_app || '—'}</td>
                  <td className="px-4 py-2 max-w-xs truncate">
                    {log.browser_url ? (
                      <a href={log.browser_url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                        {log.browser_url}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {log.screenshot?.startsWith('http') ? (
                      <a href={log.screenshot} target="_blank" rel="noopener noreferrer">
                        <img src={log.screenshot} alt="screenshot" className="h-12 w-20 object-cover border rounded" />
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(-1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
