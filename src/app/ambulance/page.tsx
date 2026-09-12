'use client';

import React, { useEffect, useState } from 'react';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { Navigation } from '@/components/Navigation';
import { LiveMap } from '@/components/maps/LiveMap';
import { ECGWaveform } from '@/components/charts/ECGWaveform';
import { VoiceTriage } from '@/components/voice-recorder/VoiceTriage';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button, 
  Input, 
  Select, 
  Badge, 
  Label,
  Progress
} from '@/components/ui/Primitives';
import { FloatingAIAssistant } from '@/components/ai-assistant/Chat';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  ShieldAlert, 
  Navigation as NavigationIcon,
  CheckCircle,
  AlertTriangle,
  Play,
  Square,
  Sparkles,
  MapPin,
  Building
} from 'lucide-react';
import { recommendHospitals } from '@/lib/hospital-selector';

export default function AmbulancePage() {
  const { 
    currentUser, 
    loginAs,
    emergencies, 
    ambulances, 
    hospitals,
    acceptEmergency, 
    updateVitals, 
    assignHospital, 
    markArrived,
    simulationIntervals,
    startTelemetrySimulation,
    stopTelemetrySimulation,
    triggerMockVitalsDrop
  } = useEmergencyStore();

  // Route protection & auto login as paramedic Sarah Jenkins
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ambulance') {
      loginAs('ambulance', { id: 'usr-paramedic-sarah', name: 'Sarah Paramedic' });
    }
  }, [currentUser, loginAs]);

  // Retrieve ambulance object
  const ambulance = ambulances.find(a => a.id === currentUser?.ambulanceId || a.id === 'amb-1');

  // Retrieve active emergency assigned to this ambulance
  const activeEmergency = emergencies.find(
    e => e.ambulanceId === ambulance?.id && e.status !== 'completed'
  );

  const isSimulating = activeEmergency ? !!simulationIntervals[activeEmergency.id] : false;

  // Local sliders for manual vitals adjustments
  const [hr, setHr] = useState(82);
  const [spo2, setSpo2] = useState(98);
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [temp, setTemp] = useState(36.8);
  const [resp, setResp] = useState(16);

  // Sync local sliders with emergency vitals when they change externally
  useEffect(() => {
    if (activeEmergency?.vitals) {
      setHr(activeEmergency.vitals.heartRate);
      setSpo2(activeEmergency.vitals.spo2);
      setBpSys(activeEmergency.vitals.bloodPressureSystolic);
      setBpDia(activeEmergency.vitals.bloodPressureDiastolic);
      setTemp(activeEmergency.vitals.temperature);
      setResp(activeEmergency.vitals.respiratoryRate);
    }
  }, [activeEmergency?.vitals]);

  // Handle manual vital slider modification
  const handleManualVitalChange = (field: string, val: number) => {
    if (!activeEmergency || !activeEmergency.vitals) return;
    
    const updated = {
      ...activeEmergency.vitals,
      heartRate: field === 'hr' ? val : hr,
      spo2: field === 'spo2' ? val : spo2,
      bloodPressureSystolic: field === 'bpSys' ? val : bpSys,
      bloodPressureDiastolic: field === 'bpDia' ? val : bpDia,
      temperature: field === 'temp' ? val : temp,
      respiratoryRate: field === 'resp' ? val : resp,
      timestamp: new Date().toISOString()
    };

    updateVitals(activeEmergency.id, updated);
  };

  // Run AI hospital recommendations
  const getRecommendedHospitals = () => {
    if (!activeEmergency) return [];
    return recommendHospitals(
      activeEmergency.incidentLat,
      activeEmergency.incidentLng,
      activeEmergency.patientDetails || {},
      activeEmergency.triage?.level || 'green',
      hospitals
    );
  };

  const recommendedHospitalsList = getRecommendedHospitals();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* If no assigned emergency */}
        {!activeEmergency ? (
          <div className="lg:col-span-12 py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">No Assigned Emergency Dispatch Calls</h2>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              Your crew is currently standing by. Open the **Dispatcher Dashboard** in another tab and create/assign an incident to Ambulance AMB-101.
            </p>
          </div>
        ) : (
          <>
            {/* Left Side: Navigation Map & Vitals Slider Controller */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Dispatch Action Bar */}
              {activeEmergency.status === 'assigned' && (
                <Card className="border-slate-200 bg-amber-50/20 border-l-4 border-l-amber-500">
                  <CardHeader className="py-4">
                    <CardTitle className="text-amber-800 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Action Required: Accept Emergency Call Dispatch</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0 pb-4 flex items-center justify-between">
                    <p className="text-slate-600 text-xs font-medium">
                      Incident at {activeEmergency.incidentLocationName} matching patient {activeEmergency.patientName}.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => acceptEmergency(activeEmergency.id)}
                      className="bg-amber-600 hover:bg-amber-700 cursor-pointer font-semibold shadow-xs"
                    >
                      Acknowledge & Start GPS Route
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Map */}
              <Card className="border-slate-200">
                <LiveMap 
                  emergency={activeEmergency} 
                  hospitals={hospitals} 
                  ambulances={ambulances} 
                />
              </Card>

              {/* Live ECG Bedside waveforms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 p-4 bg-slate-900 text-white flex flex-col justify-between">
                  <ECGWaveform 
                    heartRate={activeEmergency.vitals?.heartRate || 80} 
                    isCritical={activeEmergency.triage?.level === 'critical' || activeEmergency.triage?.level === 'red'}
                  />
                </Card>
                
                <VoiceTriage emergencyId={activeEmergency.id} />
              </div>

              {/* Telemetry Simulator Form Sliders (Outstanding interactive panel) */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <span>IoT Sensor Simulator Controls</span>
                      </CardTitle>
                      <CardDescription>
                        Toggle ESP32 hardware simulator, or slide parameters to test AI logic triggers.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isSimulating ? 'destructive' : 'success'}
                        onClick={() => {
                          if (isSimulating) stopTelemetrySimulation(activeEmergency.id);
                          else startTelemetrySimulation(activeEmergency.id);
                        }}
                        className="gap-1.5 cursor-pointer font-bold"
                      >
                        {isSimulating ? (
                          <>
                            <Square className="w-3.5 h-3.5" /> Stop Simulator
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Start IoT Simulator
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => triggerMockVitalsDrop(activeEmergency.id)}
                        className="cursor-pointer font-bold"
                      >
                        Trigger Sudden Vitals Drop
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  {/* HR Slider */}
                  <div className="space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Heart Rate</span>
                      <span className="font-bold text-slate-900">{hr} BPM</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={hr}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setHr(val);
                        handleManualVitalChange('hr', val);
                      }}
                      className="w-full h-1 bg-slate-200 rounded accent-primary cursor-pointer"
                    />
                  </div>

                  {/* SpO2 Slider */}
                  <div className="space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Oxygen (SpO2)</span>
                      <span className={spo2 < 90 ? 'font-bold text-red-600' : 'font-bold text-slate-900'}>{spo2}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="100"
                      value={spo2}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setSpo2(val);
                        handleManualVitalChange('spo2', val);
                      }}
                      className="w-full h-1 bg-slate-200 rounded accent-primary cursor-pointer"
                    />
                  </div>

                  {/* BP Sys Slider */}
                  <div className="space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Systolic Blood Pressure</span>
                      <span className="font-bold text-slate-900">{bpSys} mmHg</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="200"
                      value={bpSys}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setBpSys(val);
                        handleManualVitalChange('bpSys', val);
                      }}
                      className="w-full h-1 bg-slate-200 rounded accent-primary cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Side: Patient Dossier, Triage recommendation, hospital lock-in */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Triage Diagnosis card */}
              {activeEmergency.triage && (
                <Card className="border-slate-200/80 shadow-md">
                  <CardHeader className="bg-slate-900 text-white pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <CardTitle className="text-white text-sm">AI Clinical Decision Engine</CardTitle>
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
                  <CardContent className="space-y-4 pt-4">
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Mortality Risk</p>
                        <p className={`text-xl font-black mt-0.5 ${activeEmergency.triage.survivalRisk > 50 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {activeEmergency.triage.survivalRisk}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Confidence</p>
                        <p className="text-xl font-black mt-0.5 text-slate-800">
                          {activeEmergency.triage.confidenceScore * 100}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Protocol Guidance</span>
                      <p className="text-xs leading-relaxed text-slate-700 bg-blue-50/50 border border-blue-100 p-2.5 rounded-md font-medium">
                        {activeEmergency.triage.recommendedAction}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Anatomy Indicators</span>
                      <ul className="space-y-1">
                        {activeEmergency.triage.reasoning.map((r, i) => (
                          <li key={i} className="text-[10px] text-slate-600 flex items-start gap-1">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patient dossier Card */}
              {activeEmergency.patientDetails && (
                <Card className="border-slate-200">
                  <CardHeader className="bg-slate-50/50 pb-3">
                    <CardTitle className="text-sm">Patient Medical Dossier</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3.5 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Name</span>
                        <span className="font-semibold text-slate-800 text-xs">{activeEmergency.patientDetails.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Age / Gender</span>
                        <span className="font-semibold text-slate-800 text-xs">
                          {activeEmergency.patientDetails.age} y/o • {activeEmergency.patientDetails.gender}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Consciousness</span>
                        <span className="font-semibold text-slate-800 text-xs">{activeEmergency.patientDetails.consciousness}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Pain Threshold</span>
                        <span className="font-semibold text-slate-800 text-xs">{activeEmergency.patientDetails.painLevel}/10</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Symptoms</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeEmergency.patientDetails.symptoms.map((s, idx) => (
                          <Badge key={idx} variant="info" className="text-[9px] px-2 py-0.2 font-semibold">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Chronic History</span>
                      <p className="text-slate-700 font-medium text-xs mt-0.5">
                        {activeEmergency.patientDetails.knownDiseases.join(', ') || 'No reported chronic issues.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hospital lock-in section */}
              <Card className="border-slate-200">
                <CardHeader className="bg-slate-50/50 pb-3">
                  <CardTitle className="text-sm">Golden Hour Hospital Matching</CardTitle>
                  <CardDescription>
                    Highest ranked options for routing based on ICU capacity and trauma specialists.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {activeEmergency.status === 'assigned' || activeEmergency.status === 'accepted' ? (
                    <div className="p-3 bg-amber-50 text-amber-800 border border-amber-100 rounded-md text-[10px] font-medium leading-relaxed">
                      Accept dispatch call above to connect telemetry and unlock hospital selection recommendations.
                    </div>
                  ) : recommendedHospitalsList.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Calculating hospital routing...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendedHospitalsList.slice(0, 3).map((rec, index) => {
                        const isAssigned = activeEmergency.hospitalId === rec.hospital.id;
                        return (
                          <div 
                            key={rec.hospital.id}
                            className={`p-3 border rounded-lg flex flex-col justify-between gap-2.5 transition-all text-xs ${
                              isAssigned 
                                ? 'bg-blue-50/20 border-primary' 
                                : 'bg-slate-50/50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  {index === 0 && <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />}
                                  {rec.hospital.name}
                                </span>
                                <span className="text-[9px] text-primary font-mono block mt-0.5">
                                  ETA: {rec.etaMinutes}m ({rec.distanceKm}km) • score: {rec.score}/100
                                </span>
                              </div>
                              {isAssigned && <Badge variant="success">ASSIGNED</Badge>}
                            </div>

                            <ul className="space-y-0.5 text-[9px] text-slate-500 font-medium">
                              {rec.reasons.map((r, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>

                            {!isAssigned && (
                              <Button 
                                size="sm" 
                                onClick={() => assignHospital(activeEmergency.id, rec.hospital.id)}
                                className="w-full h-7 text-[10px] font-bold cursor-pointer"
                              >
                                Lock In Destination & Transmit
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Arrived handoff trigger button */}
                  {activeEmergency.status === 'hospital_ready' && (
                    <Button 
                      variant="success" 
                      onClick={() => markArrived(activeEmergency.id)}
                      className="w-full font-bold cursor-pointer h-10 mt-3"
                    >
                      Confirm Handoff: Arrived at ER Bay
                    </Button>
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
