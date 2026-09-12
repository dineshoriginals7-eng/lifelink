'use client';

import React, { useEffect, useState } from 'react';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { Navigation } from '@/components/Navigation';
import { LiveMap } from '@/components/maps/LiveMap';
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
  Building2, 
  Activity, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Stethoscope,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function HospitalPage() {
  const { 
    currentUser, 
    loginAs,
    emergencies, 
    ambulances, 
    hospitals, 
    doctors,
    updateHospitalBeds,
    assignDoctor,
    setHospitalReady,
    completeCase
  } = useEmergencyStore();

  // Route protection & auto login as hospital ER manager
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'hospital') {
      loginAs('hospital', { id: 'usr-hospital-staff', name: 'City Central ER Manager', hospitalId: 'hosp-1' });
    }
  }, [currentUser, loginAs]);

  // Current hospital object
  const hospitalId = currentUser?.hospitalId || 'hosp-1';
  const hospital = hospitals.find(h => h.id === hospitalId);

  // Retrieve incoming emergencies assigned to this hospital
  const incomingEmergencies = emergencies.filter(
    e => e.hospitalId === hospitalId && e.status !== 'completed'
  );

  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(null);

  useEffect(() => {
    if (incomingEmergencies.length > 0 && !activeEmergencyId) {
      setActiveEmergencyId(incomingEmergencies[0].id);
    }
  }, [incomingEmergencies, activeEmergencyId]);

  const activeIncoming = incomingEmergencies.find(e => e.id === activeEmergencyId);
  const activeIncomingAmbulance = activeIncoming ? ambulances.find(a => a.id === activeIncoming.ambulanceId) : null;

  // Filter doctors that belong to this hospital
  const hospitalDoctors = doctors.filter(d => d.hospitalId === hospitalId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Hospital Resource Management & Incoming Queue */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hospital Stats and Bed Controller */}
          {hospital && (
            <Card className="border-slate-200">
              <CardHeader className="bg-slate-50/50 pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>{hospital.name} — Resources Console</span>
                  </CardTitle>
                  <CardDescription>{hospital.address}</CardDescription>
                </div>
                <Badge variant={hospital.currentEmergencyLoad === 'high' ? 'warning' : 'green'} className="font-bold">
                  {hospital.currentEmergencyLoad.toUpperCase()} INTAKE LOAD
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-5">
                
                {/* ICU Beds slider */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg border border-slate-100 shadow-xs">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>ICU Beds Available</span>
                    <span className="font-bold text-slate-900">{hospital.icuBedsAvailable} / {hospital.icuBedsTotal}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={hospital.icuBedsTotal}
                    value={hospital.icuBedsAvailable}
                    onChange={e => updateHospitalBeds(hospital.id, { icuBedsAvailable: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-200 rounded accent-primary cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">Golden hour triage matching updates dynamically.</div>
                </div>

                {/* ER Beds slider */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg border border-slate-100 shadow-xs">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>ER Bays Available</span>
                    <span className="font-bold text-slate-900">{hospital.erBedsAvailable} / {hospital.erBedsTotal}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={hospital.erBedsTotal}
                    value={hospital.erBedsAvailable}
                    onChange={e => updateHospitalBeds(hospital.id, { erBedsAvailable: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-200 rounded accent-primary cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">ER triage matches routing score immediately.</div>
                </div>

                {/* Ventilators slider */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg border border-slate-100 shadow-xs">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Ventilators Standby</span>
                    <span className="font-bold text-slate-900">{hospital.ventilatorsAvailable} / {hospital.ventilatorsTotal}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={hospital.ventilatorsTotal}
                    value={hospital.ventilatorsAvailable}
                    onChange={e => updateHospitalBeds(hospital.id, { ventilatorsAvailable: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-200 rounded accent-primary cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">Required for Critical respiratory distress.</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Incoming Ambulance Queue Card */}
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50/50 pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Live Incoming Telemetry Queue</span>
              </CardTitle>
              <CardDescription>
                Emergency cases locked to this hospital currently in transit. Select to inspect live telemetry.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {incomingEmergencies.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 font-mono">
                  No incoming ambulance telemetry currently routing to this hospital.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {incomingEmergencies.map(emg => {
                    const isSelected = emg.id === activeEmergencyId;
                    const amb = ambulances.find(a => a.id === emg.ambulanceId);
                    
                    return (
                      <div
                        key={emg.id}
                        onClick={() => setActiveEmergencyId(emg.id)}
                        className={`p-4 hover:bg-slate-50 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 ${
                          isSelected ? 'bg-blue-50/20 border-l-primary' : 'border-l-transparent'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">
                              #{emg.id.slice(-4).toUpperCase()} — {emg.patientName} ({emg.patientDetails?.age} y/o {emg.patientDetails?.gender})
                            </span>
                            <Badge variant={
                              emg.triage?.level === 'critical' ? 'critical' :
                              emg.triage?.level === 'red' ? 'red' :
                              emg.triage?.level === 'orange' ? 'orange' :
                              emg.triage?.level === 'yellow' ? 'yellow' : 'green'
                            }>
                              {emg.triage?.level.toUpperCase() || 'PENDING'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold">
                            <span>Vehicle: {amb?.code || 'None'}</span>
                            <span>ETA: {emg.etaMinutes ? `${emg.etaMinutes} mins` : 'Arrived'}</span>
                            <span>Dist: {emg.distanceKm ? `${emg.distanceKm} km` : '--'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {emg.status === 'hospital_assigned' && (
                            <Badge variant="warning">Awaiting ER Accept</Badge>
                          )}
                          {emg.status === 'hospital_ready' && (
                            <Badge variant="success">Intake prepped</Badge>
                          )}
                          {emg.status === 'arrived' && (
                            <Badge variant="neutral">At Bay — Handoff ready</Badge>
                          )}
                          {emg.status === 'doctor_assigned' && (
                            <Badge variant="info">Doctor Standby</Badge>
                          )}
                          {emg.status === 'vitals_streaming' && (
                            <Badge variant="green">Streaming Telemetry</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incoming Ambulance Live route Map */}
          {activeIncoming && (
            <Card className="border-slate-200">
              <LiveMap 
                emergency={activeIncoming} 
                hospitals={hospitals} 
                ambulances={ambulances} 
              />
            </Card>
          )}

        </div>

        {/* Right Side: Telemetry details and bay actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Intake details */}
          {activeIncoming ? (
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="bg-slate-900 text-white pb-3">
                <CardTitle className="text-white text-xs font-semibold uppercase tracking-wider">
                  Live Intake Console: #{activeIncoming.id.slice(-4).toUpperCase()}
                </CardTitle>
                <CardDescription className="text-slate-400 text-[10px]">
                  Clinical state prepped at {new Date(activeIncoming.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-xs">
                
                {/* Vitals Overview Grid */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live IoT Telemetry</h5>
                  {activeIncoming.vitals ? (
                    <div className="grid grid-cols-2 gap-3.5 font-semibold text-slate-800">
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 text-red-600">
                          <Activity className="w-3.5 h-3.5" />
                          <span>HR</span>
                        </div>
                        <span>{activeIncoming.vitals.heartRate} bpm</span>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <Activity className="w-3.5 h-3.5" />
                          <span>SpO2</span>
                        </div>
                        <span className={activeIncoming.vitals.spo2 < 90 ? 'text-red-600 font-bold' : ''}>
                          {activeIncoming.vitals.spo2}%
                        </span>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded flex items-center justify-between gap-1.5 col-span-2">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Activity className="w-3.5 h-3.5" />
                          <span>BP</span>
                        </div>
                        <span>{activeIncoming.vitals.bloodPressureSystolic}/{activeIncoming.vitals.bloodPressureDiastolic} mmHg</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[11px]">Sensor telemetry offline...</div>
                  )}
                </div>

                {/* AI Justification info */}
                {activeIncoming.triage && (
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Clinical Classification</h5>
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md text-[11px] leading-relaxed text-blue-900 font-medium">
                      <span className="font-bold block text-slate-800 mb-0.5">Recommended Actions:</span>
                      {activeIncoming.triage.recommendedAction}
                    </div>
                  </div>
                )}

                {/* Specialist and doctor stand-by coordinator */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intake specialist Assignment</h5>
                  
                  {activeIncoming.doctorId ? (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md font-semibold flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>{doctors.find(d => d.id === activeIncoming.doctorId)?.name} Standby</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label htmlFor="docSelect">Assign Specialist Doctor</Label>
                      <Select 
                        id="docSelect" 
                        defaultValue="" 
                        onChange={e => {
                          if (e.target.value) assignDoctor(activeIncoming.id, e.target.value);
                        }}
                      >
                        <option value="" disabled>Select On-Call Specialist</option>
                        {hospitalDoctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} (Specialist)
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>

                {/* Action panel triggers */}
                <div className="space-y-2 border-t border-slate-100 pt-3 flex flex-col gap-2">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intake actions</h5>
                  
                  {activeIncoming.status === 'hospital_assigned' || activeIncoming.status === 'doctor_assigned' || activeIncoming.status === 'vitals_streaming' ? (
                    <Button 
                      variant="success" 
                      onClick={() => setHospitalReady(activeIncoming.id)}
                      className="w-full font-bold cursor-pointer h-9 text-xs"
                    >
                      Acknowledge Case & Secure ER Bay
                    </Button>
                  ) : activeIncoming.status === 'hospital_ready' ? (
                    <div className="p-3 border border-emerald-100 bg-emerald-50/50 text-emerald-800 rounded-lg text-center font-bold text-[11px] leading-relaxed">
                      ✓ Emergency trauma bay is secured. Doctor & nurses stand by at ER doors. ETA countdown active.
                    </div>
                  ) : activeIncoming.status === 'arrived' ? (
                    <div className="space-y-2">
                      <div className="p-2 border border-slate-200 bg-slate-50 text-slate-700 rounded text-center text-[10px] font-mono leading-relaxed">
                        Patient has arrived. Complete physical handoff and admit to clinical registry.
                      </div>
                      <Button
                        variant="success"
                        onClick={() => completeCase(activeIncoming.id)}
                        className="w-full font-black cursor-pointer h-10 text-xs"
                      >
                        Admit Patient & Clear Ambulance
                      </Button>
                    </div>
                  ) : null}
                </div>

              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 p-6 text-center text-xs text-slate-400">
              No active intake selected. Click an incoming patient on the left.
            </Card>
          )}

        </div>

      </main>

      <FloatingAIAssistant />
    </div>
  );
}
