import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const EducationQualification = ({ formType, onUpdate, errors, initialData, disabled }) => {
  const [graduationStatus, setGraduationStatus] = useState('');
  const [formValues, setFormValues] = useState({
    ssc: { board: '', school: '', stream: '', marks: '', percent: '', year: '' },
    hsc: { board: '', school: '', stream: '', marks: '', percent: '', year: '', pcmMarks: '', pcbMarks: '', englishMarks: '' },
    graduation: { board: '', school: '', stream: '', marks: '', percent: '', year: '' },
  });
  const lastSyncedValues = useRef(null);

  useEffect(() => {
    if (!initialData) return;

    const newFormValues = {
      ssc: {
        board: initialData.ssc?.board || '',
        school: initialData.ssc?.school || '',
        stream: initialData.ssc?.stream || '',
        marks: initialData.ssc?.marks || '',
        percent: initialData.ssc?.percent || '',
        year: initialData.ssc?.year || '',
      },
      hsc: {
        board: initialData.hsc?.board || '',
        school: initialData.hsc?.school || '',
        stream: initialData.hsc?.stream || '',
        marks: initialData.hsc?.marks || '',
        percent: initialData.hsc?.percent || '',
        year: initialData.hsc?.year || '',
        pcmMarks: initialData.hsc?.pcmMarks || '',
        pcbMarks: initialData.hsc?.pcbMarks || '',
        englishMarks: initialData.hsc?.englishMarks || '',
      },
      graduation: {
        graduationStatus: initialData.graduation?.graduationStatus || '',
        board: initialData.graduation?.board || '',
        school: initialData.graduation?.school || '',
        stream: initialData.graduation?.stream || '',
        marks: initialData.graduation?.marks || '',
        percent: initialData.graduation?.percent || '',
        year: initialData.graduation?.year || '',
      },
    };

    const newGraduationStatus = initialData.graduation?.marks || initialData.graduation?.percent ? 'appeared' : 'appearing';

    if (JSON.stringify(newFormValues) !== JSON.stringify(formValues)) {
      setFormValues(newFormValues);
    }
    if (newGraduationStatus !== graduationStatus) {
      setGraduationStatus(newGraduationStatus);
    }

    if (JSON.stringify(newFormValues) !== JSON.stringify(lastSyncedValues.current)) {
      onUpdate(newFormValues);
      lastSyncedValues.current = newFormValues;
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [level, field] = name.split('.');
    if (level) {
      setFormValues((prev) => {
        const updatedLevel = { ...prev[level], [field]: value };
        const updatedValues = { ...prev, [level]: updatedLevel };
        if (JSON.stringify(updatedValues) !== JSON.stringify(lastSyncedValues.current)) {
          onUpdate(updatedValues);
          lastSyncedValues.current = updatedValues;
        }
        return updatedValues;
      });
    }
  };

  const handleGraduationStatusChange = (e) => {
    const newStatus = e.target.value;
    setGraduationStatus(newStatus);
    if (newStatus === 'appearing') {
      setFormValues((prev) => {
        const updatedValues = {
          ...prev,
          graduation: { ...prev.graduation, marks: '', percent: '' },
        };
        if (JSON.stringify(updatedValues) !== JSON.stringify(lastSyncedValues.current)) {
          onUpdate(updatedValues);
          lastSyncedValues.current = updatedValues;
        }
        return updatedValues;
      });
    }
  };

  const renderEducationFields = () => {
    switch (formType) {
      case 'METIPP':
      case 'METIPD':
        return (
          <div className="space-y-6">
            {['hsc'].map((level) => (
              <div key={level} className="border border-brand-100 p-6 rounded-xl bg-brand-50">
                <h3 className="text-lg font-medium mb-4 text-brand-800">{level.toUpperCase()}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Board/University *</label>
                    <input
                      type="text"
                      name={`${level}.board`}
                      value={formValues[level].board}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.board`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                    {errors[`${level}.board`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.board`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">School/College</label>
                    <input
                      type="text"
                      name={`${level}.school`}
                      value={formValues[level].school}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.school`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Stream</label>
                    <input
                      type="text"
                      name={`${level}.stream`}
                      value={formValues[level].stream}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.stream`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Marks Obtained *</label>
                    <input
                      type="number"
                      name={`${level}.marks`}
                      value={formValues[level].marks}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.marks`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                    {errors[`${level}.marks`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.marks`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Aggregate % *</label>
                    <input
                      type="number"
                      name={`${level}.percent`}
                      value={formValues[level].percent}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.percent`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                    {errors[`${level}.percent`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.percent`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Year of Passing</label>
                    <input
                      type="number"
                      name={`${level}.year`}
                      value={formValues[level].year}
                      onChange={handleChange}
                      minLength="4"
                      maxLength="4"
                      pattern="[0-9]{4}"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.year`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">PCM Marks</label>
                    <input
                      type="number"
                      name={`${level}.pcmMarks`}
                      value={formValues[level].pcmMarks}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.pcmMarks`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">PCB Marks</label>
                    <input
                      type="number"
                      name={`${level}.pcbMarks`}
                      value={formValues[level].pcbMarks}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.pcbMarks`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                    />
                  </div>
                  {formType === 'METIPP' && (
                    <div>
                      <label className="block text-brand-700 text-sm font-medium mb-2">English Marks *</label>
                      <input
                        type="number"
                        name={`${level}.englishMarks`}
                        value={formValues[level].englishMarks}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.englishMarks`] ? 'border-red-500' : 'border-brand-200'
                          }`}
                        disabled={disabled}
                        required
                      />
                      {errors[`${level}.englishMarks`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${level}.englishMarks`]}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'METICS':
        return (
          <div className="space-y-6">
            {['ssc', 'hsc', 'graduation'].map((level) => (
              <div key={level} className="border border-brand-100 p-6 rounded-xl bg-brand-50">
                <h3 className="text-lg font-medium mb-4 text-brand-800">{level.toUpperCase()}</h3>

                {level === 'graduation' && (
                  <div className="mb-4">
                    <span className="block text-brand-700 text-sm font-medium mb-2">Status</span>
                    <label className="mr-4">
                      <input
                        type="radio"
                        name="graduationStatus"
                        value="appeared"
                        checked={graduationStatus === 'appeared'}
                        onChange={handleGraduationStatusChange}
                        className="mr-2"
                        disabled={disabled}
                      />
                      Appeared
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="graduationStatus"
                        value="appearing"
                        checked={graduationStatus === 'appearing'}
                        onChange={handleGraduationStatusChange}
                        className="mr-2"
                        disabled={disabled}
                      />
                      Appearing
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Board/University *</label>
                    <input
                      type="text"
                      name={`${level}.board`}
                      value={formValues[level].board}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.board`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                    {errors[`${level}.board`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.board`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">School/College</label>
                    <input
                      type="text"
                      name={`${level}.school`}
                      value={formValues[level].school}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.school`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Stream</label>
                    <input
                      type="text"
                      name={`${level}.stream`}
                      value={formValues[level].stream}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.stream`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Marks Obtained *</label>
                    <input
                      type="number"
                      name={`${level}.marks`}
                      value={formValues[level].marks}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.marks`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                    {errors[`${level}.marks`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.marks`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Aggregate % *</label>
                    <input
                      type="number"
                      name={`${level}.percent`}
                      value={formValues[level].percent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.percent`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                    {errors[`${level}.percent`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.percent`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Year of Passing</label>
                    <input
                      type="number"
                      name={`${level}.year`}
                      value={formValues[level].year}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      pattern="[0-9]{4}"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.year`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'METIOM':
        return (
          <div className="space-y-6">
            {['hsc', 'graduation'].map((level) => (
              <div key={level} className="border border-brand-100 p-6 rounded-xl bg-brand-50">
                <h3 className="text-lg font-medium mb-4 text-brand-800">{level.toUpperCase()}</h3>

                {level === 'graduation' && (
                  <div className="mb-4">
                    <span className="block text-brand-700 text-sm font-medium mb-2">Status</span>
                    <label className="mr-4">
                      <input
                        type="radio"
                        name="graduationStatus"
                        value="appeared"
                        checked={graduationStatus === 'appeared'}
                        onChange={handleGraduationStatusChange}
                        className="mr-2"
                        disabled={disabled}
                      />
                      Appeared
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="graduationStatus"
                        value="appearing"
                        checked={graduationStatus === 'appearing'}
                        onChange={handleGraduationStatusChange}
                        className="mr-2"
                        disabled={disabled}
                      />
                      Appearing
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Board/University *</label>
                    <input
                      type="text"
                      name={`${level}.board`}
                      value={formValues[level].board}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.board`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                    />
                    {errors[`${level}.board`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.board`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">School/College</label>
                    <input
                      type="text"
                      name={`${level}.school`}
                      value={formValues[level].school}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.school`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Stream</label>
                    <input
                      type="text"
                      name={`${level}.stream`}
                      value={formValues[level].stream}
                      onChange={handleChange}
                      pattern="[a-zA-Z\s]*"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.stream`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Marks Obtained</label>
                    <input
                      type="number"
                      name={`${level}.marks`}
                      value={formValues[level].marks}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      pattern="[0-9]*"
                      disabled={(level === 'graduation' && graduationStatus === 'appearing') || disabled}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:bg-gray-100 ${errors[`${level}.marks`] ? 'border-red-500' : 'border-brand-200'}`}
                    />
                    {errors[`${level}.marks`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.marks`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Aggregate %</label>
                    <input
                      type="number"
                      name={`${level}.percent`}
                      value={formValues[level].percent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      pattern="[0-9]*"
                      disabled={(level === 'graduation' && graduationStatus === 'appearing') || disabled}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition disabled:bg-gray-100 ${errors[`${level}.percent`] ? 'border-red-500' : 'border-brand-200'}`}
                    />
                    {errors[`${level}.percent`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.percent`]}</p>}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">Year of Passing</label>
                    <input
                      type="number"
                      name={`${level}.year`}
                      value={formValues[level].year}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      pattern="[0-9]{4}"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors[`${level}.year`] ? 'border-red-500' : 'border-brand-200'
                        }`}
                      disabled={disabled}
                    />
                    {errors[`${level}.year`] && <p className="text-red-500 text-xs mt-1">{errors[`${level}.year`]}</p>}
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
      <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">
        Education Qualification
      </h2>
      {renderEducationFields()}
    </div>
  );
};

EducationQualification.propTypes = {
  formType: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  errors: PropTypes.object,
  initialData: PropTypes.object,
  disabled: PropTypes.bool,
};

EducationQualification.defaultProps = {
  errors: {},
  initialData: {},
  disabled: false,
};

export default EducationQualification;