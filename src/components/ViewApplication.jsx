import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ViewApplication = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire({
            icon: 'error',
            title: 'Authentication Error',
            text: 'Please log in to continue',
          });
          navigate('/login');
          return;
        }

        // Fetch user data
        const userResponse = await fetch('http://localhost:5000/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userResult = await userResponse.json();
        if (!userResult.success) throw new Error(userResult.message || 'User data fetch failed');
        setUserData(userResult.user);

        // Fetch application details
        const appResponse = await fetch(`http://localhost:5000/api/application/details/${applicationId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!appResponse.ok) throw new Error('Failed to fetch application details');
        const appResult = await appResponse.json();
        if (!appResult.success) throw new Error(appResult.message || 'Application fetch failed');
        if (appResult.application.status !== 'final-submitted') {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Application',
            text: 'This application is not finalized.',
          });
          navigate('/application');
          return;
        }
        setApplicationData(appResult.application);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error: ${error.message}`,
        });
        navigate('/application');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [applicationId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const formTypeNames = {
    METIPP: 'Pharmacy Diploma',
    METIPD: 'Pharmacy Degree',
    METIOM: 'IOM',
    METICS: 'MCA',
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!applicationData || !userData) {
    return <div className="flex justify-center items-center h-screen">No data available</div>;
  }

  const fullName = `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim();
  const programName = formTypeNames[applicationData.formType] || 'Unknown Program';
  const { personal, entrance, education, documents } = applicationData;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-4xl mx-auto print:shadow-none print:p-4">
        <h1 className="text-3xl font-bold text-brand-900 mb-6 text-center border-b-2 border-brand-200 pb-4 print:text-2xl">
          Application Details
        </h1>

        {/* Personal Details */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-900 mb-4 border-b border-brand-200 pb-2">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-brand-700">Name:</span> {personal.studentName || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">DOB:</span> {personal.dob ? new Date(personal.dob).toLocaleDateString() : 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Gender:</span> {personal.gender || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Email:</span> {personal.email || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Mobile No:</span> {personal.mobileNo || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Father's Mobile:</span> {personal.fatherMobileNo || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Mother's Mobile:</span> {personal.motherMobileNo || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Father's Name:</span> {personal.fatherName || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Mother's Name:</span> {personal.motherName || 'N/A'}
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold text-brand-700">Address:</span> {personal.address || 'N/A'}
            </div>
            {(applicationData.formType === 'METIPP' || applicationData.formType === 'METIPD' || applicationData.formType === 'METIOM') && (
              <>
                <div>
                  <span className="font-semibold text-brand-700">All India Merit No:</span> {personal.allIndiaMeritNo || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-brand-700">State Merit No:</span> {personal.stateMeritNo || 'N/A'}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Entrance Exam Details */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-900 mb-4 border-b border-brand-200 pb-2">Entrance Exam Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applicationData.formType === 'METIPD' && (
              <>
                <div>
                  <span className="font-semibold text-brand-700">CET Application ID:</span> {entrance.cetApplicationId || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-brand-700">CET Score:</span> {entrance.cetScore || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-brand-700">CET Percentile:</span> {entrance.cetScorePercent || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-brand-700">CET-PCB Marks:</span> {entrance.cetPcbMarks || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-brand-700">CET-PCM Marks:</span> {entrance.cetPcmMarks || 'N/A'}
                </div>
              </>
            )}
            {applicationData.formType === 'METIOM' && (
              <>
                {['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'].map((exam) => (
                  (entrance[`${exam}ApplicationId`] || entrance[`${exam}Score`] || entrance[`${exam}ScorePercent`]) && (
                    <div key={exam} className="md:col-span-2">
                      <h3 className="font-semibold text-brand-700 uppercase">{exam} Details</h3>
                      <div className="ml-4">
                        <div>Application ID: {entrance[`${exam}ApplicationId`] || 'N/A'}</div>
                        <div>Score: {entrance[`${exam}Score`] || 'N/A'}</div>
                        <div>Percentile: {entrance[`${exam}ScorePercent`] || 'N/A'}</div>
                      </div>
                    </div>
                  )
                ))}
              </>
            )}
            {applicationData.formType === 'METICS' && (
              <>
                <div>
                  <span className="font-semibold text-brand-700">CET Application ID:</span> {entrance.cetApplicationId || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-brand-700">CET Score:</span> {entrance.cetScore || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-brand-700">Percentile:</span> {entrance.percentile || 'N/A'}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Education Details */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-900 mb-4 border-b border-brand-200 pb-2">Education Details</h2>
          {['ssc', 'hsc', 'graduation'].map((level) => (
            education[level] && (
              <div key={level} className="mb-4">
                <h3 className="font-semibold text-brand-700 capitalize">{level} Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                  <div>
                    <span className="font-semibold text-brand-700">Board:</span> {education[level].board || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-brand-700">Marks:</span> {education[level].marks || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-brand-700">Percentage:</span> {education[level].percent || 'N/A'}
                  </div>
                  {level === 'hsc' && applicationData.formType === 'METIPP' && (
                    <div>
                      <span className="font-semibold text-brand-700">English Marks:</span> {education[level].englishMarks || 'N/A'}
                    </div>
                  )}
                </div>
              </div>
            )
          ))}
        </section>

        {/* Documents */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-900 mb-4 border-b border-brand-200 pb-2">Documents Uploaded</h2>
          <ul className="list-disc ml-6">
            {Object.keys(documents).map((doc) => (
              documents[doc] && (
                <li key={doc} className="text-brand-900">
                  {doc.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}: Uploaded
                </li>
              )
            ))}
          </ul>
        </section>

        {/* Application Info */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-900 mb-4 border-b border-brand-200 pb-2">Application Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-brand-700">Program:</span> {programName}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Application ID:</span> {applicationId}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Institute Code:</span> {userData.institutes?.[0]?.code || 'N/A'}
            </div>
            <div>
              <span className="font-semibold text-brand-700">Status:</span> Final Submitted
            </div>
          </div>
        </section>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
          >
            Print Application
          </button>
          <button
            onClick={() => navigate('/application')}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
          >
            Back to Application
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print:shadow-none, .print:shadow-none * {
              visibility: visible;
            }
            .print:shadow-none {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print, .no-print * {
              display: none !important;
            }
            h1, h2, h3 {
              font-size: 1.5rem !important;
            }
            .border-b {
              border-bottom: 1px solid #000 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ViewApplication;