// UserApplicationStatus.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SidebarLayout from './SidebarLayout';

const UserApplicationStatus = () => {
  const [instituteId, setInstituteId] = useState('');
  const [institutes, setInstitutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [appExistsFilter, setAppExistsFilter] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://admission.met.edu/api/admin/applications/institutes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setInstitutes(res.data.institutes);
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    };
    fetchInstitutes();
  }, []);

  const fetchUserStatus = async () => {
    if (!instituteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://admission.met.edu/api/admin/applications/users-application-status?instituteId=${instituteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  useEffect(() => {
    if (instituteId) fetchUserStatus();
  }, [instituteId]);

  const toggleSort = () => setSortAsc(prev => !prev);
  const clearFilters = () => {
    setStatusFilter('');
    setAppExistsFilter('');
    setSearchTerm('');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = [user.firstName, user.lastName, user.email, user.phoneNo, user.username].join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    const matchesAppExists = appExistsFilter ? (user.applicationExists ? 'Yes' : 'No') === appExistsFilter : true;
    return matchesSearch && matchesStatus && matchesAppExists;
  }).sort((a, b) => {
    if (!a.applicationNo || !b.applicationNo) return 0;
    return sortAsc ? a.applicationNo - b.applicationNo : b.applicationNo - a.applicationNo;
  });

  const total = filteredUsers.length;
  const submitted = filteredUsers.filter(u => u.status === 'submitted').length;
  const draft = filteredUsers.filter(u => u.status === 'draft').length;
  const final = filteredUsers.filter(u => u.status === 'final-submitted').length;
  const notCreated = filteredUsers.filter(u => u.status === 'Not Created').length;

  return (
    <SidebarLayout>
      <div className="p-6  mx-auto bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">User Application Status</h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <select
            className="border px-3 py-2 rounded w-full md:w-1/4"
            value={instituteId}
            onChange={(e) => setInstituteId(e.target.value)}
          >
            <option value="">-- Select Institute --</option>
            {institutes.map(inst => (
              <option key={inst._id} value={inst._id}>{inst.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search user..."
            className="border px-3 py-2 rounded w-full md:w-1/4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="border px-3 py-2 rounded w-full md:w-1/4"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="draft">Draft</option>
            <option value="final-submitted">Final Submitted</option>
            <option value="Not Created">Not Created</option>
          </select>

          <select
            className="border px-3 py-2 rounded w-full md:w-1/4"
            value={appExistsFilter}
            onChange={(e) => setAppExistsFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Yes">App Exists</option>
            <option value="No">No Application</option>
          </select>
        </div>

        <div className="mb-4  text-red-600 flex flex-wrap gap-4">
          <p>Total: <strong>{total}</strong></p>
          <p>Submitted: <strong>{submitted}</strong></p>
          <p>Draft: <strong>{draft}</strong></p>
          <p>Final: <strong>{final}</strong></p>
          <p>Not Created: <strong>{notCreated}</strong></p>
          <button className="ml-auto text-blue-600 underline" onClick={clearFilters}>Clear Filters</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">Username</th>
                <th className="border px-4 py-2 text-left cursor-pointer" onClick={toggleSort}>
                  App No {sortAsc ? '↑' : '↓'}
                </th>
                <th className="border px-4 py-2 text-left">App Exists</th>
                <th className="border px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.userId}>
                  <td className="border px-4 py-2">{user.firstName} {user.lastName}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.phoneNo}</td>
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">{user.applicationNo || '-'}</td>
                  <td className="border px-4 py-2">{user.applicationExists ? 'Yes' : 'No'}</td>
                  <td className="border px-4 py-2 capitalize">{user.status}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td className="p-4 text-center" colSpan={7}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default UserApplicationStatus;
