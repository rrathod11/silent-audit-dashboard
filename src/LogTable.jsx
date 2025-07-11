import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { format } from 'date-fns'

export default function LogTable() {
  const [logs, setLogs] = useState([])
  const [deviceIdFilter, setDeviceIdFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [allDeviceIds, setAllDeviceIds] = useState([])

  // 🔁 Load Logs on filter change or new insert
  useEffect(() => {
    loadLogs()

    const logsChannel = supabase
      .channel('logs-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, () => {
        loadLogs()
      })
      .subscribe()

    return () => supabase.removeChannel(logsChannel)
  }, [deviceIdFilter, dateRange])

  async function loadLogs() {
    let query = supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(100)

    if (deviceIdFilter) query = query.eq('device_id', deviceIdFilter)
    if (dateRange.start && dateRange.end) {
      query = query.gte('timestamp', dateRange.start).lte('timestamp', dateRange.end)
    }

    const { data, error } = await query
    if (error) {
      console.error('❌ Supabase Error:', error)
      setLogs([])
    } else {
      setLogs(data)
    }
  }

  // 📦 Get unique device IDs for filter dropdown
  useEffect(() => {
    async function fetchDevices() {
      const { data } = await supabase
        .from('logs')
        .select('device_id')
        .neq('device_id', '')
        .limit(500)

      const unique = Array.from(new Set(data.map((r) => r.device_id)))
      setAllDeviceIds(unique)
    }

    fetchDevices()
  }, [])

  return (
    <div className="p-4 sm:p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4">SilentAudit Dashboard</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={deviceIdFilter}
          onChange={(e) => setDeviceIdFilter(e.target.value)}
          className="border p-2 rounded w-48"
        >
          <option value="">All Devices</option>
          {allDeviceIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
          className="border p-2 rounded"
        />
      </div>

      {logs.length === 0 ? (
        <p>No activity found yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded shadow">
          <table className="min-w-full text-sm table-auto">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Device ID</th>
                <th className="p-2 text-left">App</th>
                <th className="p-2 text-left">Browser URL</th>
                <th className="p-2 text-left">Screenshot</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="odd:bg-gray-50 border-b">
                  <td className="p-2">{format(new Date(log.timestamp), 'dd MMM yyyy HH:mm')}</td>
                  <td className="p-2 text-xs font-mono">{log.device_id}</td>
                  <td className="p-2">{log.active_app || '—'}</td>
                  <td className="p-2 max-w-xs truncate text-blue-600">
                    {log.browser_url && log.browser_url !== 'unknown' ? (
                      <a href={log.browser_url} target="_blank" rel="noopener noreferrer">
                        {log.browser_url.slice(0, 45)}...
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-2">
                    {log.screenshot && log.screenshot.startsWith('http') ? (
                      <a href={log.screenshot} target="_blank" rel="noopener noreferrer">
                        <img
                          src={log.screenshot}
                          alt="screenshot"
                          className="h-10 w-16 rounded shadow object-cover"
                        />
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
