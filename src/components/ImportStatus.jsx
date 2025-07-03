import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SidebarLayout from './SidebarLayout';

const ImportStatus = () => {
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState('');
    const [file, setFile] = useState(null);
    const [reportUrl, setReportUrl] = useState('');
    const [reportData, setReportData] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInstitutes = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('https://admission.met.edu/api/admin/applications/institutes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) setInstitutes(res.data.institutes);
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Failed to load institutes', text: err.message });
            }
        };
        fetchInstitutes();
    }, []);

    const parseCSV = (csvText) => {
        const rows = csvText.trim().split('\n').map(line => line.split(',').map(cell => cell.replace(/^"|"$/g, '')));
        const headers = rows[0];
        const data = rows.slice(1).map(row =>
            headers.reduce((obj, key, i) => {
                obj[key] = row[i];
                return obj;
            }, {})
        );
        return data;
    };

    const handleSubmit = async () => {
        if (!selectedInstitute || !file) {
            Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Select institute and upload a file.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `https://admission.met.edu/api/import/check-import-status?instituteId=${selectedInstitute}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                const reportPath = `https://admission.met.edu/${res.data.reportFile}`;
                setReportUrl(reportPath);

                const csvRes = await axios.get(reportPath);
                const parsed = parseCSV(csvRes.data);
                setReportData(parsed);

                Swal.fire({ icon: 'success', title: 'Import Check Complete', text: 'Report is ready.' });
            } else throw new Error(res.data.message);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Upload Error', text: err.message });
        }
    };

    const filteredData = reportData.filter(row => {
        const matchStatus = filterStatus === ''
            || row['User Exists'] === filterStatus
            || row['Application Exists'] === filterStatus;

        const matchSearch = searchTerm === ''
            || Object.values(row).some(val => val?.toLowerCase?.().includes(searchTerm.toLowerCase()));

        return matchStatus && matchSearch;
    });

    return (
        <SidebarLayout>
            <div className="p-6  mx-auto bg-white rounded shadow">
                <h2 className="text-2xl font-semibold mb-4">Check Import Status</h2>

                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div>
                        <label className="block font-medium mb-1">Select Institute</label>
                        <select
                            className="w-full border px-3 py-2 rounded"
                            value={selectedInstitute}
                            onChange={(e) => setSelectedInstitute(e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            {institutes.map((inst) => (
                                <option key={inst._id} value={inst._id}>{inst.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Upload Excel File</label>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="block w-full"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                        >
                            Check Status
                        </button>
                    </div>
                </div>

                {reportUrl && (
                    <div className="mb-6">
                        <a
                            href={reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline"
                        >
                            Download CSV Report
                        </a>
                    </div>
                )}

                {reportData.length > 0 && (
                    <>
                        <div className="flex flex-wrap gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Search by name/email/phone"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border px-3 py-2 rounded w-full md:w-64"
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border px-3 py-2 rounded w-full md:w-48"
                            >
                                <option value="">All Status</option>
                                <option value="Yes">Exists</option>
                                <option value="No">Not Exists</option>
                            </select>
                        </div>

                        <div className="overflow-auto max-h-[500px] border rounded">
                            <table className="min-w-full text-sm border-collapse">
                                <thead className="bg-gray-200 sticky top-0">
                                    <tr>
                                        {Object.keys(reportData[0]).map(header => (
                                            <th key={header} className="border px-3 py-2 text-left">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            {Object.values(row).map((cell, i) => (
                                                <td key={i} className="border px-3 py-1">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </SidebarLayout>
    );
};

export default ImportStatus;
