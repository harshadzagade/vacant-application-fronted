import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PersonalDetails from './PersonalDetails';
import EntranceExam from './EntranceExam';
import EducationQualification from './EducationQualification';
import DocumentsUpload from './DocumentsUpload';

const ApplicationForm = () => {
  const [formType, setFormType] = useState('');
  const [applicationId, setApplicationId] = useState(null);
  const [formData, setFormData] = useState({
    personal: {},
    entrance: {},
    education: {},
    documents: {},
  });
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNo: '',
    institutes: [],
  });
  const [submissionStatus] = useState(null);
  const [isFinalSubmissionAttempt, setIsFinalSubmissionAttempt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();

  // Memoize formData sections to stabilize references
  const personalData = useMemo(() => formData.personal, [formData.personal]);
  const entranceData = useMemo(() => formData.entrance, [formData.entrance]);
  const educationData = useMemo(() => formData.education, [formData.education]);
  const documentsData = useMemo(() => formData.documents, [formData.documents]);

  const educationErrorsRef = useRef({});
  const entranceErrorsRef = useRef({});

  useEffect(() => {
    const fetchUserDataAndApplication = async () => {
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
        const userResponse = await fetch('https://admission.met.edu/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userResponse.ok) {
          const text = await userResponse.text();
          console.error('User fetch error:', {
            status: userResponse.status,
            url: userResponse.url,
            response: text.slice(0, 200),
          });
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }
        const userDataResponse = await userResponse.json();
        if (!userDataResponse.success) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: userDataResponse.message || 'Failed to fetch user data',
          });
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        const user = userDataResponse.user;
        setUserData(user);

        // Determine the current institute's formType
        const currentFormType = user.institutes?.length > 0 ? user.institutes[0].code : null;
        if (!currentFormType) {
          Swal.fire({
            icon: 'error',
            title: 'No Institute',
            text: 'No institute associated with this account',
          });
          navigate('/login');
          return;
        }
        setFormType(currentFormType);

        // Initialize personal data with user data
        setFormData((prev) => ({
          ...prev,
          personal: {
            ...prev.personal,
            studentName: `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
            mobileNo: user.phoneNo || '',
            email: user.email || '',
          },
        }));

        // Fetch existing applications
        const appResponse = await fetch('https://admission.met.edu/api/application', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!appResponse.ok) {
          const text = await appResponse.text();
          console.error('Applications fetch error:', {
            status: appResponse.status,
            url: appResponse.url,
            response: text.slice(0, 200),
          });
          throw new Error(`Failed to fetch applications: ${appResponse.status}`);
        }
        const appData = await appResponse.json();
        if (!appData.success) {
          throw new Error(appData.message || 'Failed to fetch applications');
        }

        // Find application matching the current formType
        const matchingApplication = appData.applications.find(
          (app) => app.formType === currentFormType
        );

        if (matchingApplication) {
          setApplicationId(matchingApplication.applicationId);
          // Fetch application details
          const detailsResponse = await fetch(
            `https://admission.met.edu/api/application/details/${matchingApplication.applicationId}`,
            {
              headers: { 'Authorization': `Bearer ${token}` },
            }
          );
          if (!detailsResponse.ok) {
            const text = await detailsResponse.text();
            console.error('Details fetch error:', {
              status: detailsResponse.status,
              url: detailsResponse.url,
              response: text.slice(0, 200),
            });
            throw new Error(`Failed to fetch application details: ${detailsResponse.status}`);
          }
          const detailsData = await detailsResponse.json();
          if (detailsData.success) {
            setFormData((prev) => ({
              personal: {
                ...prev.personal,
                ...detailsData.application.personal,
                studentName: `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
                mobileNo: user.phoneNo || '',
                email: user.email || '',
              },
              entrance: detailsData.application.entrance || {},
              education: detailsData.application.education || {},
              documents: detailsData.application.documents || {},
            }));
            setIsFinalSubmitted(detailsData.application.status === 'final-submitted');
          } else {
            throw new Error(detailsData.message || 'Failed to fetch application details');
          }
        } else {
          // No matching application found; reset form for new application
          setApplicationId(null);
          setIsFinalSubmitted(false);
          setFormData({
            personal: {
              studentName: `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
              mobileNo: user.phoneNo || '',
              email: user.email || '',
            },
            entrance: {},
            education: {},
            documents: {},
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error fetching data: ${error.message}`,
        });
        console.error('Fetch error:', error);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDataAndApplication();
  }, [navigate]);

  const validateForm = (isFinal = false) => {
    if (!formType) {
      setErrors({});
      return false;
    }

    const newErrors = {};
    const errorMessages = [];

    // Validate personal fields, using userData as fallback for read-only fields
    if (!formData.personal.studentName && !userData.firstName && !userData.lastName) {
      newErrors.studentName = 'Student name is required';
      errorMessages.push('Student Name');
    }
    if (!formData.personal.dob) {
      newErrors.dob = 'Date of birth is required';
      errorMessages.push('Date of Birth');
    }
    if (!formData.personal.gender) {
      newErrors.gender = 'Gender is required';
      errorMessages.push('Gender');
    }
    if (!formData.personal.mobileNo && !userData.phoneNo) {
      newErrors.mobileNo = 'Mobile number is required';
      errorMessages.push('Mobile Number');
    }
    if (!formData.personal.fatherMobileNo) {
      newErrors.fatherMobileNo = 'Father mobile number is required';
      errorMessages.push('Father Mobile Number');
    } else if (!/^\d{10}$/.test(formData.personal.fatherMobileNo)) {
      newErrors.fatherMobileNo = 'Father mobile number must be 10 digits';
      errorMessages.push('Father Mobile Number (must be 10 digits)');
    }
    if (!formData.personal.motherMobileNo) {
      newErrors.motherMobileNo = 'Mother mobile number is required';
      errorMessages.push('Mother Mobile Number');
    } else if (!/^\d{10}$/.test(formData.personal.motherMobileNo)) {
      newErrors.motherMobileNo = 'Mother mobile number must be 10 digits';
      errorMessages.push('Mother Mobile Number (must be 10 digits)');
    }
    if (!formData.personal.email && !userData.email) {
      newErrors.email = 'Email is required';
      errorMessages.push('Email');
    }

    // Validate signaturePhoto for all form types
    if (!formData.documents.signaturePhoto && !applicationId) {
      newErrors.signaturePhoto = 'Signature photo is required';
      errorMessages.push('Signature Photo');
    }

    // Validate fcReceipt only for final submission
    if (isFinal && ['METICS', 'METIPD', 'METIOM', 'METIPP'].includes(formType)) {
      if (!formData.documents.fcReceipt && !applicationId) {
        newErrors.fcReceipt = 'FC receipt is required for final submission';
        errorMessages.push('FC Receipt');
      }
    }

    if (formType === 'METIPP') {
      if (!formData.documents.hscMarksheet && !applicationId) {
        newErrors.hscMarksheet = 'HSC marksheet is required';
        errorMessages.push('HSC Marksheet');
      }
      if (!formData.education.hsc) {
        newErrors['hsc.board'] = 'HSC Board is required';
        newErrors['hsc.marks'] = 'HSC Total Marks is required';
        newErrors['hsc.percent'] = 'HSC Percentage is required';
        newErrors['hsc.englishMarks'] = 'HSC English Marks is required';
        errorMessages.push('HSC Board', 'HSC Total Marks', 'HSC Percentage', 'HSC English Marks');
      } else {
        if (!formData.education.hsc.board) {
          newErrors['hsc.board'] = 'HSC Board is required';
          errorMessages.push('HSC Board');
        }
        if (!formData.education.hsc.marks) {
          newErrors['hsc.marks'] = 'HSC Marks is required';
          errorMessages.push('HSC Marks');
        }
        if (!formData.education.hsc.percent) {
          newErrors['hsc.percent'] = 'HSC Percentage is required';
          errorMessages.push('HSC Percentage');
        }
        if (!formData.education.hsc.englishMarks) {
          newErrors['hsc.englishMarks'] = 'HSC English Marks is required';
          errorMessages.push('HSC English Marks');
        }
      }
    }

    if (formType === 'METIPD') {
      if (!formData.documents.hscMarksheet && !applicationId) {
        newErrors.hscMarksheet = 'HSC marksheet is required';
        errorMessages.push('HSC Marksheet');
      }
      // if (!formData.documents.cetScoreCard && !applicationId) {
      //   newErrors.cetScoreCard = 'CET score card is required';
      //   errorMessages.push('CET Score Card');
      // }
      if (!formData.education.hsc) {
        newErrors['hsc.board'] = 'HSC Board is required';
        newErrors['hsc.college'] = 'College Name is required';
        newErrors['hsc.stream'] = 'Stream is required';
        newErrors['hsc.marks'] = 'HSC Total Marks are required';
        newErrors['hsc.percent'] = 'HSC Percentage is required';
        errorMessages.push('HSC Board', 'HSC Total Marks', 'HSC Percentage');
      } else {
        if (!formData.education.hsc.board) {
          newErrors['hsc.board'] = 'HSC Board is required';
          errorMessages.push('HSC Board');
        }
        if (!formData.education.hsc.marks) {
          newErrors['hsc.marks'] = 'HSC Total Marks is required';
          errorMessages.push('HSC Total Marks');
        }
        if (!formData.education.hsc.percent) {
          newErrors['hsc.percent'] = 'HSC Percentage is required';
          errorMessages.push('HSC Percentage');
        }
      }
      if (!formData.entrance.cetApplicationId) {
        newErrors.cetApplicationId = 'CET Application ID is required';
        errorMessages.push('CET Application ID');
      }
      // if (!formData.entrance.cetScore) {
      //   newErrors.cetScore = 'CET Score is required';
      //   errorMessages.push('CET Score');
      // } else if (formData.entrance.cetScore < 0 || formData.entrance.cetScore > 200) {
      //   newErrors.cetScore = 'CET Score cannot be negative';
      //   errorMessages.push('CET Score (cannot be negative)');
      // }
      if (!formData.entrance.cetScorePercent) {
        newErrors.cetScorePercent = 'CET Percentile is required';
        errorMessages.push('CET Percentile');
      } else if (formData.entrance.cetScorePercent < 0 || formData.entrance.cetScorePercent > 100) {
        newErrors.cetScorePercent = 'CET Percentile must be between 0 and 100';
        errorMessages.push('CET Percentile (must be between 0 and 100)');
      }
    }

    if (formType === 'METIOM') {
      // if (!formData.documents.cetScoreCard && !applicationId) {
      //   newErrors.cetScoreCard = 'CET score card is required';
      //   errorMessages.push('CET Score Card');
      // }
      if (!formData.education.hsc) {
        newErrors['hsc.board'] = 'HSC Board is required';
        newErrors['hsc.college'] = 'College Name is required';
        newErrors['hsc.stream'] = 'Stream is required';
        newErrors['hsc.marks'] = 'HSC Total Marks is required';
        newErrors['hsc.percent'] = 'HSC Percentage is required';
        errorMessages.push('HSC Board', 'HSC Total Marks', 'HSC Percentage');
      } else {
        if (!formData.education.hsc.board) {
          newErrors['hsc.board'] = 'HSC Board is required';
          errorMessages.push('HSC Board');
        }
        if (!formData.education.hsc.college) {
          newErrors['hsc.college'] = 'HSC College Name is required';
          errorMessages.push('HSC College Name');
        }
        if (!formData.education.hsc.stream) {
          newErrors['hsc.stream'] = 'HSC Stream is required';
          errorMessages.push('HSC Stream');
        }
        if (!formData.education.hsc.marks) {
          newErrors['hsc.marks'] = 'HSC Total Marks is required';
          errorMessages.push('HSC Total Marks');
        }
        if (!formData.education.hsc.percent) {
          newErrors['hsc.percent'] = 'HSC Percentage is required';
          errorMessages.push('HSC Percentage');
        }
      }
      if (!formData.education.graduation) {
        newErrors['graduation.board'] = 'Graduation Board is required';
        errorMessages.push('Graduation Board');
      } else if (!formData.education.graduation.board) {
        newErrors['graduation.board'] = 'Graduation Board is required';
        errorMessages.push('Graduation Board');
      }
      const exams = ['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'];
      const hasExamData = exams.some(
        (exam) =>
          formData.entrance[`${exam}ApplicationId`] &&
          // formData.entrance[`${exam}Score`] &&
          formData.entrance[`${exam}ScorePercent`]
      );
      if (!hasExamData) {
        newErrors.selectedExam = 'At least one entrance exam with complete details is required';
        errorMessages.push('At least one Entrance Exam (Application ID, Score, Percentile)');
      }
      exams.forEach((exam) => {
        if (
          formData.entrance[`${exam}ApplicationId`] ||
          // formData.entrance[`${exam}Score`] ||
          formData.entrance[`${exam}ScorePercent`]
        ) {
          if (!formData.entrance[`${exam}ApplicationId`]) {
            newErrors[`${exam}ApplicationId`] = `${exam.toUpperCase()} Application ID is required`;
            errorMessages.push(`${exam.toUpperCase()} Application ID`);
          }
          // if (!formData.entrance[`${exam}Score`]) {
          //   newErrors[`${exam}Score`] = `${exam.toUpperCase()} Score is required`;
          //   errorMessages.push(`${exam.toUpperCase()} Score`);
          // } else if (formData.entrance[`${exam}Score`] < 0 || formData.entrance[`${exam}Score`] > 200) {
          //   newErrors[`${exam}Score`] = `${exam.toUpperCase()} Score cannot be negative`;
          //   errorMessages.push(`${exam.toUpperCase()} Score (cannot be negative)`);
          // }
          if (!formData.entrance[`${exam}ScorePercent`]) {
            newErrors[`${exam}ScorePercent`] = `${exam.toUpperCase()} Percentile is required`;
            errorMessages.push(`${exam.toUpperCase()} Percentile`);
          } else if (formData.entrance[`${exam}ScorePercent`] < 0 || formData.entrance[`${exam}ScorePercent`] > 100) {
            newErrors[`${exam}ScorePercent`] = `${exam.toUpperCase()} Percentile must be between 0 and 100`;
            errorMessages.push(`${exam.toUpperCase()} Percentile (must be between 0 and 100)`);
          }
        }
      });
    }

    if (formType === 'METICS') {
      if (!formData.documents.cetScoreCard && !applicationId) {
        newErrors.cetScoreCard = 'CET score card is required';
        errorMessages.push('CET Score Card');
      }
      ['graduation'].forEach((level) => {
        if (!formData.education[level]) {
          newErrors[`${level}.board`] = `${level.toUpperCase()} Board is required`;
          newErrors[`${level}.college`] = `${level.toUpperCase()} College Name is required`;
          newErrors[`${level}.stream`] = `${level.toUpperCase()} Stream is required`;
          newErrors[`${level}.marks`] = `${level.toUpperCase()} Total Marks is required`;
          newErrors[`${level}.percent`] = `${level.toUpperCase()} Percentage is required`;
          errorMessages.push(`${level.toUpperCase()} Board`, `${level.toUpperCase()} Total Marks`, `${level.toUpperCase()} Percentage`);
        } else {
          if (!formData.education[level].board) {
            newErrors[`${level}.board`] = `${level.toUpperCase()} Board is required`;
            errorMessages.push(`${level.toUpperCase()} Board`);
          }
          if (!formData.education[level].college) {
            newErrors[`${level}.college`] = `${level.toUpperCase()} College Name is required`;
            errorMessages.push(`${level.toUpperCase()} College Name`);
          }
          if (!formData.education[level].stream) {
            newErrors[`${level}.stream`] = `${level.toUpperCase()} Stream is required`;
            errorMessages.push(`${level.toUpperCase()} Stream`);
          }
        }
      });
      if (!formData.entrance.cetApplicationId) {
        newErrors.cetApplicationId = 'CET Application ID is required';
        errorMessages.push('CET Application ID');
      }
      // if (!formData.entrance.cetScore) {
      //   newErrors.cetScore = 'CET Score is required';
      //   errorMessages.push('CET Score');
      // } else if (formData.entrance.cetScore < 0 || formData.entrance.cetScore > 200) {
      //   newErrors.cetScore = 'CET Score cannot be negative';
      //   errorMessages.push('CET Score (cannot be negative)');
      // }
      if (!formData.entrance.percentile) {
        newErrors.percentile = 'Percentile is required';
        errorMessages.push('Percentile');
      } else if (formData.entrance.percentile < 0 || formData.entrance.percentile > 100) {
        newErrors.percentile = 'Percentile must be between 0 and 100';
        errorMessages.push('Percentile (must be between 0 and 100)');
      }
    }

    if (educationErrorsRef.current && typeof educationErrorsRef.current === 'object') {
      Object.keys(educationErrorsRef.current).forEach((key) => {
        if (educationErrorsRef.current[key]) {
          errorMessages.push(key.replace('.', ' ').replace(/([A-Z])/g, ' $1'));
        }
      });
    }

    if (entranceErrorsRef.current && typeof entranceErrorsRef.current === 'object') {
      Object.keys(entranceErrorsRef.current).forEach((key) => {
        if (entranceErrorsRef.current[key]) {
          errorMessages.push(key.replace('.', ' ').replace(/([A-Z])/g, ' $1').replace(/\b\w/g, (l) => l.toUpperCase()));
        }
      });
    }

    const internalEduErrors = educationErrorsRef.current || {};
    const internalEntErrors = entranceErrorsRef.current || {};
    const mergedErrors = { ...newErrors, ...internalEduErrors, ...internalEntErrors };

    setErrors(mergedErrors);
    if (errorMessages.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: `Please verify or correct the following required fields: ${errorMessages.join(', ')}`,
      });
    }
    return Object.keys(mergedErrors).every((key) => !mergedErrors[key]);
  };

  const handleSubmit = async (e, isFinal = false) => {
    e.preventDefault();

    setIsFinalSubmissionAttempt(isFinal);  // Set flag for final submission attempt

    // 🔒 Trigger browser-based validation
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }

    if (!formType) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Form type is not set.' });
      return;
    }
    if (!validateForm(isFinal)) return;
    if (isFinal && !termsAgreed) {
      Swal.fire({ icon: 'warning', title: 'Terms Agreement', text: 'You must agree to the terms.' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('formType', formType);
    formDataToSend.append('personal', JSON.stringify(formData.personal));

    // Normalize entrance data
    const normalizedEntrance = Object.keys(formData.entrance).reduce((acc, key) => {
      if (key.includes('ScorePercent') || key === 'percentile') {
        acc[key] = formData.entrance[key] !== '' ? Number(parseFloat(formData.entrance[key]).toFixed(2)) : '';
      } else {
        acc[key] = formData.entrance[key];
      }
      return acc;
    }, {});
    formDataToSend.append('entrance', JSON.stringify(normalizedEntrance));
    formDataToSend.append('education', JSON.stringify(formData.education));
    Object.entries(formData.documents).forEach(([key, value]) => {
      if (value && typeof value !== 'string') formDataToSend.append(key, value);
    });
    formDataToSend.append('isFinalSubmitted', isFinal);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({ icon: 'error', title: 'Authentication Error', text: 'Please log in.' });
        navigate('/login');
        return;
      }

      const url = applicationId ? `https://admission.met.edu/api/application/update/${applicationId}` : 'https://admission.met.edu/api/application/submit';
      const method = applicationId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to ${applicationId ? 'update' : 'submit'} application: ${text}`);
      }
      const data = await response.json();

      if (data.success) {
        const newApplicationId = data.application?.applicationId || data.applicationId || data.id;
        if (!newApplicationId && !applicationId) {
          const appResponse = await fetch('https://admission.met.edu/api/application', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!appResponse.ok) {
            throw new Error('Failed to fetch applications after submission');
          }
          const appData = await appResponse.json();
          if (appData.success && appData.applications.length > 0) {
            const latestApplication = appData.applications[0];
            setApplicationId(latestApplication.applicationId);
            Swal.fire({
              icon: 'success',
              title: isFinal ? 'Final Submission Successful' : 'Application Submitted',
              text: isFinal
                ? 'Your application has been successfully submitted.'
                : `Application submitted successfully`,
            });
            if (isFinal) {
              navigate(`/submission-confirmation/${latestApplication.applicationId}`);
            }
          } else {
            throw new Error('No applications found after submission');
          }
        } else {
          if (!applicationId) setApplicationId(newApplicationId);
          setIsFinalSubmitted(isFinal);
          Swal.fire({
            icon: 'success',
            title: isFinal ? 'Final Submission Successful' : applicationId ? 'Application Updated' : 'Application Submitted',
          });
          if (isFinal) {
            navigate(`/submission-confirmation/${newApplicationId}`);
          }
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Failed to process application' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: `Error: ${error.message}` });
      console.error('Submission error:', error || error.message);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: 'Confirm Final Submission',
      text: 'Once you confirm final submission, you will no longer be able to edit or make further changes to your application. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      if (!termsAgreed) {
        setErrors((prev) => ({ ...prev, terms: 'Please agree to the terms' }));
        Swal.fire({
          icon: 'error',
          title: 'Please agree to the terms',
          text: 'You must agree to the terms before submitting the application.',
        });
      } else {
        handleSubmit(e, true);
      }
    }
  };

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

  const updateFormData = useCallback((section, dataOrEvent) => {
    const data = dataOrEvent?.values || dataOrEvent;

    if (!data || typeof data !== 'object') return;

    setFormData((prev) => {
      if (section === 'education') {
        const updatedEducationData = {};
        Object.keys(data).forEach((level) => {
          updatedEducationData[level] = {
            ...(prev[section]?.[level] || {}),
            ...data[level],
          };
        });

        return {
          ...prev,
          [section]: {
            ...prev[section],
            ...updatedEducationData,
          },
        };
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          ...data,
        },
      };
    });
  }, []);

  const formTypeNames = {
    METIPP: 'Pharmacy Diploma',
    METIPD: 'Pharmacy Degree',
    METIOM: 'IOM',
    METICS: 'MCA',
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-brand-900 border-b border-brand-200 pb-2">
          Application Form - {formTypeNames[formType] || 'Loading...'}
        </h2>
        <div className="flex gap-2">
          {isFinalSubmitted && (
            <button
              onClick={() => navigate(`/view-application/${applicationId}`)}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition shadow-md hover:shadow-lg"
            >
              View Application
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
      {submissionStatus && (
        <div
          className={`mb-6 p-4 rounded-lg ${submissionStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {submissionStatus.message}
        </div>
      )}
      {isLoading ? (
        <div>Loading application form...</div>
      ) : formType ? (
        <form ref={formRef} onSubmit={isFinalSubmitted ? null : handleSubmit} noValidate>
          <PersonalDetails
            formType={formType}
            onUpdate={(data) => updateFormData('personal', data)}
            errors={errors}
            userData={userData}
            initialData={personalData}
            disabled={isFinalSubmitted}
          />
          <EntranceExam
            formType={formType}
            onUpdate={(data) => {
              updateFormData('entrance', data.values);
              entranceErrorsRef.current = data.errors; // ✅ capture internal errors
            }}
            errors={errors}
            initialData={entranceData}
            disabled={isFinalSubmitted}
          />
          <EducationQualification
            formType={formType}
            onUpdate={(data) => {
              updateFormData('education', data.values);
              educationErrorsRef.current = data.errors; // ✅ capture internal errors
            }}
            errors={errors}
            initialData={educationData}
            disabled={isFinalSubmitted}
          />
          <DocumentsUpload
            formType={formType}
            onUpdate={(data) => updateFormData('documents', data)}
            errors={errors}
            initialData={documentsData}
            disabled={isFinalSubmitted}
            isFinalSubmission={isFinalSubmissionAttempt}
            applicationId={applicationId}
          />
          {!isFinalSubmitted && (
            <div className="mt-8 flex justify-between">
              {applicationId && (
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-brand-200 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-brand-700">
                    I agree that the information I filled is correct and complete.
                  </label>
                </div>
              )}
              <div className="flex space-x-4">
                {applicationId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      if (!termsAgreed) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Please agree to the terms',
                          text: 'You must agree to the terms before submitting the application.',
                        });
                      } else {
                        handleFinalSubmit(e); // ✅ Pass the event
                      }
                    }}
                    className="p-3 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
                    disabled={!termsAgreed}
                  >
                    Final Submit
                  </button>
                )}
                <button
                  type="submit"
                  className="p-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
                  disabled={isFinalSubmitted}
                >
                  {applicationId ? 'Update Application' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
          {isFinalSubmitted && (
            <div className="mt-8 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
              This application has been finally submitted and cannot be edited.
            </div>
          )}
        </form>
      ) : (
        <div>No application form available</div>
      )}
    </div>
  );
};

export default ApplicationForm;