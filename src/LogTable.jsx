import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { format } from 'date-fns'

export default function LogTable() {
  const [logs, setLogs] = useState(null) // initially null

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('logs')
        .select('id, timestamp, active_app, device_id, devices(name)')
        .order('timestamp', { ascending: false })
        .limit(100)
        
      if (error) {
        console.error("❌ Supabase Error:", error)
        setLogs([])
      } else {
        setLogs(data)
      }
    }

    load()
  }, [])

  if (logs === null) return <p className="p-4">Loading logs...</p>
  if (logs.length === 0) return <p className="p-4">No activity found yet.</p>

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">Time</th>
          <th className="p-2">Device</th>
          <th className="p-2">App</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id} className="odd:bg-gray-50">
            <td className="p-2">{format(new Date(log.timestamp), 'dd MMM yyyy HH:mm')}</td>
            <td className="p-2">{log.devices?.name || 'Unknown'}</td>
            <td className="p-2">{log.active_app}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
