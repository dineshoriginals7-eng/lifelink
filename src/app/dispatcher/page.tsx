'use client';

import React, { useState, useEffect } from 'react';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { Navigation } from '@/components/Navigation';
import { LiveMap } from '@/components/maps/LiveMap';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Badge, Label } from '@/components/ui/Primitives';
import { FloatingAIAssistant } from '@/components/ai-assistant/Chat';
import { 
  PlusCircle, 
  MapPin, 
  Truck, 
  Activity, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { recommendHospitals } from '@/lib/hospital-selector';

export default function DispatcherPage() {
  const { 
    currentUser, 
    loginAs,
    emergencies, 
    ambulances, 
    hospitals, 
    createEmergency, 
    assignAmbulance 
  } = useEmergencyStore();

  // Route protection / default login
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'dispatcher') {
      loginAs('dispatcher');
    }
  }, [currentUser, loginAs]);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [symptoms, setSymptoms] = useState('Chest Pain');
  const [consciousness, setConsciousness] = useState<'Conscious' | 'Semi-Conscious' | 'Unconscious'>('Conscious');
  const [locationName, setLocationName] = useState('Central Park Carousel');
  const [lat, setLat] = useState(40.7680);
  const [lng, setLng] = useState(-73.9710);
  const [accidentType, setAccidentType] = useState<string>('');

  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(null);

  // Set default active emergency ID to follow on map
  useEffect(() => {
    const active = emergencies.find(e => e.status !== 'completed');
    if (active) {
      setActiveEmergencyId(active.id);
    } else if (emergencies.length > 0) {
      setActiveEmergencyId(emergencies[0].id);
    }
  }, [emergencies]);

  const activeEmergency = emergencies.find(e => e.id === activeEmergencyId);

  const handleCreateEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !locationName) return;

    const id = createEmergency({
      patientName,
      patientDetails: {
        age,
        gender,
        symptoms: [symptoms],
        consciousness,
        painLevel: symptoms === 'Chest Pain' ? 8 : 4,
        knownDiseases: symptoms === 'Chest Pain' ? ['Hypertension'] : [],
        accidentType: accidentType || undefined
      },
      incidentLocationName: locationName,
      incidentLat: lat,
      incidentLng: lng,
      dispatcherId: currentUser?.id || 'usr-dispatcher'
    });

    setActiveEmergencyId(id);

    // Reset Form
    setPatientName('');
    setLocationName('Times Square Terminal');
    setLat(40.7580);
    setLng(-73.9855);
    setAccidentType('');
  };

  // Find recommended nearest ambulances for the active incident
  const getNearestAmbulances = () => {
    if (!activeEmergency) return [];
    
    return ambulances
      .filter(a => a.status === 'available')
      .map(amb => {
        // Calculate haversine distance
        const R = 6371;
        const dLat = ((activeEmergency.incidentLat - amb.currentLat) * Math.PI) / 180;
        const dLon = ((activeEmergency.incidentLng - amb.currentLng) * Math.PI) / 180;
        const aVal =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((amb.currentLat * Math.PI) / 180) *
            Math.cos((activeEmergency.incidentLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const cVal = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
        const distance = Number((R * cVal).toFixed(1));
        const eta = Math.max(3, Math.round(distance * 1.5 + 2));
        
        return {
          ...amb,
          distance,
          eta
        };
      })
      .sort((a, b) => a.distance - b.distance);
  };

  const nearestAmbulances = getNearestAmbulances();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Live Tracking Map & Emergency Grid */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200">
            <LiveMap 
              emergency={activeEmergency} 
              hospitals={hospitals} 
              ambulances={ambulances} 
            />
          </Card>

          {/* Active Incidents Panel */}
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50/50 pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Active Emergency Operations</span>
              </CardTitle>
              <CardDescription>
                Live monitoring of logged, dispatched, and enroute EMS incidents.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {emergencies.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-mono">
                  No emergency operations currently active. Log an incident on the right to start.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {emergencies.map(emg => {
                    const assignedAmb = ambulances.find(a => a.id === emg.ambulanceId);
                    const assignedHosp = hospitals.find(h => h.id === emg.hospitalId);

                    return (
                      <div 
                        key={emg.id}
                        onClick={() => setActiveEmergencyId(emg.id)}
                        className={`p-4 hover:bg-slate-50/70 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${
                          activeEmergencyId === emg.id ? 'bg-blue-50/20 border-l-primary' : 'border-l-transparent'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">
                              #{emg.id.slice(-4).toUpperCase()} — {emg.patientName}
                            </span>
                            <Badge variant={
                              emg.triage?.level === 'critical' ? 'critical' :
                              emg.triage?.level === 'red' ? 'red' :
                              emg.triage?.level === 'orange' ? 'orange' :
                              emg.triage?.level === 'yellow' ? 'yellow' : 'green'
                            }>
                              {emg.triage?.level.toUpperCase() || 'TRIAGE PENDING'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {emg.incidentLocationName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> ETA: {emg.etaMinutes ? `${emg.etaMinutes}m` : '--'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {emg.status === 'created' ? (
                            <Badge variant="warning">Awaiting Ambulance Dispatch</Badge>
                          ) : emg.status === 'assigned' || emg.status === 'accepted' ? (
                            <Badge variant="info">Ambulance {assignedAmb?.code} Enroute</Badge>
                          ) : emg.status === 'vitals_streaming' ? (
                            <Badge variant="green">Vitals Streaming ({emg.vitals?.heartRate} HR)</Badge>
                          ) : emg.status === 'hospital_assigned' || emg.status === 'doctor_assigned' ? (
                            <Badge variant="green">Heading to {assignedHosp?.name.split(' ').slice(0, 2).join(' ')}</Badge>
                          ) : emg.status === 'hospital_ready' ? (
                            <Badge variant="success">Hospital Prepared</Badge>
                          ) : emg.status === 'arrived' ? (
                            <Badge variant="neutral">At ER Bay</Badge>
                          ) : emg.status === 'completed' ? (
                            <Badge variant="neutral">Completed Case</Badge>
                          ) : (
                            <Badge variant="neutral">{emg.status.toUpperCase()}</Badge>
                          )}
                          <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Log Form & Nearest Ambulance recommendations */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Create Incident Card */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="bg-slate-50/50 pb-3">
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                <span>Log 911 Call (New Incident)</span>
              </CardTitle>
              <CardDescription>
                Record patient details and lock coordinates to trigger nearest EMS matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEmergency} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="pname">Patient Name</Label>
                    <Input 
                      id="pname" 
                      placeholder="e.g. John Doe" 
                      value={patientName} 
                      onChange={e => setPatientName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="page">Patient Age</Label>
                    <Input 
                      id="page" 
                      type="number" 
                      min="1" 
                      max="120"
                      value={age} 
                      onChange={e => setAge(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="pgender">Gender</Label>
                    <Select id="pgender" value={gender} onChange={e => setGender(e.target.value as any)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pconsciousness">Consciousness</Label>
                    <Select id="pconsciousness" value={consciousness} onChange={e => setConsciousness(e.target.value as any)}>
                      <option value="Conscious">Conscious</option>
                      <option value="Semi-Conscious">Semi-Conscious</option>
                      <option value="Unconscious">Unconscious</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="psymptom">Primary Incident Symptom</Label>
                  <Select id="psymptom" value={symptoms} onChange={e => setSymptoms(e.target.value)}>
                    <option value="Chest Pain">Chest Pain / Cardiac Arrest</option>
                    <option value="Stroke Symptoms">Altered Speech / Stroke (Numbness)</option>
                    <option value="Shortness of Breath">Severe Breathlessness / Asthma</option>
                    <option value="Severe Bleeding">Severe Bleeding / Trauma</option>
                    <option value="Motorcycle Accident">Road Traffic Accident / Trauma</option>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ploc">Incident Location / Coordinates</Label>
                  <div className="grid grid-cols-12 gap-2">
                    <Input 
                      id="ploc" 
                      placeholder="Location Name" 
                      value={locationName} 
                      onChange={e => setLocationName(e.target.value)}
                      className="col-span-7"
                      required
                    />
                    <Input 
                      placeholder="Lat" 
                      type="number"
                      step="0.0001"
                      value={lat} 
                      onChange={e => setLat(Number(e.target.value))}
                      className="col-span-2.5 px-1 text-center text-xs"
                      required
                    />
                    <Input 
                      placeholder="Lng" 
                      type="number"
                      step="0.0001"
                      value={lng} 
                      onChange={e => setLng(Number(e.target.value))}
                      className="col-span-2.5 px-1 text-center text-xs"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full font-bold cursor-pointer">
                  Register Incident & Score Triage
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Dispatch Assignment Panel */}
          {activeEmergency && (
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="bg-slate-50/50 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>Ambulance Dispatch Engine</span>
                </CardTitle>
                <CardDescription>
                  Select and assign nearest available ambulance to Case #{activeEmergency.id.slice(-4).toUpperCase()}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeEmergency.status !== 'created' ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 border border-emerald-100">
                    <UserCheck className="w-4 h-4" />
                    <span>Ambulance has already been dispatched to this case.</span>
                  </div>
                ) : nearestAmbulances.length === 0 ? (
                  <div className="text-center p-6 text-xs text-slate-400">
                    No available ambulances. All vehicles currently assigned or offline.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nearest Recommendations</p>
                    {nearestAmbulances.slice(0, 3).map(amb => (
                      <div 
                        key={amb.id}
                        className="p-3 border border-slate-200/80 rounded-lg flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-white transition-all shadow-xs"
                      >
                        <div className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{amb.code}</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">AVAILABLE</span>
                          </div>
                          <p className="text-slate-500 text-[10px] mt-0.5">Crew: {amb.paramedics[0]}</p>
                          <p className="text-[9px] text-primary font-mono mt-0.5">
                            Distance: {amb.distance} km • ETA: {amb.eta} mins
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => assignAmbulance(activeEmergency.id, amb.id)}
                          className="px-3 py-1 text-xs shrink-0 cursor-pointer font-bold"
                        >
                          Dispatch
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

      </main>

      <FloatingAIAssistant />
    </div>
  );
}
