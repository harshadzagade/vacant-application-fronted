import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalDetails from './PersonalDetails';
import EntranceExam from './EntranceExam';
import EducationQualification from './EducationQualification';
import DocumentsUpload from './DocumentsUpload';

const ApplicationForm = () => {
  const [formType, setFormType] = useState('');
  const [formData, setFormData] = useState({
    personal: {},
    entrance: {},
    education: {},
    documents: {},
  });
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNo: '',
    institutes: [],
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found in localStorage');
          setSubmissionStatus({ success: false, message: 'Please log in to continue' });
          navigate('/login');
          return;
        }
        console.log('Fetching user data from /api/auth/user with token:', token);
        const response = await fetch('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        if (data.success) {
          setUserData(data.user);
          if (data.user.institutes?.length > 0) {
            console.log('Setting formType to:', data.user.institutes[0].code);
            setFormType(data.user.institutes[0].code);
          } else {
            console.log('No institutes found in user data');
            setSubmissionStatus({ success: false, message: 'No institute associated with this account' });
            navigate('/login');
          }
        } else {
          console.log('Failed to fetch user data:', data.message);
          setSubmissionStatus({ success: false, message: 'Failed to fetch user data' });
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSubmissionStatus({ success: false, message: 'Error fetching user data' });
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Personal Details Validation
    if (!formData.personal.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.personal.gender) newErrors.gender = 'Gender is required';
    if (!formData.personal.fatherMobileNo) newErrors.fatherMobileNo = 'Father mobile number is required';
    else if (!/^\d{10}$/.test(formData.personal.fatherMobileNo))
      newErrors.fatherMobileNo = 'Father mobile number must be 10 digits';
    if (!formData.personal.motherMobileNo) newErrors.motherMobileNo = 'Mother mobile number is required';
    else if (!/^\d{10}$/.test(formData.personal.motherMobileNo))
      newErrors.motherMobileNo = 'Mother mobile number must be 10 digits';

    // Documents Validation
    if (!formData.documents.signaturePhoto) newErrors.signaturePhoto = 'Signature photo is required';

    // Form Type Specific Validation
    if (formType === 'METIPP') {
      if (!formData.documents.hscMarksheet) newErrors.hscMarksheet = 'HSC marksheet is required';
      if (!formData.documents.fcVerification) newErrors.fcVerification = 'FC verification is required';
      if (
        !formData.education.hsc ||
        !formData.education.hsc.board ||
        !formData.education.hsc.marks ||
        !formData.education.hsc.percent ||
        !formData.education.hsc.englishMarks
      ) {
        newErrors.education = 'Complete HSC details (board, marks, percentage, English marks) are required';
      }
    }

    if (formType === 'METIPD') {
      if (!formData.documents.hscMarksheet) newErrors.hscMarksheet = 'HSC marksheet is required';
      if (!formData.documents.cetScoreCard) newErrors.cetScoreCard = 'CET score card is required';
      if (!formData.documents.fcVerificationAck) newErrors.fcVerificationAck = 'FC verification acknowledgment is required';
      if (
        !formData.education.hsc ||
        !formData.education.hsc.board ||
        !formData.education.hsc.marks ||
        !formData.education.hsc.percent
      ) {
        newErrors.education = 'Complete HSC details (board, marks, percentage) are required';
      }
      if (!formData.entrance.cetApplicationId) newErrors.cetApplicationId = 'CET Application ID is required';
      if (!formData.entrance.cetScore) newErrors.cetScore = 'CET Score is required';
      else if (formData.entrance.cetScore < 0) newErrors.cetScore = 'CET Score cannot be negative';
      if (!formData.entrance.cetScorePercent) newErrors.cetScorePercent = 'CET Percentile is required';
      else if (formData.entrance.cetScorePercent < 0 || formData.entrance.cetScorePercent > 100)
        newErrors.cetScorePercent = 'CET Percentile must be between 0 and 100';
      if (!formData.entrance.cetPcbMarks) newErrors.cetPcbMarks = 'CET-PCB Marks are required';
      else if (formData.entrance.cetPcbMarks < 0) newErrors.cetPcbMarks = 'CET-PCB Marks cannot be negative';
      if (!formData.entrance.cetPcmMarks) newErrors.cetPcmMarks = 'CET-PCM Marks are required';
      else if (formData.entrance.cetPcmMarks < 0) newErrors.cetPcmMarks = 'CET-PCM Marks cannot be negative';
    }

    if (formType === 'METIOM') {
      if (!formData.documents.cetScoreCard) newErrors.cetScoreCard = 'CET score card is required';
      if (!formData.documents.fcReceipt) newErrors.fcReceipt = 'FC receipt is required';
      if (
        !formData.education.hsc ||
        !formData.education.hsc.board ||
        !formData.education.hsc.marks ||
        !formData.education.hsc.percent ||
        !formData.education.graduation ||
        !formData.education.graduation.board
      ) {
        newErrors.education = 'Complete HSC and graduation details (board, marks, percentage) are required';
      }
      const exams = ['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'];
      const hasExamData = exams.some(
        (exam) =>
          formData.entrance[`${exam}ApplicationId`] &&
          formData.entrance[`${exam}Score`] &&
          formData.entrance[`${exam}ScorePercent`]
      );
      if (!hasExamData) newErrors.selectedExam = 'At least one entrance exam with complete details is required';
      exams.forEach((exam) => {
        if (formData.entrance[`${exam}ApplicationId`]) {
          if (!formData.entrance[`${exam}Score`]) newErrors[`${exam}Score`] = `${exam.toUpperCase()} Score is required`;
          else if (formData.entrance[`${exam}Score`] < 0)
            newErrors[`${exam}Score`] = `${exam.toUpperCase()} Score cannot be negative`;
          if (!formData.entrance[`${exam}ScorePercent`])
            newErrors[`${exam}ScorePercent`] = `${exam.toUpperCase()} Percentile is required`;
          else if (formData.entrance[`${exam}ScorePercent`] < 0 || formData.entrance[`${exam}ScorePercent`] > 100)
            newErrors[`${exam}ScorePercent`] = `${exam.toUpperCase()} Percentile must be between 0 and 100`;
        }
      });
    }

    if (formType === 'METICS') {
      if (!formData.documents.cetScoreCard) newErrors.cetScoreCard = 'CET score card is required';
      if (
        !formData.education.ssc ||
        !formData.education.ssc.board ||
        !formData.education.ssc.marks ||
        !formData.education.ssc.percent ||
        !formData.education.hsc ||
        !formData.education.hsc.board ||
        !formData.education.hsc.marks ||
        !formData.education.hsc.percent ||
        !formData.education.graduation ||
        !formData.education.graduation.board
      ) {
        newErrors.education = 'Complete SSC, HSC, and graduation details (board, marks, percentage) are required';
      }
      if (!formData.entrance.cetApplicationId) newErrors.cetApplicationId = 'CET Application ID is required';
      if (!formData.entrance.cetScore) newErrors.cetScore = 'CET Score is required';
      else if (formData.entrance.cetScore < 0) newErrors.cetScore = 'CET Score cannot be negative';
      if (!formData.entrance.percentile) newErrors.percentile = 'Percentile is required';
      else if (formData.entrance.percentile < 0 || formData.entrance.percentile > 100)
        newErrors.percentile = 'Percentile must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSubmissionStatus({ success: false, message: 'Please fill all required fields' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('formType', formType);
    formDataToSend.append('personal', JSON.stringify(formData.personal));
    formDataToSend.append('entrance', JSON.stringify(formData.entrance || {}));
    formDataToSend.append('education', JSON.stringify(formData.education));
    Object.keys(formData.documents).forEach((key) => {
      if (formData.documents[key]) {
        formDataToSend.append(key, formData.documents[key]);
      }
    });

    console.log('Submitting FormData:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for submission');
        setSubmissionStatus({ success: false, message: 'Please log in to continue' });
        navigate('/login');
        return;
      }
      console.log('Submitting to /api/application/submit with token:', token);
      const response = await fetch('/api/application/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });
      console.log('Submission response status:', response.status);
      const data = await response.json();
      console.log('Submission response data:', data);
      if (data.success) {
        setSubmissionStatus({
          success: true,
          message: `Application submitted successfully! Application No: ${data.applicationNo}`,
        });
        setFormData({ personal: {}, entrance: {}, education: {}, documents: {} });
      } else {
        setSubmissionStatus({ success: false, message: data.message });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus({ success: false, message: 'Error submitting application' });
    }
  };

  const handleLogout = () => {
    console.log('Logging out, clearing localStorage');
    localStorage.clear();
    navigate('/login');
  };

  const updateFormData = useCallback((section, data) => {
    console.log(`Updating ${section}:`, data);
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
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
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition shadow-md hover:shadow-lg"
        >
          Logout
        </button>
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
        <form onSubmit={handleSubmit}>
          <PersonalDetails
            formType={formType}
            onUpdate={(data) => updateFormData('personal', data)}
            errors={errors}
            userData={userData}
          />
          <EntranceExam
            formType={formType}
            onUpdate={(data) => updateFormData('entrance', data)}
            errors={errors}
          />
          <EducationQualification
            formType={formType}
            onUpdate={(data) => updateFormData('education', data)}
            errors={errors}
          />
          <DocumentsUpload
            formType={formType}
            onUpdate={(data) => updateFormData('documents', data)}
            errors={errors}
          />
          <div className="mt-8">
            <button
              type="submit"
              className="w-full mt-6 p-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
            >
              Submit Application
            </button>
          </div>
        </form>
      ) : (
        <div>No application form available</div>
      )}
    </div>
  );
};

export default ApplicationForm;