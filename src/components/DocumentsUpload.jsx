import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DocumentsUpload = ({ formType, onUpdate, errors, initialData, disabled }) => {
  const [uploadedFiles, setUploadedFiles] = useState({
    signaturePhoto: null,
    cetScoreCard: null,
    fcReceipt: null,
    hscMarksheet: null,
  });

  const [filePreviews, setFilePreviews] = useState({
    signaturePhoto: null,
    cetScoreCard: null,
    fcReceipt: null,
    hscMarksheet: null,
  });

  const [fileErrors, setFileErrors] = useState({});
  const [isUploading, setIsUploading] = useState({});

  useEffect(() => {
    if (!initialData) return;

    const newUploadedFiles = {};
    const newFilePreviews = {};
    Object.keys(uploadedFiles).forEach((key) => {
      if (initialData[key]) {
        newUploadedFiles[key] = initialData[key];
        if (typeof initialData[key] === 'string') {
          newFilePreviews[key] = `https://vacantseats.met.edu/${initialData[key].replace(/\\/g, '/')}`;
        } else {
          newFilePreviews[key] = null;
        }
      } else {
        newUploadedFiles[key] = null;
        newFilePreviews[key] = null;
      }
    });

    setUploadedFiles(newUploadedFiles);
    setFilePreviews(newFilePreviews);
  }, [initialData]);

  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((preview) => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [filePreviews]);

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (!files[0]) return;

    setIsUploading((prev) => ({ ...prev, [name]: true }));
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setFileErrors((prev) => ({
        ...prev,
        [name]: 'Only JPEG, PNG, and PDF files are allowed.',
      }));
      setUploadedFiles((prev) => ({ ...prev, [name]: null }));
      setFilePreviews((prev) => ({ ...prev, [name]: null }));
      onUpdate({ [name]: null });
      setIsUploading((prev) => ({ ...prev, [name]: false }));
      return;
    }

    if (file.size > maxSize) {
      setFileErrors((prev) => ({
        ...prev,
        [name]: 'File size exceeds 5MB limit.',
      }));
      setUploadedFiles((prev) => ({ ...prev, [name]: null }));
      setFilePreviews((prev) => ({ ...prev, [name]: null }));
      onUpdate({ [name]: null });
      setIsUploading((prev) => ({ ...prev, [name]: false }));
      return;
    }

    if (filePreviews[name] && filePreviews[name].startsWith('blob:')) {
      URL.revokeObjectURL(filePreviews[name]);
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedFiles((prev) => ({ ...prev, [name]: file }));
    setFilePreviews((prev) => ({ ...prev, [name]: previewUrl }));
    setFileErrors((prev) => ({ ...prev, [name]: '' }));
    onUpdate({ [name]: file });
    setIsUploading((prev) => ({ ...prev, [name]: false }));

    console.log(`Selected file for ${name}:`, file);
  };

  const handleRemoveFile = (key) => {
    if (filePreviews[key] && filePreviews[key].startsWith('blob:')) {
      URL.revokeObjectURL(filePreviews[key]);
    }
    setUploadedFiles((prev) => ({ ...prev, [key]: null }));
    setFilePreviews((prev) => ({ ...prev, [key]: null }));
    setFileErrors((prev) => ({ ...prev, [key]: '' }));
    onUpdate({ [key]: null });
  };

  const getFileName = (file) => {
    if (!file) return 'No file selected';
    if (typeof file === 'string') {
      return file.split(/[\\/]/).pop();
    }
    return file.name;
  };

  const isImageFile = (file) => {
    if (!file) return false;
    if (typeof file === 'string') {
      const extension = file.split('.').pop().toLowerCase();
      return ['jpeg', 'jpg', 'png'].includes(extension);
    }
    return ['image/jpeg', 'image/png'].includes(file.type);
  };

  const renderDocumentFields = () => {
    const fields = [
      { key: 'signaturePhoto', label: 'Signature Photo *', accept: 'image/jpeg,image/png', required: true },
      { key: 'cetScoreCard', label: 'CET Score Card *', accept: 'application/pdf,image/jpeg,image/png', required: ['METICS', 'METIPD', 'METIOM'].includes(formType) },
      { key: 'fcReceipt', label: 'FC Receipt *', accept: 'application/pdf,image/jpeg,image/png', required: ['METICS', 'METIPD', 'METIOM', 'METIOM'].includes(formType) },
      { key: 'hscMarksheet', label: 'HSC Marksheet *', accept: 'application/pdf,image/jpeg,image/png', required: ['METIPP', 'METIPD'].includes(formType) },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(
          ({ key, label, accept, required }) =>
            required && (
              <div key={key} className="space-y-3">
                <label className="block text-gray-800 text-sm font-medium mb-2">{label}</label>
                {uploadedFiles[key] && (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      {isImageFile(uploadedFiles[key]) ? (
                        <img
                          src={filePreviews[key]}
                          alt={getFileName(uploadedFiles[key])}
                          className="w-20 h-20 object-cover rounded-md border border-gray-300"
                          onError={(e) => console.error(`Failed to load preview for ${key}:`, e)}
                        />
                      ) : (
                        <a
                          href={filePreviews[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800 flex items-center space-x-2 transition-colors duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate max-w-[150px]">{getFileName(uploadedFiles[key])}</span>
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(key)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      disabled={disabled}
                      aria-label={`Remove ${label}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    name={key}
                    onChange={handleFileChange}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 hover:file:text-red-800 ${
                      errors[key] || fileErrors[key] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    accept={accept}
                    disabled={disabled || isUploading[key]}
                    aria-invalid={errors[key] || fileErrors[key] ? 'true' : 'false'}
                    aria-label={label}
                  />
                  {isUploading[key] && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                {(errors[key] || fileErrors[key]) && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errors[key] || fileErrors[key]}</span>
                  </p>
                )}
              </div>
            )
        )}
      </div>
    );
  };

  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-red-200 pb-3">
        Documents Upload
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