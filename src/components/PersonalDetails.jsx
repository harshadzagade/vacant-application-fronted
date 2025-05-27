import { useRef, useEffect, useState } from 'react';

const PersonalDetails = ({ formType, onUpdate, errors, userData }) => {
  const [formValues, setFormValues] = useState({
    studentName: '',
    dob: '',
    gender: '',
    mobileNo: '',
    fatherMobileNo: '',
    motherMobileNo: '',
    motherName: '',
    fatherName: '',
    email: '',
    allIndiaMeritNo: '',
    stateMeritNo: '',
    address: '',
  });

  // Initialize form values with userData
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    if (!userData) return; // Don't initialize if userData not available yet

    const initialValues = {
      studentName: `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim(),
      dob: '',
      gender: '',
      mobileNo: userData.phoneNo || '',
      fatherMobileNo: '',
      motherMobileNo: '',
      motherName: '',
      fatherName: '',
      email: userData.email || '',
      allIndiaMeritNo: '',
      stateMeritNo: '',
      address: '',
    };

    setFormValues(initialValues);
    onUpdateRef.current(initialValues);
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValues = { ...formValues, [name]: value };
    setFormValues(updatedValues);
    onUpdate(updatedValues);
  };

  const renderPersonalFields = () => {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">
          Personal Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Student Name *</label>
            <input
              type="text"
              name="studentName"
              value={formValues.studentName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled text-gray-500 bg-gray-100 ${
                errors.studentName ? 'border-red-500' : 'border-brand-200'
              }`}
              readOnly
            />
            {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">DOB *</label>
            <input
              type="date"
              name="dob"
              value={formValues.dob}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.dob ? 'border-red-500' : 'border-brand-200'
              }`}
            />
            {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Gender *</label>
            <select
              name="gender"
              value={formValues.gender}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.gender ? 'border-red-500' : 'border-brand-200'
              }`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Mobile No. *</label>
            <input
              type="tel"
              name="mobileNo"
              value={formValues.mobileNo}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled text-gray-500 bg-gray-100 ${
                errors.mobileNo ? 'border-red-500' : 'border-brand-200'
              }`}
              readOnly
            />
            {errors.mobileNo && <p className="text-red-500 text-xs mt-1">{errors.mobileNo}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Father's Mobile No. *</label>
            <input
              type="tel"
              name="fatherMobileNo"
              value={formValues.fatherMobileNo}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.fatherMobileNo ? 'border-red-500' : 'border-brand-200'
              }`}
            />
            {errors.fatherMobileNo && <p className="text-red-500 text-xs mt-1">{errors.fatherMobileNo}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Mother's Mobile No. *</label>
            <input
              type="tel"
              name="motherMobileNo"
              value={formValues.motherMobileNo}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.motherMobileNo ? 'border-red-500' : 'border-brand-200'
              }`}
            />
            {errors.motherMobileNo && <p className="text-red-500 text-xs mt-1">{errors.motherMobileNo}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Mother's Name</label>
            <input
              type="text"
              name="motherName"
              value={formValues.motherName}
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={formValues.fatherName}
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Email ID *</label>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled text-gray-500 bg-gray-100 ${
                errors.email ? 'border-red-500' : 'border-brand-200'
              }`}
              readOnly
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          {(formType === 'METIPP' || formType === 'METIPD' || formType === 'METIOM') && (
            <>
              <div>
                <label className="block text-brand-700 text-sm font-medium mb-2">All India Merit Number</label>
                <input
                  type="text"
                  name="allIndiaMeritNo"
                  value={formValues.allIndiaMeritNo}
                  onChange={handleChange}
                  className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
              <div>
                <label className="block text-brand-700 text-sm font-medium mb-2">State Merit Number</label>
                <input
                  type="text"
                  name="stateMeritNo"
                  value={formValues.stateMeritNo}
                  onChange={handleChange}
                  className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-6">
          <label className="block text-brand-700 text-sm font-medium mb-2">Address</label>
          <textarea
            name="address"
            value={formValues.address}
            onChange={handleChange}
            className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            rows="4"
          ></textarea>
        </div>
      </div>
    );
  };

  return <div className="mb-8">{renderPersonalFields()}</div>;
};

export default PersonalDetails;