'use client';

import React, { useEffect, useState } from 'react';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { Navigation } from '@/components/Navigation';
import { ECGWaveform } from '@/components/charts/ECGWaveform';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  Input, 
  Textarea, 
  Badge, 
  Label,
  Progress
} from '@/components/ui/Primitives';
import { FloatingAIAssistant } from '@/components/ai-assistant/Chat';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Stethoscope, 
  Activity, 
  Heart, 
  Clock, 
  Sparkles, 
  CheckSquare, 
  Square,
  FileText,
  Bookmark,
  TrendingDown
} from 'lucide-react';

export default function DoctorPage() {
  const { 
    currentUser, 
    loginAs,
    emergencies, 
    doctors 
  } = useEmergencyStore();

  // Route protection & auto login as Specialist Doctor Dr. Evelyn Mercer
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'doctor') {
      loginAs('doctor', { id: 'doc-1', name: 'Dr. Evelyn Mercer', hospitalId: 'hosp-1' });
    }
  }, [currentUser, loginAs]);

  // Find active emergency cases assigned to *this* doctor, or default to any active case for demo ease
  const getActiveDoctorEmergency = () => {
    let assigned = emergencies.find(e => e.doctorId === currentUser?.id && e.status !== 'completed');
    if (assigned) return assigned;
    
    // Default fallback: any active case to demonstrate the dashboard
    return emergencies.find(e => e.status !== 'completed');
  };

  const activeEmergency = getActiveDoctorEmergency();

  // Doctor treatment preparation checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    airway: false,
    ivLine: false,
    ecgLeads: false,
    labSamples: false
  });

  const toggleChecklist = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Clinical notes state
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavedNotes(prev => [noteText, ...prev]);
    setNoteText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* If no active case */}
        {!activeEmergency ? (
          <div className="lg:col-span-12 py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">No Active ICU Patient Assignments</h2>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              You have no active patients in transit or admitted. Open the **Dispatcher Dashboard** and create an emergency, then assign this hospital and select Dr. Mercer in the **Hospital Dashboard**.
            </p>
          </div>
        ) : (
          <>
            {/* Left Side: Vitals Chart & Clinical Timeline */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Telemetry Chart Panel */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary animate-pulse" />
                      <span>ICU Patient Bedside Telemetry Stream</span>
                    </CardTitle>
                    <CardDescription>
                      Monitoring patient {activeEmergency.patientName} — Case #{activeEmergency.id.slice(-4).toUpperCase()}
                    </CardDescription>
                  </div>
                  {activeEmergency.vitals && (
                    <Badge variant={
                      activeEmergency.triage?.level === 'critical' || activeEmergency.triage?.level === 'red' 
                        ? 'critical' 
                        : 'green'
                    }>
                      {activeEmergency.vitals.heartRate} BPM • {activeEmergency.vitals.spo2}% SpO2
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Recharts chart representation */}
                  <div className="h-64 w-full">
                    {activeEmergency.vitalsHistory.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                        Awaiting sensor data to feed charts...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activeEmergency.vitalsHistory.map((v, i) => ({
                          time: new Date(v.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
                          hr: v.heartRate,
                          spo2: v.spo2,
                          bpSys: v.bloodPressureSystolic
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} />
                          <YAxis stroke="#94A3B8" fontSize={9} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="hr" name="HR (BPM)" stroke="#EF4444" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="spo2" name="Oxygen (%)" stroke="#3B82F6" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="bpSys" name="Sys BP (mmHg)" stroke="#10B981" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  
                  {/* Live ECG sweep */}
                  <div className="mt-4">
                    <ECGWaveform 
                      heartRate={activeEmergency.vitals?.heartRate || 80} 
                      isCritical={activeEmergency.triage?.level === 'critical' || activeEmergency.triage?.level === 'red'}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Patient Timeline Progression */}
              <Card className="border-slate-200">
                <CardHeader className="bg-slate-50/50 pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Chronological Incident Timeline</span>
                  </CardTitle>
                  <CardDescription>
                    Automatic milestone logging of the case progression.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="relative border-l border-slate-200 pl-6 space-y-5 ml-2 font-medium">
                    {activeEmergency.timeline.map((event, i) => {
                      const date = new Date(event.timestamp);
                      return (
                        <div key={event.id} className="relative">
                          {/* Dot */}
                          <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white ring-4 ring-slate-50 flex items-center justify-center" />
                          
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 text-xs">{event.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">
                              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{event.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Side: Medical dossiers, Checklist, Treatment notes */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* AI Diagnostics details */}
              {activeEmergency.triage && (
                <Card className="border-slate-200 shadow-md">
                  <CardHeader className="bg-slate-900 text-white pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <CardTitle className="text-white text-sm">AI Diagnosis Copilot</CardTitle>
                      </div>
                      <Badge variant={
                        activeEmergency.triage.level === 'critical' ? 'critical' :
                        activeEmergency.triage.level === 'red' ? 'red' :
                        activeEmergency.triage.level === 'orange' ? 'orange' :
                        activeEmergency.triage.level === 'yellow' ? 'yellow' : 'green'
                      }>
                        {activeEmergency.triage.level.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded border border-slate-100 flex items-center justify-between font-semibold">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Estimated Survival Risk</span>
                        <p className={`text-xl font-black ${activeEmergency.triage.survivalRisk > 50 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {activeEmergency.triage.survivalRisk}%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Confidence Score</span>
                        <p className="text-xl font-black text-slate-800">
                          {activeEmergency.triage.confidenceScore * 100}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Action protocol</span>
                      <p className="p-2.5 bg-blue-50/50 border border-blue-100 rounded text-blue-900 leading-relaxed font-semibold">
                        {activeEmergency.triage.recommendedAction}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Underlying Indication Factors</span>
                      <ul className="space-y-0.5">
                        {activeEmergency.triage.reasoning.map((r, i) => (
                          <li key={i} className="text-slate-600 flex items-start gap-1">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patient Profile Card */}
              {activeEmergency.patientDetails && (
                <Card className="border-slate-200">
                  <CardHeader className="bg-slate-50/50 pb-3">
                    <CardTitle className="text-sm">Patient Profile & Dossier</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3.5 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Full Name</span>
                        <span className="font-semibold text-slate-800">{activeEmergency.patientName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Demographics</span>
                        <span className="font-semibold text-slate-800">
                          {activeEmergency.patientDetails.age} y/o • {activeEmergency.patientDetails.gender}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Consciousness</span>
                        <span className="font-semibold text-slate-800">{activeEmergency.patientDetails.consciousness}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Weight (kg)</span>
                        <span className="font-semibold text-slate-800">{activeEmergency.patientDetails.weight} kg</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Reported Symptoms</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeEmergency.patientDetails.symptoms.map((s, idx) => (
                          <Badge key={idx} variant="info" className="text-[9px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Medications</span>
                      <p className="text-slate-700 font-medium">
                        {activeEmergency.patientDetails.currentMedications.join(', ') || 'None reported.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Treatment Checklist */}
              <Card className="border-slate-200">
                <CardHeader className="bg-slate-50/50 pb-3">
                  <CardTitle className="text-sm">Trauma Team ER Checklists</CardTitle>
                  <CardDescription>Actions needed to prepare for patient arrival.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-4 text-xs font-semibold text-slate-700">
                  <div 
                    onClick={() => toggleChecklist('airway')}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200/60"
                  >
                    {checklist.airway ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                    <span className={checklist.airway ? 'line-through text-slate-400' : ''}>Secure trauma bay airway apparatus</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklist('ivLine')}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200/60"
                  >
                    {checklist.ivLine ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                    <span className={checklist.ivLine ? 'line-through text-slate-400' : ''}>Prepare IV cannula & infusion setup</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklist('ecgLeads')}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200/60"
                  >
                    {checklist.ecgLeads ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                    <span className={checklist.ecgLeads ? 'line-through text-slate-400' : ''}>Prepare 12-lead ECG monitor unit</span>
                  </div>

                  <div 
                    onClick={() => toggleChecklist('labSamples')}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200/60"
                  >
                    {checklist.labSamples ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                    <span className={checklist.labSamples ? 'line-through text-slate-400' : ''}>Order priority blood lab panels (Cardiac, CBC)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Notes Compiler */}
              <Card className="border-slate-200">
                <CardHeader className="bg-slate-50/50 pb-3">
                  <CardTitle className="text-sm">Clinical Treatment Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <form onSubmit={handleSaveNote} className="space-y-2">
                    <Textarea 
                      placeholder="Add diagnostic comments or treatment guidelines..." 
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                    <Button type="submit" size="sm" className="w-full font-bold cursor-pointer h-8 text-[11px]">
                      Commit Notes to Case Registry
                    </Button>
                  </form>

                  {savedNotes.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto pt-2 border-t border-slate-100">
                      {savedNotes.map((note, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded text-[11px] leading-relaxed text-slate-600 italic">
                          "{note}"
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </>
        )}

      </main>

      <FloatingAIAssistant />
    </div>
  );
}
