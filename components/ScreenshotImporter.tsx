
import React, { useState, useRef } from 'react';
import { extractTickersFromImage } from '../services/geminiService';
import { ScreenshotAnalysisResult } from '../types';

interface ScreenshotImporterProps {
  onImport: (tickers: string[], listName: string) => void;
  onCancel: () => void;
}

const ScreenshotImporter: React.FC<ScreenshotImporterProps> = ({ onImport, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScreenshotAnalysisResult | null>(null);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [listName, setListName] = useState(`Imported Watchlist – ${new Date().toLocaleDateString()}`);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for Gemini API (keep pure base64)
        const pureBase64 = base64String.split(',')[1];
        setImage(base64String);
        scanImage(pureBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanImage = async (base64: string) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const data = await extractTickersFromImage(base64);
      setResult(data);
      if (data && data.foundTickers) {
        setSelectedTickers(data.foundTickers);
      }
    } catch (err: any) {
      setScanError(err.message || 'Failed to analyze image');
    } finally {
      setIsScanning(false);
    }
  };

  const handleImport = () => {
    if (selectedTickers.length > 0) {
      onImport(selectedTickers, listName);
    }
  };

  const toggleTicker = (ticker: string) => {
    if (selectedTickers.includes(ticker)) {
      setSelectedTickers(selectedTickers.filter(t => t !== ticker));
    } else {
      setSelectedTickers([...selectedTickers, ticker]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Import from Screenshot</h2>
            <p className="text-gray-400 text-sm">Upload a chart or watchlist image to extract tickers.</p>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-800/50 hover:border-blue-500/50 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white font-bold">Click to Upload Screenshot</p>
              <p className="text-gray-500 text-sm mt-1">Supports PNG, JPG, JPEG</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-6">
                 <div className="w-1/3 relative group">
                    <img src={image} alt="Preview" className="rounded-lg border border-gray-700 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <button 
                      onClick={() => { setImage(null); setResult(null); }}
                      className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                 </div>
                 
                 <div className="w-2/3">
                    {isScanning ? (
                       <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                          <p className="text-sm animate-pulse">Analyzing image with Gemini Vision...</p>
                       </div>
                    ) : scanError ? (
                       <div className="h-full flex items-center justify-center text-red-400 text-sm bg-red-900/10 rounded-lg p-4 border border-red-500/20">
                          {scanError}
                       </div>
                    ) : result ? (
                       <div className="animate-fade-in">
                          <div className="flex items-center justify-between mb-3">
                             <h3 className="font-bold text-white">Found Tickers ({selectedTickers.length})</h3>
                             <button 
                               onClick={() => result?.foundTickers && setSelectedTickers(result.foundTickers)}
                               className="text-xs text-blue-400 hover:text-blue-300"
                             >
                               Select All
                             </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                             {result?.foundTickers?.map(ticker => (
                                <button
                                  key={ticker}
                                  onClick={() => toggleTicker(ticker)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                                    selectedTickers.includes(ticker)
                                      ? 'bg-blue-600 text-white border-blue-500'
                                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                                  }`}
                                >
                                  {ticker}
                                </button>
                             ))}
                          </div>

                          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                             <p className="text-xs text-gray-400">
                               <span className="font-bold text-gray-300">Summary:</span> {result.summary}
                             </p>
                          </div>
                       </div>
                    ) : null}
                 </div>
              </div>
            </div>
          )}
        </div>

        {image && result && (
          <div className="p-6 border-t border-gray-800 bg-gray-900/50">
             <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Watchlist Name</label>
                <input 
                  type="text" 
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
             </div>
             <div className="flex justify-end gap-3">
                <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                   Cancel
                </button>
                <button 
                  onClick={handleImport}
                  disabled={selectedTickers.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                   Import Watchlist
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotImporter;
