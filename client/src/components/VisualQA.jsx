import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';

function VisualQA({ addToHistory, viewingHistoryItem }) {
  // // --- DEBUG LOG ---
  // console.log("VisualQA component receiving props:", viewingHistoryItem);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewingHistoryItem && viewingHistoryItem.type === 'Visual Q&A') {
      // // --- DEBUG LOG ---
      // console.log("useEffect in VisualQA is running and updating state.");

      setPreview('');
      setFile(null);
      setQuestion(viewingHistoryItem.query);
      setAnswer(viewingHistoryItem.result);
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

  const handleAsk = async () => {
    // ... (rest of the function is the same)
    if (!file || !question) {
      alert('Please select an image and ask a question.');
      return;
    }
    setLoading(true);
    setAnswer('');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1];
      const mimeType = file.type;
      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/visual-qa`, {
          image: base64data,
          mimeType: mimeType,
          question: question
        });
        const newAnswer = response.data.answer;
        setAnswer(newAnswer);
        addToHistory({
          type: 'Visual Q&A',
          query: question,
          result: newAnswer,
        });
      } catch (error) {
        console.error('Error with Visual Q&A:', error);
        setAnswer('Failed to get an answer.');
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="w-full max-w-4xl bg-black p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl mb-4 text-center text-white">Visual Q&A</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {preview && (
        <div className="mt-4 text-center">
          <img 
            src={preview} 
            alt="Preview" 
            className="rounded-lg max-h-60 sm:max-h-80 mx-auto object-contain" 
          />
        </div>
      )}
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about the image..."
        className="mt-4 w-full p-3 bg-[#222222] rounded-md border border-[#444444] text-sm sm:text-base text-white"
      />
      <button
        className="mt-4 w-full bg-[#1e90ff] hover:bg-[#4682b4] text-white font-bold py-2 sm:py-3 px-4 rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={handleAsk}
        disabled={loading || !file || !question.trim()}
      >
        {loading ? 'Thinking...' : 'Ask Question'}
      </button>
      {answer && (
        <div className="mt-6 p-4 bg-[#111111] rounded-md border border-[#333333]">
          <h3 className="text-lg sm:text-xl mb-2 text-white">Answer:</h3>
          <p className="text-[#bbbbbb] text-sm sm:text-base leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default VisualQA;