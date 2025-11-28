
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
      const analysis = await extractTickersFromImage(base64);
      setResult(analysis);
      setSelectedTickers(analysis.foundTickers);
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || "Failed to analyze image. Please try a clearer screenshot.";
      setScanError(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleTicker = (ticker: string) => {
    if (selectedTickers.includes(ticker)) {
      setSelectedTickers(prev => prev.filter(t => t !== ticker));
    } else {
      setSelectedTickers(prev => [...prev, ticker]);
    }
  };

  const handleFinalImport = () => {
    if (selectedTickers.length > 0) {
      onImport(selectedTickers, listName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Import Watchlist</h2>
            <p className="text-sm text-gray-400">Upload a screenshot from Robinhood, Webull, or TradingView</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {!image ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-800/50 transition-all group"
             >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Upload Screenshot</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">Tap to select an image from your device. Supports JPG, PNG.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
             </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 h-full">
               {/* Image Preview */}
               <div className="w-full md:w-1/3 bg-black rounded-lg overflow-hidden border border-gray-800 relative">
                  <img src={image} alt="Preview" className="w-full h-full object-contain" />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <span className="text-blue-400 text-xs font-bold animate-pulse">Scanning Tickers...</span>
                        </div>
                    </div>
                  )}
               </div>

               {/* Results Area */}
               <div className="flex-1 flex flex-col">
                  {isScanning ? (
                     <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
                        <p className="text-lg text-gray-300 animate-pulse">Analyzing screenshot with AI...</p>
                        <p className="text-sm text-gray-500 mt-2">Detecting ticker symbols, cleaning text, and organizing your list.</p>
                     </div>
                  ) : scanError ? (
                     <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-red-500/30 bg-red-900/10 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-3">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <h3 className="text-white font-bold mb-1">Analysis Failed</h3>
                        <p className="text-sm text-red-300 mb-6 max-w-xs">{scanError}</p>
                        <div className="flex gap-3">
                           <button onClick={() => setImage(null)} className="text-gray-400 hover:text-white text-sm underline">Choose Different Image</button>
                           <button onClick={() => {
                             // Retry logic: get image from state (stripping prefix done in handleFileChange) but we need raw base64. 
                             // Image state has prefix.
                             const raw = image.split(',')[1];
                             scanImage(raw);
                           }} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Try Again</button>
                        </div>
                     </div>
                  ) : result ? (
                     <div className="flex flex-col h-full">
                        <div className={`p-3 rounded-lg border mb-4 flex justify-between items-center ${result.confidence === 'High' ? 'bg-green-900/20 border-green-500/30 text-green-300' : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'}`}>
                           <div className="flex items-center gap-2">
                              <span className="text-lg">{result.confidence === 'High' ? '✅' : '⚠️'}</span>
                              <span className="font-bold text-sm">{result.summary}</span>
                           </div>
                           <span className="text-xs font-mono uppercase border px-2 py-0.5 rounded opacity-80">{result.confidence} Confidence</span>
                        </div>
                        
                        {result.suggestions && (
                            <p className="text-xs text-gray-500 mb-4 italic">💡 {result.suggestions}</p>
                        )}

                        <div className="mb-4">
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Watchlist Name</label>
                           <input 
                             type="text" 
                             value={listName} 
                             onChange={(e) => setListName(e.target.value)} 
                             className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                           />
                        </div>

                        <div className="flex-1 overflow-y-auto mb-4 border border-gray-800 rounded-lg p-2 bg-gray-800/30">
                           <div className="flex flex-wrap gap-2">
                              {result.foundTickers.map(ticker => (
                                 <button 
                                   key={ticker}
                                   onClick={() => toggleTicker(ticker)}
                                   className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all flex items-center gap-2
                                     ${selectedTickers.includes(ticker) 
                                       ? 'bg-blue-600 border-blue-500 text-white' 
                                       : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700'}
                                   `}
                                 >
                                   {ticker}
                                   {selectedTickers.includes(ticker) && (
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                     </svg>
                                   )}
                                 </button>
                              ))}
                           </div>
                           {result.foundTickers.length === 0 && (
                               <p className="text-red-400 text-sm text-center py-4">No tickers detected. Please try another image.</p>
                           )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                           <span className="text-sm text-gray-400">{selectedTickers.length} selected</span>
                           <div className="flex gap-3">
                              <button onClick={() => setImage(null)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
                              <button 
                                onClick={handleFinalImport}
                                disabled={selectedTickers.length === 0}
                                className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${selectedTickers.length > 0 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 cursor-not-allowed'}`}
                              >
                                Create Watchlist
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : null}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotImporter;
