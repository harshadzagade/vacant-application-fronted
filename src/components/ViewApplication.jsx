import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ViewApplication = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire({
            icon: 'error',
            title: 'Authentication Error',
            text: 'Please log in to continue.',
            confirmButtonText: 'Go to Login',
          }).then(() => navigate('/login'));
          return;
        }

        const userResponse = await fetch('https://vacantseats.met.edu/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userResult = await userResponse.json();
        if (!userResult.success) throw new Error(userResult.message || 'User data fetch failed');
        setUserData(userResult.user);

        const appResponse = await fetch(`https://vacantseats.met.edu/api/application/details/${applicationId}`, {
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
            confirmButtonText: 'Go to Application',
          }).then(() => navigate('/application'));
          return;
        }
        setApplicationData(appResult.application);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error: ${error.message}`,
          showCancelButton: true,
          confirmButtonText: 'Retry',
          cancelButtonText: 'Go to Application',
        }).then((result) => {
          if (result.isConfirmed) fetchData();
          else navigate('/application');
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [applicationId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have successfully logged out.',
      timer: 1500,
      showConfirmButton: false,
    });
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // const formTypeNames = {
  //   METIPP: 'Pharmacy Diploma',
  //   METIPD: 'Pharmacy Degree',
  //   METIOM: 'IOM',
  //   METICS: 'MCA',
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!applicationData || !userData) {
    return <div className="flex justify-center items-center h-screen text-gray-600">No data available</div>;
  }

  const applicationNo = applicationData.applicationNo || 'N/A';
  const fullName = `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim();
  const email = userData.email || 'N/A';
  const phoneNo = userData.phoneNo || 'N/A';
  // const programName = formTypeNames[applicationData.formType] || 'Unknown Program';
  const { personal, documents } = applicationData;
  const submissionDate = new Date(applicationData.submissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col print:min-h-0 print:bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="lg:hidden mr-4 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Application Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block">{fullName}</span>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
            >
              Print
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6 print:p-0 print:max-w-none print:mx-0">
        {/* Main Content */}
        <main className="flex-1 print:break-inside-avoid">
          <div className="bg-white rounded-2xl shadow-lg p-8 print:shadow-none print:p-4 print:rounded-none print:break-inside-avoid">
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
                    <span className="font-semibold text-gray-700">Application No:</span> {applicationNo || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span> {fullName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">DOB:</span> {personal.dob ? new Date(personal.dob).toLocaleDateString('en-US') : 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Gender:</span> {personal.gender || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span> {email}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Mobile No:</span> {phoneNo}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Father's Mobile:</span> {personal.fatherMobileNo || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Mother's Mobile:</span> {personal.motherMobileNo || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Father's Name:</span> {personal.fatherName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Mother's Name:</span> {personal.motherName || 'N/A'}
                  </div>
                  <div className="md:col-span-2 print:col-span-2">
                    <span className="font-semibold text-gray-700">Address:</span> {personal.address || 'N/A'}
                  </div>
                  {(applicationData.formType === 'METIPP' || applicationData.formType === 'METIPD' || applicationData.formType === 'METIOM') && (
                    <>
                      <div>
                        <span className="font-semibold text-gray-700">All India Merit No:</span> {personal.allIndiaMeritNo || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">State Merit No:</span> {personal.stateMeritNo || 'N/A'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Entrance Exam Details */}
            {applicationData.formType !== 'METIPP' && (
              <section id="entrance" className="mb-10 print:mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2 print:text-lg print:mb-2">
                  <svg className="w-6 h-6 text-blue-600 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Entrance Exam Details
                </h2>
                <div className="space-y-6 print:space-y-2">
                  {(() => {
                    const entrance = applicationData.entrance || {};
                    const exams = ['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'];

                    return (
                      <>
                        {/* Print View - Table Format */}
                        {applicationData.formType !== 'METIPP' && (
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
                        )}

                        {/* On-Screen View - Table Format */}
                        <div className="print:hidden">
                          <table className="w-full border-collapse border border-gray-200">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-200 p-4 text-left text-gray-800"></th>
                                {exams.map((exam) => (
                                  <th key={exam} className="border border-gray-200 p-4 text-left text-gray-800">
                                    {exam.toUpperCase()}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-gray-50">
                                <td className="border border-gray-200 p-4 font-semibold text-gray-700">Score</td>
                                {exams.map((exam) => (
                                  <td key={exam} className="border border-gray-200 p-4">
                                    {entrance[`${exam}Score`] || 'N/A'}
                                  </td>
                                ))}
                              </tr>
                              <tr className="hover:bg-gray-50">
                                <td className="border border-gray-200 p-4 font-semibold text-gray-700">Percentile</td>
                                {exams.map((exam) => (
                                  <td key={exam} className="border border-gray-200 p-4">
                                    {entrance[`${exam}ScorePercent`] || (exam === 'cet' && entrance.percentile) || 'N/A'}
                                  </td>
                                ))}
                              </tr>
                              {(applicationData.formType === 'METIPD') && (
                                <>
                                  <tr className="hover:bg-gray-50">
                                    <td className="border border-gray-200 p-4 font-semibold text-gray-700">CET-PCB Marks</td>
                                    <td className="border border-gray-200 p-4">{entrance.cetPcbMarks || 'N/A'}</td>
                                    {exams.slice(1).map((exam) => (
                                      <td key={exam} className="border border-gray-200 p-4">-</td>
                                    ))}
                                  </tr>
                                  <tr className="hover:bg-gray-50">
                                    <td className="border border-gray-200 p-4 font-semibold text-gray-700">CET-PCM Marks</td>
                                    <td className="border border-gray-200 p-4">{entrance.cetPcmMarks || 'N/A'}</td>
                                    {exams.slice(1).map((exam) => (
                                      <td key={exam} className="border border-gray-200 p-4">-</td>
                                    ))}
                                  </tr>
                                </>
                              )}
                            </tbody>
                          </table>
                          {exams.every(
                            (exam) => !entrance[`${exam}Score`] && !entrance[`${exam}ScorePercent`] && !entrance.percentile
                          ) && !(applicationData.formType === 'METIPD' || applicationData.formType === 'METIPP') && (
                              <div className="text-gray-600 p-4">No entrance exam details available</div>
                            )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </section>
            )}

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
                  const education = applicationData.education || {};
                  let levels = [];
                  switch (applicationData.formType) {
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
                  if (applicationData.formType === 'METIPP' || applicationData.formType === 'METIPD') {
                    fields.push('PCM Marks', 'PCB Marks');
                    if (applicationData.formType === 'METIPP') {
                      fields.push('English Marks');
                    }
                  }
                  if (applicationData.formType === 'METIOM') {
                    fields.push('Status');
                  }

                  return (
                    <>
                      {/* Print View - Table Format */}
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
                                <td className="border border-gray-300 p-2">{education[level].school || 'N/A'}</td>
                              </tr>
                            )
                          ))}
                        </tbody>
                      </table>

                      {/* On-Screen View - Transposed Table Format */}
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
                                    <td className="border border-gray-200 p-4">{education[level].school || 'N/A'}</td>
                                    <td className="border border-gray-200 p-4">{education[level].stream || 'N/A'}</td>
                                    <td className="border border-gray-200 p-4">{education[level].marks || 'N/A'}</td>
                                    <td className="border border-gray-200 p-4">{education[level].percent || 'N/A'}</td>
                                    <td className="border border-gray-200 p-4">{education[level].year || 'N/A'}</td>
                                    {(applicationData.formType === 'METIPP' || applicationData.formType === 'METIPD') && (
                                      <>
                                        <td className="border border-gray-200 p-4">{education[level].pcmMarks || 'N/A'}</td>
                                        <td className="border border-gray-200 p-4">{education[level].pcbMarks || 'N/A'}</td>
                                      </>
                                    )}
                                    {applicationData.formType === 'METIPP' && (
                                      <td className="border border-gray-200 p-4">{education[level].englishMarks || 'N/A'}</td>
                                    )}
                                    {applicationData.formType === 'METIOM' && (
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

            {/* Documents */}
            <section id="documents" className="mb-10 print:mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-2 print:text-xl print:mb-2">
                <svg className="w-6 h-6 text-blue-600 print:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents Uploaded
              </h2>
              <div className="border border-gray-200 p-6 rounded-xl bg-gradient-to-b from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow print:border-gray-300 print:p-2 print:rounded-none print:bg-white">
                {Object.keys(documents).length > 0 ? (
                  <ul className="grid grid-cols-2 gap-4 print:gap-2">
                    {Object.keys(documents).map((doc) => (
                      documents[doc] && (
                        <li key={doc} className="text-gray-800 flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {doc.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        </li>
                      )
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-600">No documents uploaded</div>
                )}
              </div>
            </section>

            {/* Declaration and Note */}
            <section id="declaration" className="mb-10 print:mb-4">
              <p className="text-gray-800 mb-4">
                I, {fullName}, declare that the information given above is true to the best of my knowledge & belief.
              </p>
              <p className="text-gray-800">
                <strong>Date:</strong> {submissionDate || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 mt-6 print:mt-2">
                Note: The applicant should have passed a minimum three-year duration Bachelor's Degree awarded by any of the Universities recognized by the University Grants Commission or Association of Indian Universities in any discipline with at least 50% marks in aggregate or equivalent.
              </p>
            </section>

            {/* right side -   Signature */}
            <section id="signature" className="mb-10 print:mb-4 flex flex-col items-end">
              <p className="text-gray-800">
                <strong> {fullName} </strong> {applicationData.documents.signaturePhoto ? (
                  <img
                    src={`https://vacantseats.met.edu/${applicationData.documents.signaturePhoto}`}
                    alt="Signature"
                    className="w-32 h-20 object-contain mt-2"
                    style={{ maxWidth: '100%' }}
                  />
                ) : (
                  'N/A'
                )}
              </p>
            </section>
          </div>

          {/* Back to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors print:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </main>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body {
              background: white;
              margin: 0;
            }
            .min-h-screen {
              min-height: auto;
              padding: 0;
            }
            .print\\:min-h-0 {
              min-height: 0 !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:p-0 {
              padding: 0 !important;
            }
            .print\\:max-w-none {
              max-width: none !important;
            }
            .print\\:mx-0 {
              margin-left: 0 !important;
              margin-right: 0 !important;
            }
            .print\\:rounded-none {
              border-radius: 0 !important;
            }
            .print\\:bg-white {
              background: white !important;
            }

            .print\\:hidden {
              display: none !important;
            }
            h1 {
              font-size: 1.5rem !important;
            }
            h2 {
              font-size: 1.25rem !important;
              margin-bottom: 0.5rem !important;
            }
            .border-gray-200 {
              border: 1px solid #ccc !important;
            }
            .shadow-sm, .hover\\:shadow-md {
              box-shadow: none !important;
            }
            .rounded-2xl {
              border-radius: 0 !important;
            }
            .bg-gradient-to-b {
              background: #fff !important;
            }
            .grid {
              gap: 0.25rem !important;
            }
            .space-y-6 > * + * {
              margin-top: 0.5rem !important;
            }
            .text-gray-800, .text-gray-700, .text-gray-600 {
              color: #000 !important;
            }
            svg {
              display: none !important;
            }
            @page {
              size: auto;
              margin: 0.2in;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ViewApplication;