import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle, Play, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../ui/Primitives';
import { useEmergencyStore } from '@/store/useEmergencyStore';

interface VoiceTriageProps {
  emergencyId: string;
}

const PRESETS = [
  {
    label: 'Cardiac Chest Pain',
    text: 'Male 45, sudden crushing chest pain radiating to left arm, SpO2 90 percent, heart rate 125, conscious, pain level 9, history of hypertension.'
  },
  {
    label: 'Stroke Symptoms',
    text: 'Female 72, slurred speech and facial droop on left side, blood pressure is 190 over 105, semi-conscious, history of diabetes, pain level 5.'
  },
  {
    label: 'Motorcycle Trauma',
    text: 'Male 22, severe leg fracture with active bleeding, motorcycle accident, heart rate 140, BP is 105/65, conscious, extreme pain level 10.'
  },
  {
    label: 'Acute Respiratory Failure',
    text: 'Female 62, unconscious, severe shortness of breath and blue lips, oxygen saturation dropping to 79 percent, pulse is 150 bpm.'
  }
];

export const VoiceTriage: React.FC<VoiceTriageProps> = ({ emergencyId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const addVoiceNote = useEmergencyStore(state => state.addVoiceNote);

  const startPresetSimulation = (text: string) => {
    setIsRecording(true);
    setStatus('recording');
    setTranscript('');
    
    // Simulate speech-to-text typing effect
    let currentText = '';
    const words = text.split(' ');
    let wordIndex = 0;
    
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setTranscript(currentText);
        wordIndex++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
        setStatus('processing');
        
        // Simulate NLP parsing
        setTimeout(() => {
          addVoiceNote(emergencyId, text);
          setStatus('done');
          setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
      }
    }, 150); // Speed of simulated dictation
  };

  return (
    <Card className="border-border">
      <CardHeader className="bg-blue-50/20">
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          <span>Paramedic Voice Dictation</span>
        </CardTitle>
        <CardDescription>
          Dictate patient details to auto-populate vitals, symptoms, history, and compute triage levels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Waveform Visualizer */}
        <div className="bg-slate-900 rounded-lg p-4 h-24 flex items-center justify-center relative overflow-hidden border border-slate-800">
          {status === 'recording' ? (
            <div className="flex items-end gap-1 h-12">
              {Array.from({ length: 18 }).map((_, i) => {
                const height = 15 + Math.random() * 30;
                const animDuration = 0.5 + Math.random() * 0.5;
                return (
                  <span
                    key={i}
                    className="w-1.5 bg-primary rounded-full"
                    style={{
                      height: `${height}px`,
                      animation: `pulse ${animDuration}s ease-in-out infinite alternate`
                    }}
                  />
                );
              })}
            </div>
          ) : status === 'processing' ? (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Running AI NLP Parser...</span>
            </div>
          ) : status === 'done' ? (
            <div className="flex flex-col items-center gap-1.5 text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              <span className="text-xs font-mono font-semibold">Log Parsed & Patient Updated</span>
            </div>
          ) : (
            <div className="text-slate-500 text-xs text-center font-mono">
              Mic Ready. Choose a preset below or click to simulate.
            </div>
          )}

          {/* Alert status indicator */}
          {status === 'recording' && (
            <span className="absolute top-2 right-2 text-[9px] bg-red-600 text-white font-mono font-bold px-1.5 py-0.5 rounded animate-pulse">
              LIVE TRANSCRIBING
            </span>
          )}
        </div>

        {/* Live Transcript text box */}
        {transcript && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700 italic font-medium">
            "{transcript}"
          </div>
        )}

        {/* Preset Simulators */}
        <div>
          <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Test Preset Telemetry Scenarios
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESETS.map((preset, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                disabled={status !== 'idle'}
                onClick={() => startPresetSimulation(preset.text)}
                className="justify-start gap-1.5 text-slate-700 font-medium hover:border-primary hover:text-primary transition-colors cursor-pointer text-left truncate"
              >
                <Play className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{preset.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
          <span>
            Speech recognition simulation maps verbal metrics (heart rate, SpO2, symptoms) into structured patient profiles in real time.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
