import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SubmissionConfirmation = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have successfully logged out.',
      timer: 1500,
      showConfirmButton: false,
    });
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!applicationId) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Application ID',
          text: 'No application ID provided.',
        });
        navigate('/application');
        return;
      }
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire({
            icon: 'error',
            title: 'Authentication Error',
            text: 'Please log in to continue',
          });
          navigate('/application');
          return;
        }

        // Fetch user data
        const userResponse = await fetch('https://vacantseats.met.edu/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userResult = await userResponse.json();
        if (!userResult.success) throw new Error(userResult.message || 'User data fetch failed');
        setUserData(userResult.user);

        // Fetch application details
        const appResponse = await fetch(`https://vacantseats.met.edu/api/application/details/${applicationId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!appResponse.ok) throw new Error('Failed to fetch application details');
        const appResult = await appResponse.json();
        if (!appResult.success) throw new Error(appResult.message || 'Application fetch failed');
        if (!appResult.application || appResult.application.status !== 'final-submitted') {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Application',
            text: 'Application is not finalized or does not exist.',
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
  const instituteCode = userData.institutes?.[0]?.code || 'N/A';
  const username = userData.institutes?.[0]?.username || 'N/A';
  const applicationNo = applicationData.applicationNo || 'N/A';
  console.log('applicationData:', applicationData);
  console.log('userData:', userData);
  
  const programName = formTypeNames[applicationData.formType] || 'Unknown Program';

  return (
    <div className=" flex items-center justify-center ">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-brand-900 border-b border-brand-200 pb-2">
            Application Submission Confirmation
          </h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
        <h1 className="text-3xl font-bold text-brand-900 mb-6 text-center border-b-2 border-brand-200 pb-4">
          Application Submitted Successfully!
        </h1>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="font-semibold text-brand-700 w-40">Applicant Name:</span>
            <span className="text-brand-900">{fullName}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-brand-700 w-40">Username:</span>
            <span className="text-brand-900">{username || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-brand-700 w-40">Program Applied:</span>
            <span className="text-brand-900">{programName}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-brand-700 w-40">Institute Code:</span>
            <span className="text-brand-900">{instituteCode}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-brand-700 w-40">Application ID:</span>
            <span className="text-brand-900">{applicationNo}</span>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate(`/view-application/${applicationId}`)}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
          >
            View Your Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionConfirmation;