// LogTable.jsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useData } from './context/DataContext';
import { useNotification } from './context/NotificationContext';

const PAGE_SIZE = 10;

export default function LogTable() {
  const { fetchLogs, fetchDeviceIds, subscribeToLogs, isLoading: dataLoading } = useData();
  const { showError } = useNotification();
  
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [deviceIdFilter, setDeviceIdFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [allDeviceIds, setAllDeviceIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
    loadDeviceIds();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToLogs(() => {
      loadLogs();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadLogs();
  }, [deviceIdFilter, dateRange.start, dateRange.end, searchQuery, currentPage]);

  const loadDeviceIds = async () => {
    try {
      const deviceIds = await fetchDeviceIds();
      setAllDeviceIds(deviceIds);
    } catch (err) {
      setError('Failed to load device IDs');
      showError('Failed to load device IDs');
      console.error('Error loading device IDs:', err);
    }
  };

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchLogs({
        page: currentPage,
        pageSize: PAGE_SIZE,
        deviceId: deviceIdFilter || null,
        startDate: dateRange.start || null,
        endDate: dateRange.end || null,
        searchQuery: searchQuery || null
      });
      
      if (result.error) {
        throw result.error;
      }
      
      setLogs(result.data);
      setFilteredLogs(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError('Failed to load logs');
      showError('Failed to load logs');
      console.error('Error loading logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (dir) => {
    const newPage = currentPage + dir;
    if (newPage < 1 || newPage > Math.ceil(totalCount / PAGE_SIZE)) return;
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-red-500 dark:text-red-400 mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
            <p className="text-sm text-red-600 dark:text-red-300">Please try again or contact support</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {(isLoading || dataLoading) && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !dataLoading && !error && (
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
      )}

      {/* Pagination */}
      {!isLoading && !dataLoading && !error && filteredLogs.length > 0 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalCount} logs)
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
