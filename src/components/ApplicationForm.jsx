import { useState } from 'react';
import PersonalDetails from './PersonalDetails';
import EntranceExam from './EntranceExam';
import EducationQualification from './EducationQualification';
import DocumentsUpload from './DocumentsUpload';

const ApplicationForm = () => {
  const [formType, setFormType] = useState('pharmacyDiploma');
  const [formData, setFormData] = useState({
    personal: {},
    entrance: {},
    education: {},
    documents: {}
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    // Basic validation
    if (!formData.personal.studentName) newErrors.studentName = 'Student name is required';
    if (!formData.personal.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.personal.email)) newErrors.email = 'Invalid email format';
    if (!formData.personal.mobileNo) newErrors.mobileNo = 'Mobile number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Add your API submission logic here
    }
  };

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl p-8">
      <div className="mb-8">
        <label className="block text-brand-900 text-lg font-semibold mb-2">
          Application Type
        </label>
        <select 
          className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          value={formType}
          onChange={(e) => setFormType(e.target.value)}
        >
          <option value="pharmacyDiploma">Pharmacy Diploma</option>
          <option value="pharmacyDegree">Pharmacy Degree</option>
          <option value="iom">IOM</option>
          <option value="mca">MCA</option>
        </select>
      </div>

      <PersonalDetails formType={formType} onUpdate={(data) => updateFormData('personal', data)} errors={errors} />
      <EntranceExam formType={formType} onUpdate={(data) => updateFormData('entrance', data)} />
      <EducationQualification formType={formType} onUpdate={(data) => updateFormData('education', data)} />
      <DocumentsUpload formType={formType} onUpdate={(data) => updateFormData('documents', data)} />

      <div className="mt-8">
        <button 
          type="submit"
          className="w-full bg-brand-500  hover:bg-brand-600 text-black font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
        >
          Submit Application
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;