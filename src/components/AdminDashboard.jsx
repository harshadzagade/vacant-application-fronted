import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import SidebarLayout from './SidebarLayout';

const formTypeNames = {
  METIPP: 'Pharmacy Diploma',
  METIPD: 'Pharmacy Degree',
  METIOM: 'IOM',
  METICS: 'MCA',
};

const AdminDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDetails, setViewDetails] = useState(null);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [institutes, setInstitutes] = useState([]);

  const [allApplications, setAllApplications] = useState([]); // full list

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'applicationNo', direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);




  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({ icon: 'error', title: 'Auth Required', text: 'Please log in.' });
      navigate('/admin/login');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
      setIsLoading(true);
      try {
        const profRes = await axios.get('https://admission.met.edu/api/admin/auth/profile', { headers });
        if (profRes.data.success) setProfile(profRes.data.staff);
        else throw new Error(profRes.data.message || 'Failed to load profile');
        // console.log('Profile Response:', profRes.data.staff);


        const appsRes = await axios.get('https://admission.met.edu/api/admin/applications', { headers });
        // console.log('Applications Response:', appsRes.data.applications);
        if (appsRes.data.success) setApplications(appsRes.data.applications);
        else throw new Error(appsRes.data.message || 'Failed to load applications');


        const instRes = await axios.get('https://admission.met.edu/api/admin/applications/institutes', { headers });
        if (instRes.data.success) setInstitutes(instRes.data.institutes || []);
        else throw new Error(instRes.data.message || 'Failed to load institutes');

        if (appsRes.data.success) {
          setAllApplications(appsRes.data.applications);
          setApplications(appsRes.data.applications); // default view
        }



      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);


  const applyFilters = () => {
    let filtered = allApplications.filter(app => {
      const yearMatch = selectedYear
        ? new Date(app.applicationDate).getFullYear().toString() === selectedYear
        : true;

      const instMatch = selectedInstitute
        ? app.institute?.id === selectedInstitute
        : true;

      const searchMatch = searchTerm === '' || (
        app.applicationNo?.toString().includes(searchTerm) ||
        app.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.phoneNo?.includes(searchTerm)
      );

      return yearMatch && instMatch && searchMatch;
    });

    if (sortConfig?.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return sortConfig.direction === 'asc'
          ? (aValue || '').toString().localeCompare((bValue || '').toString())
          : (bValue || '').toString().localeCompare((aValue || '').toString());
      });
    }

    setApplications(filtered);
    setCurrentPage(1);
  };


  const toggleSort = (key) => {
    setSortConfig(prev => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };



  const openDetails = async (applicationId) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://admission.met.edu/api/admin/applications/details/${applicationId}`,
        { headers }
      );

      // console.log('Application Details Response:', res.data.application);


      if (res.data.success) setViewDetails(res.data.application);
      else throw new Error(res.data.message || 'Failed to load details');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const changeStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `https://admission.met.edu/api/admin/applications/status/${applicationId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setApplications(prev => prev.map(app => app.applicationId === applicationId ? { ...app, status: newStatus } : app));
        Swal.fire({ icon: 'success', title: 'Status Updated', text: `Status changed to ${newStatus}` });
      } else throw new Error(res.data.message || 'Failed to update status');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  const exportToExcel = () => {
    if (!selectedApps.length) {
      Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select applications.' });
      return;
    }

    const data = applications
      .filter(app => selectedApps.includes(app.applicationId))
      .map(app => {
        const entrance = app.entrance || {};
        const exams = ['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'];

        // Prepare entrance exam details
        // const entranceDetails = entrance.cetScore
        //   ? `CET: ${entrance.cetScore}, Percentile: ${entrance.cetScorePercent || entrance.percentile || 'N/A'}`
        //   : 'N/A';

        // Prepare structured entrance exam data
        const entranceExams = exams.map(exam => ({
          name: exam.toUpperCase(),
          score: entrance[`${exam}Score`] || 'N/A',
          percentile: exam === 'cet' ? (entrance.cetScorePercent || entrance.percentile || 'N/A') : (entrance[`${exam}ScorePercent`] || 'N/A'),
          applicationId: entrance[`${exam}ApplicationId`] || 'N/A',
        }));

        // Prepare flattened entrance exam fields for Excel
        const entranceFields = {};
        entranceExams.forEach(exam => {
          entranceFields[`${exam.name}_Score`] = exam.score;
          entranceFields[`${exam.name}_Percentile`] = exam.percentile;
          entranceFields[`${exam.name}_ApplicationId`] = exam.applicationId;
        });

        // Prepare education details
        const educationFields = {};
        if (app.education) {
          Object.entries(app.education).forEach(([key, value]) => {
            educationFields[`Education_${key.toUpperCase()}_Board`] = value.board || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_College`] = value.college || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_Stream`] = value.stream || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_Marks`] = value.marks || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_Percent`] = value.percent || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_Year`] = value.year || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_PCMMarks`] = value.pcmMarks || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_PCBMarks`] = value.pcbMarks || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_EnglishMarks`] = value.englishMarks || 'N/A';
            educationFields[`Education_${key.toUpperCase()}_Status`] = value.graduationStatus || 'N/A';
          });
        }

        // Prepare document details
        const documentFields = {};
        if (app.documents) {
          Object.entries(app.documents).forEach(([key, path]) => {
            documentFields[`Document_${key}`] = path || 'N/A';
          });
        }

        return {
          ApplicationNo: app.applicationNo,
          ApplicantName: app.user ? `${app.user.firstName} ${app.user.middleName || ''} ${app.user.lastName}`.trim() : 'N/A',
          Program: formTypeNames[app.formType] || 'Unknown',
          Status: app.status,
          Email: app.user?.email || 'N/A',
          Phone: app.user?.phoneNo || 'N/A',
          DOB: app.personal?.dob ? new Date(app.personal.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A',
          Gender: app.personal?.gender || 'N/A',
          FatherName: app.personal?.fatherName || 'N/A',
          FatherMobileNo: app.personal?.fatherMobileNo || 'N/A',
          MotherName: app.personal?.motherName || 'N/A',
          MotherMobileNo: app.personal?.motherMobileNo || 'N/A',
          Address: app.personal?.address || 'N/A',
          AllIndiaMeritNo: app.personal?.allIndiaMeritNo || 'N/A',
          StateMeritNo: app.personal?.stateMeritNo || 'N/A',
          ApplicationDate: app.applicationDate ? new Date(app.applicationDate).toLocaleDateString('en-US') : 'N/A',
          SubmissionDate: app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('en-US') : 'N/A',
          InstituteName: app.institute?.name || 'N/A',
          // EntranceDetails: entranceDetails,
          ...entranceFields,
          ...educationFields,
          ...documentFields,
        };
      });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    XLSX.writeFile(wb, 'selected_applications.xlsx');
  };

  const handleSelect = id => setSelectedApps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);


  const handleBulkActivate = async () => {
    if (!selectedApps.length) {
      Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select applications.' });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Confirm Activation',
      text: `Activate ${selectedApps.length} applications?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, activate',
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'https://admission.met.edu/api/admin/applications/bulk-active',
        { applicationIds: selectedApps },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        Swal.fire({ icon: 'success', title: 'Activated', text: 'Applications activated.' });
        setSelectedApps([]);
        // Optionally reload data
      } else throw new Error(res.data.message || 'Activation failed');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  const handleBulkInactivate = async () => {
    if (!selectedApps.length) {
      Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select applications.' });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Inactivation',
      text: `Inactivate ${selectedApps.length} applications?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, inactivate',
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'https://admission.met.edu/api/admin/applications/bulk-inactive',
        { applicationIds: selectedApps },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        Swal.fire({ icon: 'success', title: 'Inactivated', text: 'Applications inactivated.' });
        setSelectedApps([]);
      } else throw new Error(res.data.message || 'Inactivation failed');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  };

  const handlePrint = () => window.print();


  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
    </div>
  );


  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-100 flex">

        {/* Main */}
        <div className="flex-1 flex flex-col">


          <main className="p-6">
            {/* hide applications list on print */}
            <div className="print:hidden">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  {/* <h2 className="text-2xl font-semibold">Applications</h2> */}
                  <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Export Selected to Excel</button>
                  {/* <button onClick={deleteSelectedApplications} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete Selected
                  </button> */}
                  <button
                    onClick={handleBulkActivate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mark Selected Active
                  </button>

                  <button
                    onClick={handleBulkInactivate}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Mark Selected Inactive
                  </button>

                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      if (e.target.value === '') applyFilters(); // reapply on clear
                    }}
                    className="border px-3 py-2 rounded"
                  >
                    <option value="">All Years</option>
                    {[2025, 2024, 2023].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <select
                    value={selectedInstitute}
                    onChange={(e) => setSelectedInstitute(e.target.value)}
                    className="border px-3 py-2 rounded"
                  >
                    <option value="">All Institutes</option>
                    {institutes.map(inst => (
                      <option key={inst._id} value={inst._id}>{inst.name}</option>
                    ))}
                  </select>

                  <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Apply Filters
                  </button>

                  <input
                    type="text"
                    placeholder="Search name, email, phone or app no"
                    className="border px-3 py-2 rounded w-60"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      applyFilters(); // live filter on type
                    }}
                  />
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-400">
                      <th className="border p-3 py-2">
                        <input type="checkbox" onChange={e => e.target.checked ? setSelectedApps(applications.map(a => a.applicationId)) : setSelectedApps([])} />
                      </th>
                      <th
                        className="border p-3 py-2 text-left cursor-pointer select-none"
                        onClick={() => {
                          toggleSort('applicationNo');
                          applyFilters();
                        }}
                      >
                        Application No.
                        {sortConfig.key === 'applicationNo' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="border p-3 py-2 text-left">Applicant Name</th>
                      <th className="border p-3 py-2 text-left">Program</th>
                      <th className="border p-3 py-2 text-left">Status</th>
                      <th className="border p-3 py-2 text-left">Actions</th>
                      <th className="border p-3 py-2 text-left">Active Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map(app => (

                        <tr key={app.applicationId} className="hover:bg-gray-50">
                          <td className="border p-3 py-2"><input type="checkbox" checked={selectedApps.includes(app.applicationId)} onChange={() => handleSelect(app.applicationId)} /></td>
                          <td className="border p-3 py-2">{app.applicationNo}</td>
                          <td className="border p-3 py-2">
                            {app.user ? `${app.user.firstName} ${app.user.middleName || ''} ${app.user.lastName || ''}`.trim() : 'N/A'}
                          </td>
                          <td className="border p-3 py-2">{formTypeNames[app.formType] || 'Unknown'}</td>
                          <td className="border p-3 py-2"><select value={app.status} onChange={e => changeStatus(app.applicationId, e.target.value)} className="border rounded p-1"><option value={app.status}>{app.status}</option><option value="draft">Draft</option></select></td>
                          <td className="border p-3 py-2"><button onClick={() => openDetails(app.applicationId)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">View Details</button></td>
                          <td className="border p-3 py-2">
                            {(app.active == 1 || app.active === true) ? (
                              <span className="text-green-600 font-semibold">✅ Active</span>
                            ) : (
                              <span className="text-red-500 font-semibold">❌ Inactive</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="mt-4 flex flex-col items-center gap-2 print:hidden">
                  <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">Items per page:</label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border px-2 py-1 rounded text-sm"
                    >
                      {[5, 10, 20, 50, 100].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="px-3 py-1 bg-gray-300 text-black rounded disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>

                    {[...Array(Math.ceil(applications.length / itemsPerPage)).keys()].map((page) => (
                      <button
                        key={page + 1}
                        onClick={() => setCurrentPage(page + 1)}
                        className={`px-3 py-1 rounded ${currentPage === page + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                          }`}
                      >
                        {page + 1}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, Math.ceil(applications.length / itemsPerPage))
                        )
                      }
                      className="px-3 py-1 bg-gray-300 text-black rounded disabled:opacity-50"
                      disabled={currentPage === Math.ceil(applications.length / itemsPerPage)}
                    >
                      Next
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, applications.length)} to {Math.min(currentPage * itemsPerPage, applications.length)} of {applications.length} applications
                  </div>
                </div>
              </div>
            </div>

            {/* Application Details Modal */}
            {viewDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:inset-auto print:flex-col">
                {/* Print-only header */}
                <div className="hidden print:block border-b border-gray-300 pb-4 w-full text-center">
                  <div className="flex flex-col items-center justify-center mb-2 print:text-[#E31E24]">
                    <h1 className="text-2xl font-bold">{viewDetails?.institute?.name || 'MET Institute'}</h1>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Application Form for {viewDetails?.institute?.name || 'Institute'} Admission Against Vacant/Cancellation Seat</h2>
                  <p className="text-sm">Academic Year: 2025-2026</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto print:shadow-none print:p-4 print:rounded-none print:max-w-none print:max-h-none">
                  <div className="flex justify-between items-center mb-6 print:hidden">
                    <h3 className="text-2xl font-semibold text-gray-800">Application Details</h3>
                    <div className="flex gap-3">
                      <button onClick={handlePrint} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Print</button>
                      <button onClick={() => setViewDetails(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Close</button>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <section id="personal" className="mb-10 print:mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2 print:text-xl print:mb-2">
                      <svg className="w-6 h-6 text-blue-600 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Details
                    </h2>
                    <div className="border border-gray-200 p-6 rounded-xl bg-gradient-to-b from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow print:border-gray-300 print:p-2 print:rounded-none print:bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:gap-2">
                        <div>
                          <span className="font-semibold text-gray-700">Application No:</span> {viewDetails.applicationNo || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Name:</span> {`${viewDetails.user.firstName || ''} ${viewDetails.user.middleName || ''} ${viewDetails.user.lastName || ''}`.trim() || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">DOB:</span> {viewDetails.personal?.dob ? new Date(viewDetails.personal.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Gender:</span> {viewDetails.personal?.gender || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Email:</span> {viewDetails.user.email || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Mobile No:</span> {viewDetails.user.phoneNo || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Father's Mobile:</span> {viewDetails.personal?.fatherMobileNo || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Mother's Mobile:</span> {viewDetails.personal?.motherMobileNo || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Father's Name:</span> {viewDetails.personal?.fatherName || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Mother's Name:</span> {viewDetails.personal?.motherName || 'N/A'}
                        </div>
                        <div className="md:col-span-2 print:col-span-2">
                          <span className="font-semibold text-gray-700">Address:</span> {viewDetails.personal?.address || 'N/A'}
                        </div>
                        {(viewDetails.formType === 'METIPP' || viewDetails.formType === 'METIPD' || viewDetails.formType === 'METIOM') && (
                          <>
                            <div>
                              <span className="font-semibold text-gray-700">All India Merit No:</span> {viewDetails.personal?.allIndiaMeritNo || 'N/A'}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">State Merit No:</span> {viewDetails.personal?.stateMeritNo || 'N/A'}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Entrance Exam Details */}
                  <section id="entrance" className="mb-10 print:mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2 print:text-lg print:mb-2">
                      <svg className="w-6 h-6 text-blue-600 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Entrance Exam Details
                    </h2>
                    <div className="space-y-6 print:space-y-2">
                      {(() => {
                        const entrance = viewDetails.entrance || {};
                        const exams = ['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'];

                        return (
                          <>
                            <table className="hidden print:table w-full border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-gray-200">
                                  <th className="border border-gray-300 p-2"></th>
                                  {exams.map((exam) => (
                                    <th key={exam} className="border border-gray-300 p-2">
                                      {exam.toUpperCase()}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-300 p-1 text-sm"> Application ID</td>
                                  {exams.map((exam) => (
                                    <td key={exam} className="border border-gray-300 p-1 text-sm">
                                      {entrance[`${exam}ApplicationId`] || ''}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">Score</td>
                                  {exams.map((exam) => (
                                    <td key={exam} className="border border-gray-300 p-2">
                                      {entrance[`${exam}Score`] || ''}
                                    </td>
                                  ))}
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">Percentile</td>
                                  {exams.map((exam) => (
                                    <td key={exam} className="border border-gray-300 p-2">
                                      {entrance[`${exam}ScorePercent`] || (exam === 'cet' && entrance.percentile) || ''}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>

                            <div className="print:hidden">
                              <table className="w-full border-collapse border border-gray-200">
                                <thead>

                                  <tr className="bg-gray-100">
                                    <th className="border border-gray-200 p-4 text-left text-gray-800"> Application ID </th>
                                    {exams.map((exam) => (
                                      <th key={exam} className="border border-gray-200 p-4 text-left text-gray-800">
                                        {exam.toUpperCase()}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="border border-gray-200 p-4 font-semibold text-gray-700"> Application ID</td>
                                    {exams.map((exam) => (
                                      <td key={exam} className="border border-gray-200 p-4">
                                        {entrance[`${exam}ApplicationId`] || ''}
                                      </td>
                                    ))}
                                  </tr>
                                  <tr key="score" className="hover:bg-gray-50">
                                    <td className="border border-gray-200 p-4 font-semibold text-gray-700">Score</td>
                                    {exams.map((exam) => (
                                      <td key={exam} className="border border-gray-200 p-4">
                                        {entrance[`${exam}Score`] || 'N/A'}
                                      </td>
                                    ))}
                                  </tr>
                                  <tr key="percentile" className="hover:bg-gray-50">
                                    <td className="border border-gray-200 p-4 font-semibold text-gray-700">Percentile</td>
                                    {exams.map((exam) => (
                                      <td key={exam} className="border border-gray-200 p-4">
                                        {entrance[`${exam}ScorePercent`] || (exam === 'cet' && entrance.percentile) || 'N/A'}
                                      </td>
                                    ))}
                                  </tr>
                                </tbody>
                              </table>
                              {exams.every(
                                (exam) => !entrance[`${exam}Score`] && !entrance[`${exam}ScorePercent`] && !entrance.percentile
                              ) && !(viewDetails.formType === 'METIPD' || viewDetails.formType === 'METIPP') && (
                                  <div className="text-gray-600 p-4">No entrance exam details available</div>
                                )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </section>

                  {/* Education Details */}
                  <section id="education" className="mb-10 print:mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2 print:text-lg print:mb-2">
                      <svg className="w-6 h-6 text-blue-600 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01-1.946 5.611M12 14L5.84 10.578a12.083 12.083 0 01-1.946-5.611M12 14v7m-9-7v7m18-7v7" />
                      </svg>
                      Educational Qualification
                    </h2>
                    <div className="space-y-6 print:space-y-2">
                      {(() => {
                        const education = viewDetails.education || {};
                        let levels = [];
                        switch (viewDetails.formType) {
                          case 'METIPP':
                          case 'METIPD':
                            levels = ['hsc'];
                            break;
                          case 'METICS':
                            levels = ['ssc', 'hsc', 'graduation'];
                            break;
                          case 'METIOM':
                            levels = ['hsc', 'graduation'];
                            break;
                          default:
                            levels = [];
                        }

                        const hasEducationData = levels.some((level) => education[level]);
                        const fields = [
                          'Board/University',
                          'School/College',
                          'Stream',
                          'Marks Obtained',
                          'Aggregate %',
                          'Year',
                        ];
                        if (viewDetails.formType === 'METIPP' || viewDetails.formType === 'METIPD') {
                          fields.push('PCM Marks', 'PCB Marks');
                          if (viewDetails.formType === 'METIPP') {
                            fields.push('English Marks');
                          }
                        }
                        if (viewDetails.formType === 'METIOM') {
                          fields.push('Status');
                        }

                        return (
                          <>
                            <table className="hidden print:table w-full border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-gray-200">
                                  <th className="border border-gray-300 p-2">Sr. No.</th>
                                  <th className="border border-gray-300 p-2">Qualification</th>
                                  <th className="border border-gray-300 p-2">Marks</th>
                                  <th className="border border-gray-300 p-2">Aggregate %</th>
                                  <th className="border border-gray-300 p-2">Stream</th>
                                  <th className="border border-gray-300 p-2">Passing Year</th>
                                  <th className="border border-gray-300 p-2">Board/University</th>
                                  <th className="border border-gray-300 p-2">School/College</th>
                                </tr>
                              </thead>
                              <tbody>
                                {levels.map((level, index) => (
                                  education[level] && (
                                    <tr key={level}>
                                      <td className="border border-gray-300 p-2">{index + 1}.</td>
                                      <td className="border border-gray-300 p-2">{level.toUpperCase()}</td>
                                      <td className="border border-gray-300 p-2">{education[level].marks || 'N/A'}</td>
                                      <td className="border border-gray-300 p-2">{education[level].percent || 'N/A'}</td>
                                      <td className="border border-gray-300 p-2">{education[level].stream || 'N/A'}</td>
                                      <td className="border border-gray-300 p-2">{education[level].year || 'N/A'}</td>
                                      <td className="border border-gray-300 p-2">{education[level].board || 'N/A'}</td>
                                      <td className="border border-gray-300 p-2">{education[level].college || 'N/A'}</td>
                                    </tr>
                                  )
                                ))}
                              </tbody>
                            </table>

                            <div className="print:hidden">
                              {hasEducationData ? (
                                <table className="w-full border-collapse border border-gray-200">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border border-gray-200 p-4 text-left text-gray-800">Qualification</th>
                                      {fields.map((field) => (
                                        <th key={field} className="border border-gray-200 p-4 text-left text-gray-800">
                                          {field}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {levels.map((level) => (
                                      education[level] && (
                                        <tr key={level} className="hover:bg-gray-50">
                                          <td className="border border-gray-200 p-4 font-semibold text-gray-700">{level.toUpperCase()}</td>
                                          <td className="border border-gray-200 p-4">{education[level].board || 'N/A'}</td>
                                          <td className="border border-gray-200 p-4">{education[level].college || 'N/A'}</td>
                                          <td className="border border-gray-200 p-4">{education[level].stream || 'N/A'}</td>
                                          <td className="border border-gray-200 p-4">{education[level].marks || 'N/A'}</td>
                                          <td className="border border-gray-200 p-4">{education[level].percent || 'N/A'}</td>
                                          <td className="border border-gray-200 p-4">{education[level].year || 'N/A'}</td>
                                          {(viewDetails.formType === 'METIPP' || viewDetails.formType === 'METIPD') && (
                                            <>
                                              <td className="border border-gray-200 p-4">{education[level].pcmMarks || 'N/A'}</td>
                                              <td className="border border-gray-200 p-4">{education[level].pcbMarks || 'N/A'}</td>
                                            </>
                                          )}
                                          {viewDetails.formType === 'METIPP' && (
                                            <td className="border border-gray-200 p-4">{education[level].englishMarks || 'N/A'}</td>
                                          )}
                                          {viewDetails.formType === 'METIOM' && (
                                            <td className="border border-gray-200 p-4">
                                              {level === 'graduation' ? education[level].status || 'N/A' : '-'}
                                            </td>
                                          )}
                                        </tr>
                                      )
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="text-gray-600 p-4">No education details available</div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </section>

                  {/* Documents Uploaded */}
                  <section id="documents" className="mb-10 print:mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2 print:text-xl print:mb-2">
                      <svg className="w-6 h-6 text-blue-600 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documents Uploaded
                    </h2>
                    <div className="border border-gray-200 p-6 rounded-xl bg-gradient-to-b from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow print:border-gray-300 print:p-2 print:rounded-none print:bg-white flex flex-col">
                      {Object.keys(viewDetails.documents || {}).length > 0 ? (
                        <ul className="flex flex-wrap gap-4 print:gap-2">
                          {Object.entries(viewDetails.documents).map(([key, path]) => (
                            path && (
                              <li key={key} className="flex-1 md:flex-1/2 xl:flex-1/3 print:w-1/2">
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <div>
                                    <a href={`https://admission.met.edu/${path}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 print:no-underline print:text-black">
                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </a>
                                    {/* <span className="block text-sm text-gray-600 print:inline print:text-black">https://admission.met.edu/{path}</span> */}
                                  </div>
                                </div>
                              </li>
                            )
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-600 flex-1">No documents uploaded</div>
                      )}
                    </div>
                  </section>

                  {/* Declaration and Note */}
                  <section id="declaration" className="mb-10 print:mb-4">
                    <p className="text-gray-800 mb-4">
                      I, {`${viewDetails.user.firstName || ''} ${viewDetails.user.middleName || ''} ${viewDetails.user.lastName || ''}`.trim()}, declare that the information given above is true to the best of my knowledge & belief.
                    </p>
                    <p className="text-gray-800">
                      <strong>Date:</strong> {new Date(viewDetails.submissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-600 mt-6 print:mt-2">
                      Note: The applicant should have passed a minimum three-year duration Bachelor's Degree awarded by any of the Universities recognized by the University Grants Commission or Association of Indian Universities in any discipline with at least 50% marks in aggregate or equivalent.
                    </p>
                  </section>

                  {/* right side -   Signature */}
                  <section id="signature" className="mb-10 print:mb-4 flex flex-col items-end">
                    <p className="text-gray-800">
                      <strong>{viewDetails.user?.firstName + ' ' + viewDetails.user?.lastName || 'Signature'}</strong> {viewDetails.documents?.signaturePhoto ? (
                        <img
                          src={`https://admission.met.edu/${viewDetails.documents.signaturePhoto}`}
                          alt="Signature"
                          className="w-32 h-20 object-contain mt-2"
                          style={{ maxWidth: '100%' }}
                        />
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </section>

                  {Object.entries(viewDetails.documents).map(([key, path]) =>
                    path && (
                      <div
                        key={key}
                        className="hidden print:block mb-4"
                        style={{ breakBefore: 'page', pageBreakBefore: 'always' }}
                      >
                        <h3 className="text-lg font-semibold mb-2 text-center">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>

                        {path.endsWith('.pdf') ? (
                          <iframe
                            src={`https://admission.met.edu/${path}`}
                            className="w-full h-[1000px]"
                            title={key}
                          />
                        ) : (
                          <img
                            src={`https://admission.met.edu/${path}`}
                            alt={key}
                            className="mx-auto max-w-full h-auto"
                          />
                        )}
                      </div>
                    )
                  )}

                </div>

                {/* Print Styles */}
                <style>
                  {`
                    @media print {
                      body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white;
                        font-size: 10pt !important;
                        width: 100%;
                      }

                      @page {
                        size: auto;
                        margin: 0.6in 0.5in;
                      }

                      .min-h-screen, .print\\:min-h-0 {
                        min-height: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                      }

                      .print\\:shadow-none,
                      .shadow-sm,
                      .hover\\:shadow-md {
                        box-shadow: none !important;
                      }

                      .print\\:p-0,
                      .p-6,
                      .print\\:mx-0,
                      .mx-auto {
                        padding: 0 !important;
                        margin: 0 !important;
                      }

                      .print\\:max-w-none,
                      .max-w-4xl,
                      .max-w-[80%] {
                        max-width: 100% !important;
                        width: 100% !important;
                      }

                      .print\\:rounded-none,
                      .rounded,
                      .rounded-lg,
                      .rounded-2xl {
                        border-radius: 0 !important;
                      }

                      .print\\:bg-white,
                      .bg-white,
                      .bg-gradient-to-b {
                        background: white !important;
                      }

                      .print\\:hidden {
                        display: none !important;
                      }

                      .print\\:avoid-page-break {
                        break-inside: avoid;
                        page-break-inside: avoid;
                      }

                      .print\\:avoid-page-break-after {
                        break-after: avoid;
                        page-break-after: avoid;
                      }

                      .text-gray-800, .text-gray-700, .text-gray-600 {
                        color: #000 !important;
                      }

                      svg {
                        display: none !important;
                      }

                      h1 {
                        font-size: 16pt !important;
                      }

                      h2 {
                        font-size: 12pt !important;
                        margin-bottom: 0.25rem !important;
                      }

                      main {
                        margin: 0 !important;
                        padding: 0 !important;
                        break-before: avoid;
                        page-break-before: avoid;
                      }

                      section {
                        break-inside: avoid;
                        page-break-inside: avoid;
                        margin-top: 0.25rem !important;
                      }

                      div:has(> main) {
                        margin: 0 !important;
                        padding: 0 !important;
                        break-before: avoid;
                        page-break-before: avoid;
                      }
                    }
                `}
                </style>

              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;