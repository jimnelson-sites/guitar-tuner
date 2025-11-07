
import { useState, useRef, useCallback, useEffect } from 'react';

interface UsePitchDetectionProps {
  onPitchDetected: (freq: number) => void;
}

const FFT_SIZE = 2048;
const RMS_THRESHOLD = 0.01; // Minimum volume to start detecting pitch

export const usePitchDetection = ({ onPitchDetected }: UsePitchDetectionProps) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const buffer = useRef<Float32Array>(new Float32Array(FFT_SIZE));

  const autoCorrelate = useCallback((buf: Float32Array, sampleRate: number): number => {
    // 1. Calculate RMS to check for volume
    let rms = 0;
    for (let i = 0; i < buf.length; i++) {
      rms += buf[i] * buf[i];
    }
    rms = Math.sqrt(rms / buf.length);

    if (rms < RMS_THRESHOLD) {
      return -1; // Not enough signal
    }

    // 2. Find the best correlation out of several samples
    let bestCorrelation = 0;
    let bestOffset = -1;
    
    for (let offset = 80; offset < buf.length - 1; offset++) {
        let correlation = 0;
        for (let i = 0; i < buf.length - offset; i++) {
            correlation += buf[i] * buf[i + offset];
        }
        correlation /= (buf.length - offset);
        
        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
    }
    
    if (bestCorrelation > 0.1 && bestOffset !== -1) {
        return sampleRate / bestOffset;
    }

    return -1;
  }, []);

  const detectPitch = useCallback(() => {
    if (!analyser || !audioContext) return;

    analyser.getFloatTimeDomainData(buffer.current);
    const frequency = autoCorrelate(buffer.current, audioContext.sampleRate);
    
    if (frequency !== -1) {
      onPitchDetected(frequency);
    }
    
    animationFrameId.current = requestAnimationFrame(detectPitch);
  }, [analyser, audioContext, autoCorrelate, onPitchDetected]);

  const stop = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      setAudioContext(null);
    }
    setAnalyser(null);
  }, [audioContext, mediaStream]);

  const start = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      if (audioContext) {
        resolve();
        return;
      }
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const newAudioContext = new window.AudioContext();
          const newAnalyser = newAudioContext.createAnalyser();
          newAnalyser.fftSize = FFT_SIZE;
          
          const source = newAudioContext.createMediaStreamSource(stream);
          source.connect(newAnalyser);
          
          setAudioContext(newAudioContext);
          setAnalyser(newAnalyser);
          setMediaStream(stream);

          buffer.current = new Float32Array(newAnalyser.fftSize);
          
          resolve();
        })
        .catch(err => {
          console.error("Error getting media stream", err);
          reject(err);
        });
    });
  }, [audioContext]);

  useEffect(() => {
    if (analyser && !animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(detectPitch);
    }
    // Cleanup function
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyser, detectPitch]);

  return { start, stop };
};
