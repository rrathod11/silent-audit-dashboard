// LogTable.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { format } from 'date-fns';
import { Search, Filter, Calendar } from 'lucide-react';

const PAGE_SIZE = 10;

export default function LogTable() {
  const [logs, setLogs] = useState([]);
  const [deviceIdFilter, setDeviceIdFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [allDeviceIds, setAllDeviceIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadLogs();
    const logsChannel = supabase
      .channel('logs-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, loadLogs)
      .subscribe();

    return () => supabase.removeChannel(logsChannel);
  }, [deviceIdFilter, dateRange.start, dateRange.end, searchQuery, page]);

  async function loadLogs() {
    setIsLoading(true);
    let query = supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (deviceIdFilter) query = query.eq('device_key', deviceIdFilter);
    if (dateRange.start && dateRange.end) {
      query = query
        .gte('timestamp', dateRange.start)
        .lte('timestamp', dateRange.end);
    }
    if (searchQuery) {
      query = query.or(
        `active_app.ilike.%${searchQuery}%,browser_url.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query;
    setIsLoading(false);
    if (error) {
      console.error('❌ Supabase Error:', error);
      setLogs([]);
    } else {
      setLogs(data);
    }
  }

  useEffect(() => {
    async function fetchDevices() {
      const { data, error } = await supabase
        .from('logs')
        .select('device_key')
        .neq('device_key', '');

      if (!error && data) {
        const unique = Array.from(new Set(data.map((r) => r.device_key)));
        setAllDeviceIds(unique);
      }
    }

    fetchDevices();
  }, []);

  const paginatedLogs = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);

  return (
    <div className="card p-4 space-y-4 overflow-hidden">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search app / URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-3 py-2 w-full rounded-md border text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={deviceIdFilter}
            onChange={(e) => setDeviceIdFilter(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">All Devices</option>
            {allDeviceIds.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
              className="border px-2 py-1 rounded-md text-sm"
            />
            <span className="mx-1">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
              className="border px-2 py-1 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-left">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Device</th>
              <th className="p-3">App</th>
              <th className="p-3">Browser URL</th>
              <th className="p-3">Screenshot</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="border-t hover:bg-muted/20">
                <td className="p-3">
                  <div className="flex flex-col">
                    <span>{format(new Date(log.timestamp), 'dd MMM yyyy')}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                </td>
                <td className="p-3 font-mono text-xs">{log.device_key}</td>
                <td className="p-3">{log.active_app || '—'}</td>
                <td className="p-3 max-w-sm truncate">
                  {log.browser_url && log.browser_url !== 'unknown' ? (
                    <a href={log.browser_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {log.browser_url}
                    </a>
                  ) : '—'}
                </td>
                <td className="p-3">
                  {log.screenshot?.startsWith('http') ? (
                    <a href={log.screenshot} target="_blank" rel="noopener noreferrer">
                      <img src={log.screenshot} alt="Screenshot" className="h-10 w-16 object-cover rounded shadow border" />
                    </a>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 p-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === 0}
            >
              &lt;
            </button>
            <span className="text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === totalPages - 1}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
