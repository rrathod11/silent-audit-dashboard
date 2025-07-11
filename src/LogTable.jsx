import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { format } from 'date-fns'

export default function LogTable() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('logs')
        .select('id, timestamp, active_app, device_id, devices(name)')
        .order('timestamp', { ascending: false })
        .limit(100)
      setLogs(data)
    }
    load()
  }, [])

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
            <td className="p-2">{log.devices.name}</td>
            <td className="p-2">{log.active_app}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
