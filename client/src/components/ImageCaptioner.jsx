import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';

function ImageCaptioner({ addToHistory, viewingHistoryItem }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  // This effect runs when a history item is clicked
  useEffect(() => {
    if (viewingHistoryItem && viewingHistoryItem.type === 'Captioner') {
      // We can't restore the image preview from history easily,
      // but we can show the resulting caption.
      setPreview('');
      setFile(null);
      setCaption(viewingHistoryItem.result);
    }
  }, [viewingHistoryItem]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCaption = async () => {
    if (!file) {
      alert('Please select an image first.');
      return;
    }
    setLoading(true);
    setCaption('');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1];
      const mimeType = file.type;
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/caption`, {
          image: base64data,
          mimeType: mimeType,
        });
        const newCaption = response.data.caption;
        setCaption(newCaption);
        addToHistory({
          type: 'Captioner',
          query: file.name,
          result: newCaption,
        });
      } catch (error) {
        console.error('Error generating caption:', error);
        setCaption('Failed to generate caption.');
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="w-full max-w-4xl bg-black p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl mb-4 text-center text-white">Image Captioner</h2>
      <input
        type="file"
        accept="image/*"
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1e90ff] file:text-white hover:file:bg-[#4682b4]"
        onChange={handleFileChange}
      />
      {preview && (
        <div className="mt-4 text-center">
          <img 
            src={preview} 
            alt="Selected preview" 
            className="max-w-full max-h-60 sm:max-h-80 inline-block rounded-md object-contain" 
          />
        </div>
      )}
      <button
        onClick={handleCaption}
        disabled={loading || !file}
        className="mt-4 w-full bg-[#1e90ff] hover:bg-[#4682b4] text-white font-bold py-2 sm:py-3 px-4 rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? 'Generating...' : 'Generate Caption'}
      </button>
      {caption && (
        <div className="mt-6 p-4 bg-[#111111] rounded-md border border-[#333333]">
          <h3 className="text-lg sm:text-xl mb-2 text-white">Caption:</h3>
          <p className="text-[#bbbbbb] text-sm sm:text-base leading-relaxed">{caption}</p>
        </div>
      )}
    </div>
  );
}

export default ImageCaptioner;