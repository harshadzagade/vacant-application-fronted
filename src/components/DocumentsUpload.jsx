const DocumentsUpload = ({ formType, onUpdate }) => {
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      onUpdate({ [name]: files[0] });
    }
  };

  const renderDocumentFields = () => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-brand-700 text-sm font-medium mb-2">Signature Photo</label>
          <input
            type="file"
            name="signaturePhoto"
            onChange={handleFileChange}
            className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
            accept="image/*"
          />
        </div>

        {formType === 'mca' && (
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">CET Score Card</label>
            <input
              type="file"
              name="cetScoreCard"
              onChange={handleFileChange}
              className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
            />
          </div>
        )}

        {formType === 'pharmacyDiploma' && (
          <>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">FC Verification Copy</label>
              <input
                type="file"
                name="fcVerification"
                onChange={handleFileChange}
                className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
              />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">HSC Marksheet</label>
              <input
                type="file"
                name="hscMarksheet"
                onChange={handleFileChange}
                className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
              />
            </div>
          </>
        )}

        {formType === 'pharmacyDegree' && (
          <>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET Score Card</label>
              <input
                type="file"
                name="cetScoreCard"
                onChange={handleFileChange}
                className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
              />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">HSC Marksheet</label>
              <input
                type="file"
                name="hscMarksheet"
                onChange={handleFileChange}
                className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
              />
            </div>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">FC Verification Copy</label>
              <input
                type="file"
                name="fcVerificationAck"
                onChange={handleFileChange}
                className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
              />
            </div>
          </>
        )}

        {formType === 'iom' && (
          <>
            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2">CET Score Card</label>
              <input
                type="file"
                name="cetScoreCard"
                onChange={handleFileChange}
                className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
              />
            </div>

            <div>
              <label className="block text-brand-700 text-sm font-medium mb-2 ">FC Verification Copy</label>
              <input
                type="file"
                name="fcReceipt"
                onChange={handleFileChange}
                className="w-full p-3 border border-brand-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">Documents Upload</h2>
      {renderDocumentFields()}
    </div>
  );
};

export default DocumentsUpload;