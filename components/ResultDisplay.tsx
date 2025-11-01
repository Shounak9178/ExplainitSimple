
import React, { useState, useCallback } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { generateSpeech } from '../services/geminiService';
import { Speaker, Play, Pause, StopCircle, LoaderIcon } from './IconComponents';

interface ResultDisplayProps {
  text: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ text }) => {
  const [isNarrationLoading, setIsNarrationLoading] = useState(false);
  const { isPlaying, isPaused, play, pause, resume, stop } = useTextToSpeech();

  const handleNarrate = useCallback(async () => {
    if (isPaused) {
      resume();
      return;
    }
    setIsNarrationLoading(true);
    try {
      const base64Audio = await generateSpeech(text);
      play(base64Audio);
    } catch (error) {
      console.error('Failed to generate speech:', error);
      // You might want to show an error to the user here
    } finally {
      setIsNarrationLoading(false);
    }
  }, [text, play, resume, isPaused]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-200">Simplified Explanation</h2>
        <div className="flex items-center gap-2">
          {isNarrationLoading ? (
            <button className="flex items-center gap-2 bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg cursor-wait">
              <LoaderIcon className="animate-spin h-5 w-5" />
              Generating...
            </button>
          ) : (
            <>
              {!isPlaying && !isPaused && (
                <button
                  onClick={handleNarrate}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <Speaker className="h-5 w-5" />
                  Read Aloud
                </button>
              )}
              {isPlaying && !isPaused && (
                <button
                  onClick={pause}
                  className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <Pause className="h-5 w-5" />
                  Pause
                </button>
              )}
              {isPaused && (
                <button
                  onClick={handleNarrate}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <Play className="h-5 w-5" />
                  Resume
                </button>
              )}
              {(isPlaying || isPaused) && (
                <button
                  onClick={stop}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <StopCircle className="h-5 w-5" />
                  Stop
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-700 max-h-[50vh] overflow-y-auto">
        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  );
};
