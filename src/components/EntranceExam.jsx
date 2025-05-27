import { useState } from 'react';
import PropTypes from 'prop-types';

const EntranceExam = ({ formType, onUpdate, errors }) => {
  const [selectedExam, setSelectedExam] = useState(''); // For iom: track selected exam

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    // Clear other exam fields to enforce single exam selection for iom
    const otherExams = ['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'].filter((e) => e !== exam);
    const clearedData = otherExams.reduce((acc, e) => ({
      ...acc,
      [`${e}ApplicationId`]: '',
      [`${e}Score`]: '',
      [`${e}ScorePercent`]: '',
    }), {});
    onUpdate({ ...clearedData, [`${exam}ApplicationId`]: '', [`${exam}Score`]: '', [`${exam}ScorePercent`]: '' });
  };

  const renderExamFields = () => {
    switch (formType) {
      case 'METIPD':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                CET Application ID *
              </label>
              <input
                type="text"
                name="cetApplicationId"
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.cetApplicationId ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter CET Application ID"
              />
              {errors.cetApplicationId && (
                <p className="text-red-500 text-xs mt-1">{errors.cetApplicationId}</p>
              )}
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                CET Score *
              </label>
              <input
                type="number"
                name="cetScore"
                onChange={handleChange}
                min="0"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.cetScore ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter CET Score"
              />
              {errors.cetScore && (
                <p className="text-red-500 text-xs mt-1">{errors.cetScore}</p>
              )}
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                CET Percentile (%) *
              </label>
              <input
                type="number"
                name="cetScorePercent"
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.cetScorePercent ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter CET Percentile"
              />
              {errors.cetScorePercent && (
                <p className="text-red-500 text-xs mt-1">{errors.cetScorePercent}</p>
              )}
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                CET-PCB Marks *
              </label>
              <input
                type="number"
                name="cetPcbMarks"
                onChange={handleChange}
                min="0"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.cetPcbMarks ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter CET-PCB Marks"
              />
              {errors.cetPcbMarks && (
                <p className="text-red-500 text-xs mt-1">{errors.cetPcbMarks}</p>
              )}
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                CET-PCM Marks *
              </label>
              <input
                type="number"
                name="cetPcmMarks"
                onChange={handleChange}
                min="0"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.cetPcmMarks ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter CET-PCM Marks"
              />
              {errors.cetPcmMarks && (
                <p className="text-red-500 text-xs mt-1">{errors.cetPcmMarks}</p>
              )}
            </div>
          </div>
        );
      case 'METIOM':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                Select Entrance Exam *
              </label>
              <select
                value={selectedExam}
                onChange={(e) => handleExamSelect(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.selectedExam ? 'border-red-500' : 'border-brand-200'
                }`}
              >
                <option value="">Select an exam</option>
                {['cet', 'cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'].map((exam) => (
                  <option key={exam} value={exam}>
                    {exam.toUpperCase()}
                  </option>
                ))}
              </select>
              {errors.selectedExam && (
                <p className="text-red-500 text-xs mt-1">{errors.selectedExam}</p>
              )}
            </div>
            {selectedExam && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-brand-100 p-6 rounded-xl bg-brand-50">
                <div>
                  <label className="block text-brand-700 text-sm font-medium mb-2">
                    {selectedExam.toUpperCase()} Application ID *
                  </label>
                  <input
                    type="text"
                    name={`${selectedExam}ApplicationId`}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                      errors[`${selectedExam}ApplicationId`] ? 'border-red-500' : 'border-brand-200'
                    }`}
                    placeholder={`Enter ${selectedExam.toUpperCase()} Application ID`}
                  />
                  {errors[`${selectedExam}ApplicationId`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`${selectedExam}ApplicationId`]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-brand-700 text-sm font-medium mb-2">
                    {selectedExam.toUpperCase()} Score *
                  </label>
                  <input
                    type="number"
                    name={`${selectedExam}Score`}
                    onChange={handleChange}
                    min="0"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                      errors[`${selectedExam}Score`] ? 'border-red-500' : 'border-brand-200'
                    }`}
                    placeholder={`Enter ${selectedExam.toUpperCase()} Score`}
                  />
                  {errors[`${selectedExam}Score`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`${selectedExam}Score`]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-brand-700 text-sm font-medium mb-2">
                    {selectedExam.toUpperCase()} Percentile (%) *
                  </label>
                  <input
                    type="number"
                    name={`${selectedExam}ScorePercent`}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                      errors[`${selectedExam}ScorePercent`] ? 'border-red-500' : 'border-brand-200'
                    }`}
                    placeholder={`Enter ${selectedExam.toUpperCase()} Percentile`}
                  />
                  {errors[`${selectedExam}ScorePercent`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`${selectedExam}ScorePercent`]}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'METICS':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                CET Application ID *
              </label>
              <input
                type="text"
                name="cetApplicationId"
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.cetApplicationId ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter CET Application ID"
              />
              {errors.cetApplicationId && (
                <p className="text-red-500 text-xs mt-1">{errors.cetApplicationId}</p>
              )}
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                CET Score *
              </label>
              <input
                type="number"
                name="cetScore"
                onChange={handleChange}
                min="0"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.cetScore ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter CET Score"
              />
              {errors.cetScore && (
                <p className="text-red-500 text-xs mt-1">{errors.cetScore}</p>
              )}
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">
                Percentile (%) *
              </label>
              <input
                type="number"
                name="percentile"
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.percentile ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter Percentile"
              />
              {errors.percentile && (
                <p className="text-red-500 text-xs mt-1">{errors.percentile}</p>
              )}
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
        <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">
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
};

EntranceExam.defaultProps = {
  errors: {},
};

export default EntranceExam;