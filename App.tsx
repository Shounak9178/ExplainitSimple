
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { LanguageSelector } from './components/LanguageSelector';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { extractTextFromPDF } from './services/pdfService';
import { simplifyText } from './services/geminiService';
import { SUPPORTED_LANGUAGES } from './constants';
import { Language } from './types';
import { AlertTriangle } from './components/IconComponents';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [language, setLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [simplifiedText, setSimplifiedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setSimplifiedText('');
    setError('');
    setIsParsing(true);
    try {
      const text = await extractTextFromPDF(selectedFile);
      setExtractedText(text);
      if(!text.trim()){
        setError("Could not extract any text from the PDF. It might be an image-based PDF or corrupted.");
      }
    } catch (err) {
      setError('Failed to process PDF. Please try another file.');
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleSimplify = useCallback(async () => {
    if (!extractedText) {
      setError('No text to simplify. Please upload a valid document.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSimplifiedText('');
    try {
      const result = await simplifyText(extractedText, language.name);
      setSimplifiedText(result);
    } catch (err) {
      setError('Failed to get explanation from AI. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [extractedText, language]);

  const handleReset = () => {
    setFile(null);
    setExtractedText('');
    setSimplifiedText('');
    setError('');
    setIsLoading(false);
    setIsParsing(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-700 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-12">
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30">
                <AlertTriangle className="h-6 w-6" />
                <span>{error}</span>
              </div>
            )}
            
            {!file && <FileUpload onFileSelect={handleFileChange} disabled={isParsing} />}
            
            {isParsing && <Loader text="Analyzing document..." />}

            {file && !isParsing && (
              <div className="space-y-6">
                <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-300">Uploaded Document:</p>
                    <p className="text-lg text-cyan-400 truncate">{file.name}</p>
                  </div>
                  <button onClick={handleReset} className="text-slate-400 hover:text-white transition-colors">
                    &#x2715;
                  </button>
                </div>

                {extractedText && !simplifiedText && !isLoading && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <LanguageSelector
                      selectedLanguage={language}
                      onLanguageChange={setLanguage}
                    />
                    <button
                      onClick={handleSimplify}
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      Explain It Simple
                    </button>
                  </div>
                )}
              </div>
            )}

            {isLoading && <Loader text="Simplifying your document..." />}

            {simplifiedText && !isLoading && (
              <ResultDisplay text={simplifiedText} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
