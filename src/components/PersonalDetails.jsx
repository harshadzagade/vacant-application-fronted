const PersonalDetails = ({ formType, onUpdate, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const renderPersonalFields = () => {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">
          Personal Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Application Date</label>
            <input
              type="date"
              name="applicationDate"
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Application No.</label>
            <input
              type="text"
              name="applicationNo"
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Student Name *</label>
            <input
              type="text"
              name="studentName"
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.studentName ? 'border-red-500' : 'border-brand-200'
                }`}
            />
            {errors.studentName && <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">DOB</label>
            <input
              type="date"
              name="dob"
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Gender</label>
            <select
              name="gender"
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Mobile No.</label>
            <input
              type="tel"
              name="mobileNo"
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Father's Mobile No. *</label>
            <input
              type="tel"
              name="fatherMobileNo"
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.fatherMobileNo ? 'border-red-500' : 'border-brand-200'
                }`}
            />
            {errors.fatherMobileNo && <p className="text-red-500 text-xs mt-1">{errors.fatherMobileNo}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Mother's Mobile No. *</label>
            <input
              type="tel"
              name="motherMobileNo"
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.motherMobileNo ? 'border-red-500' : 'border-brand-200'
                }`}
            />
            {errors.motherMobileNo && <p className="text-red-500 text-xs mt-1">{errors.motherMobileNo}</p>}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Mother's Name</label>
            <input
              type="text"
              name="motherName"
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              onChange={handleChange}
              className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Email ID *</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.email ? 'border-red-500' : 'border-brand-200'
                }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Conditional Fields based on formType */}
          {(formType === 'pharmacyDiploma' || formType === 'pharmacyDegree' || formType === 'iom') && (
            <>
              <div>
                <label className="block text-brand-700 text-sm font-medium mb-2">All India Merit Number</label>
                <input
                  type="text"
                  name="allIndiaMeritNo"
                  onChange={handleChange}
                  className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
              <div>
                <label className="block text-brand-700 text-sm font-medium mb-2">State Merit Number</label>
                <input
                  type="text"
                  name="stateMeritNo"
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