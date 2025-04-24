const EntranceExam = ({ formType, onUpdate }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const renderExamFields = () => {
    switch (formType) {
      case 'pharmacyDegree':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET Application ID</label>
              <input type="text" name="cetApplicationId" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET Score</label>
              <input type="number" name="cetScore" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET Percentile (%)</label>
              <input type="number" name="cetScorePercent" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET-PCB Marks</label>
              <input type="number" name="cetPcbMarks" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET-PCM Marks</label>
              <input type="number" name="cetPcmMarks" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
            </div>
          </div>
        );
      case 'iom':
        return (
          <div className="grid grid-cols-1 gap-6">
            {['cet','cat', 'cmat', 'gmat', 'mat', 'atma', 'xat'].map((exam) => (
              <div key={exam} className="flex items-center gap-6">
                <div className="flex-1">
                  <label className="block text-brand-700 text-sm font-medium mb-2">{exam.toUpperCase()} Application ID</label>
                  <input
                    type="text"
                    name={`${exam}ApplicationId`}
                    onChange={handleChange}
                    className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-brand-700 text-sm font-medium mb-2">{exam.toUpperCase()} Score</label>
                  <input
                    type="number"
                    name={`${exam}Score`}
                    onChange={handleChange}
                    className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-brand-700 text-sm font-medium mb-2">{exam.toUpperCase()} Percentile (%)</label>
                  <input
                    type="number"
                    name={`${exam}ScorePercent`}
                    onChange={handleChange}
                    className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case 'mca':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET Application ID</label>
              <input type="text" name="cetApplicationId" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET Score</label>
              <input type="number" name="cetScore" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">Percentile</label>
              <input type="number" name="percentile" onChange={handleChange} className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      {formType !== 'pharmacyDiploma' && (
        <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">Entrance Exam Details</h2>
      )}
      {renderExamFields()}
    </div>
  );
};

export default EntranceExam;