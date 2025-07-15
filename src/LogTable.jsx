import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { format } from 'date-fns'
import { Search, Filter, Calendar } from 'lucide-react'

export default function LogTable() {
  const [logs, setLogs] = useState([])
  const [deviceIdFilter, setDeviceIdFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [allDeviceIds, setAllDeviceIds] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadLogs()

    const logsChannel = supabase
      .channel('logs-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, () => {
        loadLogs()
      })
      .subscribe()

    return () => supabase.removeChannel(logsChannel)
  }, [deviceIdFilter, dateRange, searchQuery])

  async function loadLogs() {
    let query = supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(100)

    if (deviceIdFilter) query = query.eq('device_key', deviceIdFilter)
    if (dateRange.start && dateRange.end) {
      query = query.gte('timestamp', dateRange.start).lte('timestamp', dateRange.end)
    }
    if (searchQuery) {
      query = query.or(`active_app.ilike.%${searchQuery}%,browser_url.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query
    if (error) {
      console.error('❌ Supabase Error:', error)
      setLogs([])
    } else {
      setLogs(data)
    }
  }

  useEffect(() => {
    async function fetchDevices() {
      const { data } = await supabase
        .from('logs')
        .select('device_key')
        .neq('device_key', '')
        .limit(500)

      const unique = Array.from(new Set(data.map((r) => r.device_key))
      setAllDeviceIds(unique)
    }

    fetchDevices()
  }, [])

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs..."
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Devices</option>
                  {allDeviceIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="card overflow-hidden">
        {logs.length === 0 ? (
          <div className="card-content">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No logs found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || deviceIdFilter || dateRange.start
                  ? "Try adjusting your search or filter criteria"
                  : "Activity logs will appear here once available"}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr className="hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Device ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">App</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Browser URL</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Screenshot</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span>{format(new Date(log.timestamp), 'dd MMM yyyy')}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle font-mono text-xs">
                      {log.device_id}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {log.active_app || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle max-w-xs">
                      {log.browser_url && log.browser_url !== 'unknown' ? (
                        <a
                          href={log.browser_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline underline-offset-4 truncate block"
                        >
                          {log.browser_url}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      {log.screenshot && log.screenshot.startsWith('http') ? (
                        <a
                          href={log.screenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <img
                            src={log.screenshot}
                            alt="screenshot"
                            className="h-12 w-20 rounded-md shadow-sm object-cover border"
                          />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Logs</h3>
              <span className="text-2xl font-bold">{logs.length}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Unique Devices</h3>
              <span className="text-2xl font-bold">{allDeviceIds.length}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <span className="text-2xl font-bold">
                {logs[0] ? format(new Date(logs[0].timestamp), 'HH:mm') : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
