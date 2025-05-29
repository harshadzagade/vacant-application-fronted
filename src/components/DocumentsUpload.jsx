import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DocumentsUpload = ({ formType, onUpdate, errors, initialData, disabled }) => {
  const [uploadedFiles, setUploadedFiles] = useState({
    signaturePhoto: null,
    cetScoreCard: null,
    fcReceipt: null,
    hscMarksheet: null,
    fcVerification: null,
    fcVerificationAck: null,
  });

  useEffect(() => {
    if (!initialData) return;

    setUploadedFiles({
      signaturePhoto: initialData.signaturePhoto || null,
      cetScoreCard: initialData.cetScoreCard || null,
      fcReceipt: initialData.fcReceipt || null,
      hscMarksheet: initialData.hscMarksheet || null,
      fcVerification: initialData.fcVerification || null,
      fcVerificationAck: initialData.fcVerificationAck || null,
    });
  }, [initialData]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setUploadedFiles((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      onUpdate({ [name]: files[0] });
    }
  };

  const getFileName = (filePath) => {
    if (!filePath) return '';
    // Extract file name from path (handles both \ and / separators)
    return filePath.split(/[\\/]/).pop();
  };

  const renderDocumentFields = () => {
    const fields = [
      { key: 'signaturePhoto', label: 'Signature Photo *', required: true },
      { key: 'cetScoreCard', label: 'CET Score Card *', required: ['METIPD', 'METIOM', 'METICS'].includes(formType) },
      { key: 'fcReceipt', label: 'FC Receipt *', required: formType === 'METIOM' },
      { key: 'hscMarksheet', label: 'HSC Marksheet *', required: ['METIPP', 'METIPD'].includes(formType) },
      { key: 'fcVerification', label: 'FC Verification *', required: formType === 'METIPP' },
      { key: 'fcVerificationAck', label: 'FC Verification Acknowledgment *', required: formType === 'METIPD' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(
          ({ key, label, required }) =>
            required && (
              <div key={key}>
                <label className="block text-brand-700 text-sm font-medium mb-2">{label}</label>
                {uploadedFiles[key] && (
                  <div className="mb-2">
                    <a
                      href={`http://localhost:5000/${uploadedFiles[key].replace(/\\/g, '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {getFileName(uploadedFiles[key])}
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  name={key}
                  onChange={handleFileChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                    errors[key] ? 'border-red-500' : 'border-brand-200'
                  }`}
                  accept="image/*,.pdf"
                  disabled={disabled}
                />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </div>
            )
        )}
      </div>
    );
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b-2 border-brand-200 pb-2">
        Document Upload
      </h2>
      {renderDocumentFields()}
    </div>
  );
};

DocumentsUpload.propTypes = {
  formType: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  errors: PropTypes.object,
  initialData: PropTypes.object,
  disabled: PropTypes.bool,
};

DocumentsUpload.defaultProps = {
  errors: {},
  initialData: {},
  disabled: false,
};

export default DocumentsUpload;