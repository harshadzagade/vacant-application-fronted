import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const PersonalDetails = ({ formType, onUpdate, errors, userData, initialData, disabled }) => {
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
  const lastSyncedValues = useRef(null);

  useEffect(() => {
    const initialValues = {
      studentName: `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim(),
      dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
      gender: initialData.gender || '',
      mobileNo: userData.phoneNo || '',
      fatherMobileNo: initialData.fatherMobileNo || '',
      motherMobileNo: initialData.motherMobileNo || '',
      motherName: initialData.motherName || '',
      fatherName: initialData.fatherName || '',
      email: userData.email || '',
      allIndiaMeritNo: initialData.allIndiaMeritNo || '',
      stateMeritNo: initialData.stateMeritNo || '',
      address: initialData.address || '',
    };

    // Update formValues if different
    if (JSON.stringify(initialValues) !== JSON.stringify(formValues)) {
      setFormValues(initialValues);
    }

    // Always sync read-only fields from userData to ensure formData.personal is populated
    const readOnlyFields = {
      studentName: initialValues.studentName,
      mobileNo: initialValues.mobileNo,
      email: initialValues.email,
    };
    if (JSON.stringify(readOnlyFields) !== JSON.stringify({
      studentName: lastSyncedValues.current?.studentName,
      mobileNo: lastSyncedValues.current?.mobileNo,
      email: lastSyncedValues.current?.email,
    })) {
      onUpdate(initialValues);
      lastSyncedValues.current = initialValues;
    } else if (JSON.stringify(initialValues) !== JSON.stringify(lastSyncedValues.current)) {
      onUpdate(initialValues);
      lastSyncedValues.current = initialValues;
    }
  }, [userData, initialData, onUpdate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => {
      const updatedValues = { ...prev, [name]: value };
      // Sync with parent only if changes are significant
      if (JSON.stringify(updatedValues) !== JSON.stringify(lastSyncedValues.current)) {
        onUpdate(updatedValues);
        lastSyncedValues.current = updatedValues;
      }
      return updatedValues;
    });
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:text-gray-500 disabled:bg-gray-100 ${
                errors.studentName ? 'border-red-500' : 'border-brand-200'
              }`}
              readOnly
              disabled={true}
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
              disabled={disabled}
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
              disabled={disabled}
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:text-gray-500 disabled:bg-gray-100 ${
                errors.mobileNo ? 'border-red-500' : 'border-brand-200'
              }`}
              readOnly
              disabled={true}
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
              disabled={disabled}
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
              disabled={disabled}
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.motherName ? 'border-red-500' : 'border-brand-200'
              }`}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={formValues.fatherName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.fatherName ? 'border-red-500' : 'border-brand-200'
              }`}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Email ID *</label>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:text-gray-500 disabled:bg-gray-100 ${
                errors.email ? 'border-red-500' : 'border-brand-200'
              }`}
              readOnly
              disabled={true}
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
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                    errors.allIndiaMeritNo ? 'border-red-500' : 'border-brand-200'
                  }`}
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="block text-brand-700 text-sm font-medium mb-2">State Merit Number</label>
                <input
                  type="text"
                  name="stateMeritNo"
                  value={formValues.stateMeritNo}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                    errors.stateMeritNo ? 'border-red-500' : 'border-brand-200'
                  }`}
                  disabled={disabled}
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
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition ${
              errors.address ? 'border-red-500' : 'border-blue-200'
            }`}
            rows="4"
            disabled={disabled}
          ></textarea>
        </div>
      </div>
    );
  };

  return <div className="mb-8">{renderPersonalFields()}</div>;
};

PersonalDetails.propTypes = {
  formType: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  errors: PropTypes.object,
  userData: PropTypes.object,
  initialData: PropTypes.object,
  disabled: PropTypes.bool,
};

PersonalDetails.defaultProps = {
  errors: {},
  userData: {},
  initialData: {},
  disabled: false,
};

export default PersonalDetails;