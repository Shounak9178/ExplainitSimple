
import { useState, useRef, useCallback, useEffect } from 'react';

// Helper functions for audio decoding, placed within the hook file as they are specific to this functionality.
function decodeBase64(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const pauseTimeRef = useRef<number>(0);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const cleanup = () => {
    if (sourceNodeRef.current) {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }
    audioBufferRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    pauseTimeRef.current = 0;
  };

  const play = useCallback(async (base64Audio: string) => {
    cleanup();

    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    
    try {
      const audioData = decodeBase64(base64Audio);
      const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      audioBufferRef.current = buffer;
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      
      source.onended = () => {
        if (sourceNodeRef.current === source) {
            cleanup();
        }
      };
      
      sourceNodeRef.current = source;
      setIsPlaying(true);
      setIsPaused(false);
      pauseTimeRef.current = 0;
    } catch (error) {
        console.error("Error playing audio:", error);
        cleanup();
    }
  }, []);

  const pause = useCallback(() => {
    if (!isPlaying || isPaused || !audioContextRef.current || !sourceNodeRef.current) return;
    
    pauseTimeRef.current = audioContextRef.current.currentTime;
    sourceNodeRef.current.stop();
    sourceNodeRef.current.disconnect();
    sourceNodeRef.current = null;
    setIsPaused(true);
    setIsPlaying(false);
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (!isPaused || !audioContextRef.current || !audioBufferRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    
    // Calculate the offset to resume from
    const offset = pauseTimeRef.current % audioBufferRef.current.duration;
    source.start(0, offset);
    
    source.onended = () => {
      if (sourceNodeRef.current === source) {
        cleanup();
      }
    };
    
    sourceNodeRef.current = source;
    setIsPaused(false);
    setIsPlaying(true);
  }, [isPaused]);
  
  const stop = useCallback(() => {
    cleanup();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return { isPlaying, isPaused, play, pause, resume, stop };
};
