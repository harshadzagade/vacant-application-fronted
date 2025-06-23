import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const EducationQualification = ({ formType, onUpdate, errors, initialData, disabled }) => {
  const [graduationStatus, setGraduationStatus] = useState('');
  const [formValues, setFormValues] = useState({
    ssc: { board: '', college: '', stream: '', marks: '', percent: '', year: '' },
    hsc: { board: '', college: '', stream: '', marks: '', percent: '', year: '', pcmMarks: '', pcbMarks: '', englishMarks: '' },
    graduation: { board: '', college: '', stream: '', marks: '', percent: '', year: '', status: '', graduationStatus: '' },
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const lastSyncedValues = useRef(null);

  useEffect(() => {
    if (!initialData) return;

    const newFormValues = {
      ssc: {
        board: initialData.ssc?.board || '',
        college: initialData.ssc?.college || '',
        stream: initialData.ssc?.stream || '',
        marks: initialData.ssc?.marks || '',
        percent: initialData.ssc?.percent || '',
        year: initialData.ssc?.year || '',
      },
      hsc: {
        board: initialData.hsc?.board || '',
        college: initialData.hsc?.college || '',
        stream: initialData.hsc?.stream || '',
        marks: initialData.hsc?.marks || '',
        percent: initialData.hsc?.percent || '',
        year: initialData.hsc?.year || '',
        pcmMarks: initialData.hsc?.pcmMarks || '',
        pcbMarks: initialData.hsc?.pcbMarks || '',
        englishMarks: initialData.hsc?.englishMarks || '',
      },
      graduation: {
        board: initialData.graduation?.board || '',
        college: initialData.graduation?.college || '',
        stream: initialData.graduation?.stream || '',
        marks: initialData.graduation?.marks || '',
        percent: initialData.graduation?.percent || '',
        year: initialData.graduation?.year || '',
        graduationStatus: initialData.graduation?.graduationStatus || '',
      },
    };



    const newGraduationStatus = initialData.graduation?.marks || initialData.graduation?.percent ? 'appeared' : 'appearing';

    setFormValues(newFormValues);
    setGraduationStatus(newGraduationStatus);

    if (JSON.stringify(newFormValues) !== JSON.stringify(lastSyncedValues.current)) {
      onUpdate(newFormValues);
      lastSyncedValues.current = newFormValues;
    }
  }, [initialData]);

  const validateField = (level, field, value) => {
    const key = `${level}.${field}`;
    let error = '';

    const isGraduationAppearing = level === 'graduation' && graduationStatus === 'appearing';
    const isRequiredField = ['board', 'college', 'stream', 'marks', 'percent', 'year'].includes(field) && !(isGraduationAppearing && ['marks', 'percent'].includes(field));

    if (isRequiredField && !value) {
      error = `${field.replace(/([A-Z])/g, ' $1')} is required`;
    }

    if (['marks', 'percent', 'pcmMarks', 'pcbMarks', 'englishMarks'].includes(field)) {
      const num = parseFloat(value);
      if (value && isNaN(num)) {
        error = 'Value must be a number';
      } else {
        if (field === 'percent' && (num < 0 || num > 100)) {
          error = 'Percentage must be between 0 and 100';
        } else if (num < 0) {
          error = 'Marks cannot be negative';
        } else if (['marks'].includes(field) && num > 1000) {
          error = 'Marks seem too high';
        }
      }
    }

    if (field === 'year') {
      const currentYear = new Date().getFullYear();
      const num = parseInt(value);
      if (!value) {
        error = 'Year is required';
      } else if (isNaN(num) || num < 1950 || num > currentYear + 1) {
        error = `Year must be between 1950 and ${currentYear + 1}`;
      }
    }

    return { [key]: error.trim() ? error : '' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [level, field] = name.split('.');

    if (!level || !field) return;

    const error = validateField(level, field, value);
    let updatedValues; // Define updatedValues in the outer scope

    setFormValues((prev) => {
      const updatedLevel = { ...prev[level], [field]: value };
      updatedValues = { ...prev, [level]: updatedLevel }; // Assign updatedValues here
      if (JSON.stringify(updatedValues) !== JSON.stringify(lastSyncedValues.current)) {
        onUpdate(updatedValues);
        lastSyncedValues.current = updatedValues;
      }
      return updatedValues;
    });

    setFieldErrors((prev) => {
      const updated = { ...prev, ...error }; // ✅ FIXED HERE
      onUpdate({ values: updatedValues, errors: updated });
      lastSyncedValues.current = updatedValues;
      return updated;
    });

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
        onUpdate({ values: updatedValues, errors: fieldErrors });
        lastSyncedValues.current = updatedValues;
        return updatedValues;
      });
    }
  };

  const renderFields = (level) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {['board', 'college', 'stream', 'marks', 'percent', 'year'].map((field) => {
        const isGraduationAppearing = level === 'graduation' && graduationStatus === 'appearing';
        const shouldHide = isGraduationAppearing && ['marks', 'percent'].includes(field);
        const isRequired = !shouldHide && ['board', 'college', 'stream', 'marks', 'percent', 'year'].includes(field);

        if (shouldHide) return null;

        // Prioritize dot-notation errors, then fallback to nested errors
        const displayError =
          fieldErrors[`${level}.${field}`] ||
          errors[`${level}.${field}`] ||
          (errors[level]?.[field] || '');

        return (
          <div key={field}>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              {field === 'marks' ? 'Total Marks' : field.replace(/([A-Z])/g, ' $1').replace(/\b\w/g, (l) => l.toUpperCase())}{' '}
              {isRequired && '*'}
            </label>
            <input
              type={['percent', 'marks', 'year'].includes(field) ? 'number' : 'text'}
              name={`${level}.${field}`}
              value={formValues[level][field]}
              onChange={handleChange}
              disabled={disabled}
              required={isRequired}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${displayError ? 'border-red-500' : 'border-brand-200'
                }`}
            />
            {displayError && <p className="text-red-500 text-xs mt-1">{displayError}</p>}
          </div>
        );
      })}
    </div>
  );

  const sectionMap = {
    METIPP: ['hsc'],
    METIPD: ['hsc'],
    METICS: ['graduation'],
    METIOM: ['hsc', 'graduation'],
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">
        Education Qualification
      </h2>

      {sectionMap[formType]?.map((level) => (
        <div key={level} className="border border-brand-100 p-6 rounded-xl bg-brand-50 mb-6">
          <h3 className="text-lg font-medium mb-4 text-brand-800 uppercase">{level}</h3>

          {level === 'graduation' && ['METICS', 'METIOM'].includes(formType) && (
            <div className="mb-4">
              <label className="block text-brand-700 text-sm font-medium mb-2">Graduation Status</label>
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

          {renderFields(level)}

          {level === 'hsc' && ['METIPP', 'METIPD'].includes(formType) && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-brand-700 text-sm font-medium mb-2">PCM Marks *</label>
                <input
                  type="number"
                  name={`${level}.pcmMarks`}
                  value={formValues[level].pcmMarks}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${(fieldErrors[`${level}.pcmMarks`] || (errors[level] && errors[level].pcmMarks) || errors[`${level}.pcmMarks`]) ? 'border-red-500' : 'border-brand-200'}`}
                  disabled={disabled}
                  required
                />
                {(fieldErrors[`${level}.pcmMarks`] || (errors[level] && errors[level].pcmMarks) || errors[`${level}.pcmMarks`]) && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors[`${level}.pcmMarks`] || (errors[level] && errors[level].pcmMarks) || errors[`${level}.pcmMarks`]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-brand-700 text-sm font-medium mb-2">PCB Marks *</label>
                <input
                  type="number"
                  name={`${level}.pcbMarks`}
                  value={formValues[level].pcbMarks}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${(fieldErrors[`${level}.pcbMarks`] || (errors[level] && errors[level].pcbMarks) || errors[`${level}.pcbMarks`]) ? 'border-red-500' : 'border-brand-200'}`}
                  disabled={disabled}
                  required
                />
                {(fieldErrors[`${level}.pcbMarks`] || (errors[level] && errors[level].pcbMarks) || errors[`${level}.pcbMarks`]) && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors[`${level}.pcbMarks`] || (errors[level] && errors[level].pcbMarks) || errors[`${level}.pcbMarks`]}
                  </p>
                )}
              </div>
              {formType === 'METIPP' && (
                <div>
                  <label className="block text-brand-700 text-sm font-medium mb-2">English Marks *</label>
                  <input
                    type="number"
                    name={`${level}.englishMarks`}
                    value={formValues[level].englishMarks}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${(fieldErrors[`${level}.englishMarks`] || (errors[level] && errors[level].englishMarks) || errors[`${level}.englishMarks`]) ? 'border-red-500' : 'border-brand-200'}`}
                    disabled={disabled}
                    required
                  />
                  {(fieldErrors[`${level}.englishMarks`] || (errors[level] && errors[level].englishMarks) || errors[`${level}.englishMarks`]) && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors[`${level}.englishMarks`] || (errors[level] && errors[level].englishMarks) || errors[`${level}.englishMarks`]}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
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
