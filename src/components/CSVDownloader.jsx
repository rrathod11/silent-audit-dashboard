// src/components/CSVDownloader.jsx
import { FiDownload } from 'react-icons/fi';

export default function CSVDownloader({ data, filename = 'logs.csv' }) {
  const handleDownload = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
    >
      <FiDownload /> Download CSV
    </button>
  );
}
