import React, { useState, useRef, useEffect } from 'react';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { MessageSquare, Send, X, Bot, RefreshCw, UserCheck } from 'lucide-react';
import { Card, Button, Input } from '../ui/Primitives';

export const FloatingAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string; timestamp: Date }[]>([
    {
      sender: 'ai',
      text: 'Hello! I am LifeLink AI, your emergency clinical assistant. Ask me about patient status, vitals, ETAs, or hospital resource recommendations.',
      timestamp: new Date()
    }
  ]);

  const { emergencies, hospitals, ambulances } = useEmergencyStore();
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMsg = { sender: 'user' as const, text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate response based on active emergency state
    setTimeout(() => {
      const responseText = generateAIResponse(userText);
      setMessages(prev => [...prev, { sender: 'ai' as const, text: responseText, timestamp: new Date() }]);
    }, 800);
  };

  const generateAIResponse = (query: string): string => {
    const text = query.toLowerCase();
    const activeEmergency = emergencies.find(e => e.status !== 'completed');

    // 1. Check for Active Incident queries
    if (!activeEmergency) {
      if (text.includes('vital') || text.includes('patient') || text.includes('eta') || text.includes('hospital')) {
        return 'No active emergency incidents are currently logged in the platform. Once a dispatcher creates an emergency, I will provide live analysis of their vitals, timeline, and routing.';
      }
      return 'I am ready to assist. Please create an emergency incident in the Dispatcher Dashboard to begin real-time patient monitoring and triage support.';
    }

    const patientName = activeEmergency.patientName;
    const vitals = activeEmergency.vitals;
    const triage = activeEmergency.triage;

    // 2. Vitals query
    if (text.includes('vital') || text.includes('heart') || text.includes('bp') || text.includes('blood pressure') || text.includes('spo2') || text.includes('oxygen')) {
      if (!vitals) return `Telemetry has not started yet for ${patientName}. Waiting for ambulance crew to accept and connect sensors.`;
      return `Current Telemetry for ${patientName}:\n• Heart Rate: ${vitals.heartRate} bpm\n• SpO2: ${vitals.spo2}%\n• Blood Pressure: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg\n• Temp: ${vitals.temperature}°C\n• Resp. Rate: ${vitals.respiratoryRate} bpm.\nAI Triage Classification is ${triage?.level.toUpperCase()} with confidence ${triage?.confidenceScore ? triage.confidenceScore * 100 : 95}%.`;
    }

    // 3. ETA & Location query
    if (text.includes('eta') || text.includes('arrival') || text.includes('arrive') || text.includes('time') || text.includes('where')) {
      const ambulance = ambulances.find(a => a.id === activeEmergency.ambulanceId);
      const hospital = hospitals.find(h => h.id === activeEmergency.hospitalId);
      
      let etaStr = '';
      if (activeEmergency.etaMinutes !== undefined) {
        etaStr = `Estimated arrival is ${activeEmergency.etaMinutes} minutes (${activeEmergency.distanceKm} km remaining).`;
      } else {
        etaStr = 'ETA is currently calculating.';
      }

      if (activeEmergency.status === 'arrived') {
        return `Ambulance crew has arrived at the emergency department. Handoff in progress.`;
      }

      return `Case #${activeEmergency.id.slice(-4).toUpperCase()} Status:\nAmbulance: ${ambulance?.code || 'Assigning...'} is transporting ${patientName}.\nDestination: ${hospital?.name || 'Choosing hospital...'}.\n${etaStr}`;
    }

    // 4. Patient Summary & History
    if (text.includes('patient') || text.includes('summary') || text.includes('who') || text.includes('symptom') || text.includes('history') || text.includes('medication')) {
      const details = activeEmergency.patientDetails;
      if (!details) return `Patient record for ${patientName} is loading.`;
      
      return `Clinical Dossier for ${patientName} (${details.age} y/o ${details.gender}):\n• Primary Symptoms: ${(details.symptoms || []).join(', ') || 'None reported'}\n• Consciousness: ${details.consciousness}\n• Chronic Illnesses: ${(details.knownDiseases || []).join(', ') || 'No history'}\n• Allergies: ${(details.allergies || []).join(', ') || 'No known allergies'}\n• Medications: ${(details.currentMedications || []).join(', ') || 'None'}\n• Pain Level: ${details.painLevel}/10`;
    }

    // 5. Triage details & survival risk
    if (text.includes('triage') || text.includes('treatment') || text.includes('risk') || text.includes('recommend') || text.includes('action') || text.includes('diagnosis')) {
      if (!triage) return 'AI classification model has not analyzed the patient yet.';
      return `AI Diagnostic Triage Insight:\n• Severity: ${triage.level.toUpperCase()}\n• Survival Risk: ${triage.survivalRisk}% risk of mortality if untreated.\n• Recommendation: ${triage.recommendedAction}\n• Clinical Justification: ${triage.reasoning.join('; ')}`;
    }

    // 6. Hospital capacity query
    if (text.includes('hospital') || text.includes('bed') || text.includes('icu') || text.includes('ventilator')) {
      const assignedHosp = hospitals.find(h => h.id === activeEmergency.hospitalId);
      let list = hospitals.map(h => `• ${h.name}: ICU Beds (${h.icuBedsAvailable}/${h.icuBedsTotal}), ER Beds (${h.erBedsAvailable}/${h.erBedsTotal}), ventilators (${h.ventilatorsAvailable})`).join('\n');
      
      if (assignedHosp) {
        return `Assigned Hospital: ${assignedHosp.name}.\n\nHospital Network Availability:\n${list}`;
      }
      return `Here is the current hospital capacity in our network:\n${list}`;
    }

    // 7. Fallback general help
    return `I can help analyze the active case for patient ${patientName}. Try asking:\n- "What are the latest vitals?"\n- "Summarize the patient profile"\n- "What is the recommended treatment protocol?"\n- "Show hospital bed availability"\n- "What is the ambulance ETA?"`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen ? (
        <Card className="w-[340px] sm:w-[380px] h-[480px] flex flex-col shadow-2xl border-slate-200 animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-primary text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h4 className="font-semibold text-sm">LifeLink AI Clinical Copilot</h4>
                <div className="flex items-center gap-1 text-[10px] text-blue-100">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span>Real-time analysis active</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'ai' ? (
                  <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                )}
                <div 
                  className={`rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-200/60 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200/80 bg-white flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about vitals, ETA, triage..."
              className="flex-1 h-9 text-xs"
            />
            <Button type="submit" size="sm" className="h-9 shrink-0 px-3 cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </Card>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/95 text-white p-3.5 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 alert-pulse-critical"
          style={{ animationDuration: '3s' }}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
