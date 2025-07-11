import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { format } from 'date-fns'

export default function LogTable() {
  const [logs, setLogs] = useState([])
  const [deviceIdFilter, setDeviceIdFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [allDeviceIds, setAllDeviceIds] = useState([])

  useEffect(() => {
    loadLogs()

    // 🔄 Supabase Realtime Subscription
    const logsChannel = supabase
      .channel('logs-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, () => {
        loadLogs()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(logsChannel)
    }
  }, [deviceIdFilter, dateRange])

  async function loadLogs() {
    let query = supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(100)

    if (deviceIdFilter) {
      query = query.eq('device_id', deviceIdFilter)
    }

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

  // Get distinct device_ids for dropdown
  useEffect(() => {
    async function fetchDevices() {
      const { data } = await supabase.from('logs').select('device_id').neq('device_id', '').limit(100)
      const uniqueIds = [...new Set(data.map((row) => row.device_id))]
      setAllDeviceIds(uniqueIds)
    }
    fetchDevices()
  }, [])

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <select
          value={deviceIdFilter}
          onChange={(e) => setDeviceIdFilter(e.target.value)}
          className="border p-2 rounded"
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
          onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          type="date"
          onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
          className="border p-2 rounded"
        />
      </div>

      {logs.length === 0 ? (
        <p>No activity found yet.</p>
      ) : (
        <table className="min-w-full bg-white text-sm border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Time</th>
              <th className="p-2">Device ID</th>
              <th className="p-2">App</th>
              <th className="p-2">Browser URL</th>
              <th className="p-2">Screenshot</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="odd:bg-gray-50">
                <td className="p-2">{format(new Date(log.timestamp), 'dd MMM yyyy HH:mm')}</td>
                <td className="p-2">{log.device_id}</td>
                <td className="p-2">{log.active_app}</td>
                <td className="p-2 text-blue-600 underline">
                  <a href={log.browser_url} target="_blank" rel="noopener noreferrer">
                    {log.browser_url?.slice(0, 30) || 'N/A'}
                  </a>
                </td>
                <td className="p-2">
                  {log.screenshot ? (
                    <a href={log.screenshot} target="_blank" rel="noopener noreferrer">
                      <img src={log.screenshot} alt="Screenshot" className="h-10 rounded shadow" />
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
