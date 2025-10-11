import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminActivity() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', role: '', from: '', to: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      Object.keys(params).forEach((k) => (params[k] === '' || params[k] == null) && delete params[k]);
      const { data } = await api.get('/admins/activities', { params });
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, limit]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Activity Logs</h2>

      <form
        className="grid md:grid-cols-5 gap-3 mb-3"
        onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}
      >
        <input
          className="border rounded px-3 py-2"
          placeholder="Search action or path"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="border rounded px-3 py-2"
          value={filters.role}
          onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
        >
          <option value="">All roles</option>
          <option value="Student">Student</option>
          <option value="Alumni">Alumni</option>
          <option value="Admin">Admin</option>
        </select>
        <input type="date" className="border rounded px-3 py-2"
          value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
        <input type="date" className="border rounded px-3 py-2"
          value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
        <button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit">Filter</button>
      </form>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Time</th>
              <th className="text-left px-3 py-2">User</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Action</th>
              <th className="text-left px-3 py-2">Path</th>
              <th className="text-left px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  {r.user?.fullName || r.user?.email || '-'}
                </td>
                <td className="px-3 py-2">{r.role || '-'}</td>
                <td className="px-3 py-2">{r.action}</td>
                <td className="px-3 py-2">{r.path}</td>
                <td className="px-3 py-2">{r.ip || '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={6}>No activities</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
          <span className="text-sm">Page {page} / {pages}</span>
          <button className="px-2 py-1 border rounded" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Next</button>
          <select className="px-2 py-1 border rounded" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}