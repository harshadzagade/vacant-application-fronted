import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const EntranceExam = ({ formType, onUpdate, errors, initialData, disabled }) => {
  const [selectedExams, setSelectedExams] = useState([]);
  const [formValues, setFormValues] = useState({});
  const lastSyncedValues = useRef(null);
  const [internalErrors, setInternalErrors] = useState({});


  useEffect(() => {
    if (!initialData) return;

    const newFormValues = {
      cetApplicationId: initialData.cetApplicationId || '',
      cetScore: initialData.cetScore || '',
      cetScorePercent: initialData.cetScorePercent || '',
      cetPcbMarks: initialData.cetPcbMarks || '',
      cetPcmMarks: initialData.cetPcmMarks || '',
      catApplicationId: initialData.catApplicationId || '',
      catScore: initialData.catScore || '',
      catScorePercent: initialData.catScorePercent || '',
      cmatApplicationId: initialData.cmatApplicationId || '',
      cmatScore: initialData.cmatScore || '',
      cmatScorePercent: initialData.cmatScorePercent || '',
      gmatApplicationId: initialData.gmatApplicationId || '',
      gmatScore: initialData.gmatScore || '',
      gmatScorePercent: initialData.gmatScorePercent || '',
      matApplicationId: initialData.matApplicationId || '',
      matScore: initialData.matScore || '',
      matScorePercent: initialData.matScorePercent || '',
      atmaApplicationId: initialData.atmaApplicationId || '',
      atmaScore: initialData.atmaScore || '',
      atmaScorePercent: initialData.atmaScorePercent || '',
      xatApplicationId: initialData.xatApplicationId || '',
      xatScore: initialData.xatScore || '',
      xatScorePercent: initialData.xatScorePercent || '',
      percentile: initialData.percentile || '',
      neetScore: initialData.neetScore || '',
    };

    const exams = ['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'];
    const newSelectedExams = exams.filter(
      (exam) =>
        initialData[`${exam}ApplicationId`] ||
        // initialData[`${exam}Score`] ||
        initialData[`${exam}ScorePercent`]
    );

    const hasChanged = JSON.stringify(newFormValues) !== JSON.stringify(lastSyncedValues.current);

    if (hasChanged) {
      setFormValues(newFormValues);
      setSelectedExams(newSelectedExams);
      onUpdate(newFormValues);
      lastSyncedValues.current = newFormValues;
    }
  }, [initialData, onUpdate]);
  // Removed formValues and selectedExams from dependencies

  // Sync formValues with parent on every change
  useEffect(() => {
    if (JSON.stringify(formValues) !== JSON.stringify(lastSyncedValues.current)) {
      onUpdate(formValues);
      lastSyncedValues.current = formValues;
    }
  }, [formValues, onUpdate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = '';
    let normalizedValue = value;

    if (name.includes('ScorePercent') || name === 'percentile') {
      const val = parseFloat(value);
      // Round to 2 decimal places valid
      const roundedValue = value ? Number(parseFloat(val).toFixed(2)) : '';
      if (isNaN(val) || val < 0 || val > 100) {
        error = 'Percentile must be 0-100';
      }
      normalizedValue = roundedValue;
    } else if (name === 'neetScore') {
      const val = parseFloat(value);
      if (!isNaN(val) && val < 0) {
        error = 'NEET Score cannot be negative';
      }
    }

    const updatedValues = { ...formValues, [name]: normalizedValue };
    const updatedErrors = { ...internalErrors, [name]: error };

    setFormValues(updatedValues);
    setInternalErrors(updatedErrors);

    onUpdate({ values: updatedValues, errors: updatedErrors });
  };

  const handleExamToggle = (exam) => {
    let updatedExams;
    let updatedFormValues = { ...formValues };

    if (selectedExams.includes(exam)) {
      updatedExams = selectedExams.filter((e) => e !== exam);
      updatedFormValues = {
        ...updatedFormValues,
        [`${exam}ApplicationId`]: '',
        [`${exam}Score`]: '',
        [`${exam}ScorePercent`]: '',
      };
    } else {
      updatedExams = [...selectedExams, exam];
    }

    setSelectedExams(updatedExams);
    setFormValues(updatedFormValues);
  };

  const renderExamFields = () => {
    switch (formType) {
      case 'METIPD':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">CET Application ID *</label>
              <input
                type="text"
                name="cetApplicationId"
                value={formValues.cetApplicationId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.cetApplicationId ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="Enter CET Application ID"
                disabled={disabled}
              />
              {errors.cetApplicationId && <p className="text-red-600 text-xs mt-1">{errors.cetApplicationId}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">CET Score</label>
              <input
                type="number"
                name="cetScore"
                value={formValues.cetScore}
                onChange={handleChange}
                min="0"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.cetScore ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="Enter CET Score"
                disabled={disabled}
              />
              {errors.cetScore && <p className="text-red-600 text-xs mt-1">{errors.cetScore}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">CET Percentile (%) *</label>
              <input
                type="number"
                name="cetScorePercent"
                value={formValues.cetScorePercent !== '' ? Number(formValues.cetScorePercent).toFixed(2) : ''}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.cetScorePercent ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="Enter CET Percentile"
                disabled={disabled}
              />
              {errors.cetScorePercent && <p className="text-red-600 text-xs mt-1">{errors.cetScorePercent}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">NEET Score</label>
              <input
                type="number"
                name="neetScore"
                value={formValues.neetScore}
                onChange={handleChange}
                min="0"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.neetScore || internalErrors.neetScore ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="Enter NEET Score (if applicable)"
                disabled={disabled}
              />
              {(errors.neetScore || internalErrors.neetScore) && (
                <p className="text-red-600 text-xs mt-1">{errors.neetScore || internalErrors.neetScore}</p>
              )}
            </div>
          </div>
        );
      case 'METIOM':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Entrance Exams * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'].map((exam) => (
                  <label key={exam} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedExams.includes(exam)}
                      onChange={() => handleExamToggle(exam)}
                      className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                      disabled={disabled}
                    />
                    <span className="text-gray-700">{exam.toUpperCase()}</span>
                  </label>
                ))}
              </div>
              {errors.selectedExam && <p className="text-red-600 text-xs mt-1">{errors.selectedExam}</p>}
            </div>
            {selectedExams.map((exam) => (
              <div key={exam} className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-600 p-6 rounded-xl bg-gray-50 mt-4">
                <h3 className="text-lg font-medium mb-4 text-gray-800 col-span-full">{exam.toUpperCase()} Details</h3>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">{exam.toUpperCase()} Application ID *</label>
                  <input
                    type="text"
                    name={`${exam}ApplicationId`}
                    value={formValues[`${exam}ApplicationId`]}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors[`${exam}ApplicationId`] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    placeholder={`Enter ${exam.toUpperCase()} Application ID`}
                    disabled={disabled}
                  />
                  {errors[`${exam}ApplicationId`] && <p className="text-red-600 text-xs mt-1">{errors[`${exam}ApplicationId`]}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">{exam.toUpperCase()} Score</label>
                  <input
                    type="number"
                    name={`${exam}Score`}
                    value={formValues[`${exam}Score`]}
                    onChange={handleChange}
                    min="0"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors[`${exam}Score`] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    placeholder={`Enter ${exam.toUpperCase()} Score`}
                    disabled={disabled}
                  />
                  {errors[`${exam}Score`] && <p className="text-red-600 text-xs mt-1">{errors[`${exam}Score`]}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">{exam.toUpperCase()} Percentile (%) *</label>
                  <input
                    type="number"
                    name={`${exam}ScorePercent`}
                    value={formValues[`${exam}ScorePercent`] !== '' ? Number(formValues[`${exam}ScorePercent`]).toFixed(2) : ''}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors[`${exam}ScorePercent`] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    placeholder={`Enter ${exam.toUpperCase()} Percentile`}
                    disabled={disabled}
                  />
                  {errors[`${exam}ScorePercent`] && <p className="text-red-600 text-xs mt-1">{errors[`${exam}ScorePercent`]}</p>}
                </div>
              </div>
            ))}
          </div>
        );
      case 'METICS':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">CET Application ID *</label>
              <input
                type="text"
                name="cetApplicationId"
                value={formValues.cetApplicationId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.cetApplicationId ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="Enter CET Application ID"
                disabled={disabled}
              />
              {errors.cetApplicationId && <p className="text-red-600 text-xs mt-1">{errors.cetApplicationId}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">CET Score</label>
              <input
                type="number"
                name="cetScore"
                value={formValues.cetScore}
                onChange={handleChange}
                min="0"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.cetScore ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="Enter CET Score"
                disabled={disabled}
              />
              {errors.cetScore && <p className="text-red-600 text-xs mt-1">{errors.cetScore}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Percentile (%) *</label>
              <input
                type="number"
                name="percentile"
                value={formValues.percentile !== '' ? Number(formValues.percentile).toFixed(2) : ''}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.percentile ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder="Enter Percentile"
                disabled={disabled}
              />
              {errors.percentile && <p className="text-red-600 text-xs mt-1">{errors.percentile}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      {formType !== 'METIPP' && (
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 font-b-2 border-b-2 border-gray-600 pb-2">
          Entrance Exam Details
        </h2>
      )}
      {renderExamFields()}
    </div>
  );
};

EntranceExam.propTypes = {
  formType: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  errors: PropTypes.object,
  initialData: PropTypes.object,
  disabled: PropTypes.bool,
};

EntranceExam.defaultProps = {
  errors: {},
  initialData: {},
  disabled: false,
};

export default EntranceExam;