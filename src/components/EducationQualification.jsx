import { useState } from 'react';

const EducationQualification = ({ formType, onUpdate }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const [graduationStatus, setGraduationStatus] = useState('');


  const renderEducationFields = () => {
    switch (formType) {
      case 'pharmacyDiploma':
      case 'pharmacyDegree':
        return (
          <div className="space-y-6">
            {['hsc'].map((level) => (
              <div key={level} className="border border-brand-100 p-6 rounded-xl bg-brand-50">
                <h3 className="text-lg font-medium mb-4 text-brand-800">{level.toUpperCase()}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Board/University</label>
                    <input
                      type="text"
                      name={`${level}Board`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">School/College</label>
                    <input
                      type="text"
                      name={`${level}School`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Stream</label>
                    <input
                      type="text"
                      name={`${level}Stream`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Marks Obtained</label>
                    <input
                      type="number"
                      name={`${level}Marks`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Aggregate %</label>
                    <input
                      type="number"
                      name={`${level}Percent`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Year</label>
                    <input
                      type="number"
                      name={`${level}Year`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  {/* PCM and PCB marks  */}
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">PCM Marks</label>
                    <input type="number" name="pcmMarks" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">PCB Marks</label>
                    <input type="number" name="pcbMarks" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
                  </div>
                  {formType === 'pharmacyDiploma' && (
                    <div>
                      <label className="block text-brand-700 text-sm font-medium mb-2">English Marks</label>
                      <input type="number" name="englishMarks" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'mca':
        return (
          <div className="space-y-6">
            {['ssc', 'hsc', 'graduation'].map((level) => (
              <div key={level} className="border border-brand-100 p-6 rounded-xl bg-brand-50">
                <h3 className="text-lg font-medium mb-4 text-brand-800">{level.toUpperCase()}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Board/University</label>
                    <input
                      type="text"
                      name={`${level}Board`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">School/College</label>
                    <input
                      type="text"
                      name={`${level}School`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Stream</label>
                    <input
                      type="text"
                      name={`${level}Stream`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Marks Obtained</label>
                    <input
                      type="number"
                      name={`${level}Marks`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Aggregate %</label>
                    <input
                      type="number"
                      name={`${level}Percent`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Year</label>
                    <input
                      type="number"
                      name={`${level}Year`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'iom':
        return (
          <div className="space-y-6">
            {['hsc', 'graduation'].map((level) => (
              <div key={level} className="border border-brand-100 p-6 rounded-xl bg-brand-50">
                <h3 className="text-lg font-medium mb-4 text-brand-800">{level.toUpperCase()}</h3>

                {/* Graduation Status Radio Buttons */}
                {level === 'graduation' && (
                  <div className="mb-4">
                    <span className="block text-brand-700 text-sm font-medium mb-2">Status</span>
                    <label className="mr-4">
                      <input
                        type="radio"
                        name="graduationStatus"
                        value="appeared"
                        checked={graduationStatus === 'appeared'}
                        onChange={(e) => setGraduationStatus(e.target.value)}
                        className="mr-2"
                      />
                      Appeared
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="graduationStatus"
                        value="appearing"
                        checked={graduationStatus === 'appearing'}
                        onChange={(e) => setGraduationStatus(e.target.value)}
                        className="mr-2"
                      />
                      Appearing
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Board/University</label>
                    <input
                      type="text"
                      name={`${level}Board`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">School/College</label>
                    <input
                      type="text"
                      name={`${level}School`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Stream</label>
                    <input
                      type="text"
                      name={`${level}Stream`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Marks Obtained</label>
                    <input
                      type="number"
                      name={`${level}Marks`}
                      onChange={handleChange}
                      disabled={level === 'graduation' && graduationStatus === 'appearing'}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Aggregate %</label>
                    <input
                      type="number"
                      name={`${level}Percent`}
                      onChange={handleChange}
                      disabled={level === 'graduation' && graduationStatus === 'appearing'}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Year</label>
                    <input
                      type="number"
                      name={`${level}Year`}
                      onChange={handleChange}
                      className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">Education Qualification</h2>
      {renderEducationFields()}
    </div>
  );
};

export default EducationQualification;