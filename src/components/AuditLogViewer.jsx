import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://admission.met.edu/api/admin/applications/audit-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setLogs(res.data.logs || []);
        } else {
          throw new Error(res.data.message || 'Failed to load logs');
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (isLoading) return <div className="p-4">Loading audit logs...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Audit Logs</h2>
      <div className="overflow-auto max-h-[75vh]">
        <table className="min-w-full table-auto border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Action</th>
              <th className="border px-4 py-2 text-left">Application</th>
              <th className="border px-4 py-2 text-left">Performed By</th>
              <th className="border px-4 py-2 text-left">Changes</th>
              <th className="border px-4 py-2 text-left">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="border px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="border px-4 py-2">{log.actionType}</td>
                <td className="border px-4 py-2">{log.applicationId?.applicationNo || 'N/A'}</td>
                <td className="border px-4 py-2">
                  {log.performedBy
                    ? `${log.performedBy.firstName} ${log.performedBy.lastName} (${log.performedBy.role})`
                    : 'Unknown'}
                </td>
                <td className="border px-4 py-2">
                  {log.changes?.length ? (
                    <ul className="list-disc ml-4 text-sm">
                      {log.changes.map((chg, idx) => (
                        <li key={idx}>
                          {chg.field}: <span className="text-red-600">{String(chg.oldValue)}</span> → <span className="text-green-600">{String(chg.newValue)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="border px-4 py-2">{log.ipAddress || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogViewer;
