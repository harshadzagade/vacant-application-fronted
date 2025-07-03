// SidebarLayout.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const SidebarLayout = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({ icon: 'error', title: 'Auth Required', text: 'Please log in.' });
        navigate('/admin/login');
        return;
      }

      try {
        const res = await axios.get('https://admission.met.edu/api/admin/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setProfile(res.data.staff);
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message });
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Swal.fire({ icon: 'success', title: 'Logged Out', timer: 1500, showConfirmButton: false });
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-blue-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="p-4 border-b border-blue-700">
          <p className="text-sm">Signed in as:</p>
          <p className="font-semibold">{profile?.firstName} {profile?.lastName}</p>
          <p className="text-xs italic">{profile?.institute?.instituteName}</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li><a href="/admin/" className="flex items-center p-2 rounded-lg hover:bg-blue-600 ">Applications</a></li>
            <li><a href="/admin/import-status" className="flex items-center p-2 rounded-lg hover:bg-blue-600">Import Status</a></li>
            <li><a href="/admin/user-status" className="flex items-center p-2 rounded-lg hover:bg-blue-600">User Application Status</a></li>
            <li><button onClick={handleLogout} className="flex items-center p-2 rounded-lg hover:bg-blue-600 w-full text-left">Logout</button></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex items-center justify-between print:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default SidebarLayout;
