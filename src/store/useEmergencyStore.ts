import { create } from 'zustand';
import { 
  Emergency, 
  Hospital, 
  Ambulance, 
  User, 
  SystemNotification, 
  Vitals, 
  Patient, 
  EmergencyStatus,
  TriageResult,
  TimelineEvent,
  VoiceNote,
  UserRole
} from '@/types';
import { runAITriage } from '@/lib/triage-engine';
import { recommendHospitals } from '@/lib/hospital-selector';
import { parseVoiceDictation } from '@/lib/voice-parser';

// Seed data
// Seed data for Hospitals Database
const initialHospitals: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'City Central Trauma Center',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
    address: '450 First Ave, New York, NY 10016',
    lat: 40.7384,
    lng: -73.9788,
    contactNumber: '+1 (555) 101-2000',
    email: 'er-intake@citycentral.org',
    emergencyContact: '+1 (800) 911-CITY',
    hospitalType: 'Trauma Center',
    tier: 'Tier 1',
    trafficDensity: 'Heavy Traffic',
    icuBedsTotal: 30,
    icuBedsAvailable: 8,
    erBedsTotal: 50,
    erBedsAvailable: 12,
    ventilatorsTotal: 25,
    ventilatorsAvailable: 5,
    specialists: ['Cardiologist', 'Neurologist', 'Trauma Surgeon', 'Pediatrician'],
    capacity: 78,
    currentEmergencyLoad: 'medium',
    rating: 4.9,
    avgResponseTime: 3.8,
    emergencyReadiness: 'Ready'
  },
  {
    id: 'hosp-2',
    name: 'Mercy Cardiovascular Institute',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    address: '1000 Tenth Ave, New York, NY 10019',
    lat: 40.7684,
    lng: -73.9878,
    contactNumber: '+1 (555) 202-3000',
    email: 'cardiac-er@mercycardio.org',
    emergencyContact: '+1 (800) 911-MERCY',
    hospitalType: 'Specialty Hospital',
    tier: 'Tier 2',
    trafficDensity: 'Moderate Traffic',
    icuBedsTotal: 20,
    icuBedsAvailable: 4,
    erBedsTotal: 35,
    erBedsAvailable: 9,
    ventilatorsTotal: 15,
    ventilatorsAvailable: 3,
    specialists: ['Cardiologist', 'Trauma Surgeon'],
    capacity: 65,
    currentEmergencyLoad: 'low',
    rating: 4.8,
    avgResponseTime: 4.2,
    emergencyReadiness: 'Ready'
  },
  {
    id: 'hosp-3',
    name: 'St. Jude Neurology & Stroke Hospital',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    address: '350 E 17th St, New York, NY 10003',
    lat: 40.7335,
    lng: -73.9830,
    contactNumber: '+1 (555) 303-4000',
    email: 'stroke-triage@stjudehealth.org',
    emergencyContact: '+1 (800) 911-JUDE',
    hospitalType: 'Private',
    tier: 'Tier 1',
    trafficDensity: 'Heavy Traffic',
    icuBedsTotal: 15,
    icuBedsAvailable: 1,
    erBedsTotal: 25,
    erBedsAvailable: 2,
    ventilatorsTotal: 10,
    ventilatorsAvailable: 1,
    specialists: ['Neurologist'],
    capacity: 92,
    currentEmergencyLoad: 'high',
    rating: 4.7,
    avgResponseTime: 5.5,
    emergencyReadiness: 'Busy'
  },
  {
    id: 'hosp-4',
    name: 'Brooklyn General Hospital',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    address: '506 6th St, Brooklyn, NY 11215',
    lat: 40.6685,
    lng: -73.9812,
    contactNumber: '+1 (555) 404-5000',
    email: 'triage@brooklyngeneral.org',
    emergencyContact: '+1 (800) 911-BKLYN',
    hospitalType: 'Government',
    tier: 'Tier 3',
    trafficDensity: 'Clear Roads',
    icuBedsTotal: 40,
    icuBedsAvailable: 15,
    erBedsTotal: 60,
    erBedsAvailable: 22,
    ventilatorsTotal: 30,
    ventilatorsAvailable: 12,
    specialists: ['Trauma Surgeon', 'Pediatrician', 'Cardiologist'],
    capacity: 55,
    currentEmergencyLoad: 'low',
    rating: 4.6,
    avgResponseTime: 3.5,
    emergencyReadiness: 'Ready'
  }
];

const initialAmbulances: Ambulance[] = [
  {
    id: 'amb-1',
    code: 'AMB-101',
    plateNumber: 'NY-EMG-101',
    status: 'available',
    currentLat: 40.7250,
    currentLng: -73.9950,
    driverName: 'Marcus Vance',
    paramedics: ['Sarah Jenkins', 'Toby Miller'],
    speed: 0,
    heading: 90,
    oxygenLevel: 98
  },
  {
    id: 'amb-2',
    code: 'AMB-102',
    plateNumber: 'NY-EMG-102',
    status: 'available',
    currentLat: 40.7520,
    currentLng: -73.9650,
    driverName: 'Danielle Carter',
    paramedics: ['Alex Wong', 'Leah Davies'],
    speed: 0,
    heading: 180,
    oxygenLevel: 96
  },
  {
    id: 'amb-3',
    code: 'AMB-103',
    plateNumber: 'NY-EMG-103',
    status: 'available',
    currentLat: 40.7110,
    currentLng: -73.9550,
    driverName: 'Robert Diaz',
    paramedics: ['Jack Kelly', 'Monica Gellar'],
    speed: 0,
    heading: 270,
    oxygenLevel: 94
  },
  {
    id: 'amb-4',
    code: 'AMB-104',
    plateNumber: 'NY-EMG-104',
    status: 'offline',
    currentLat: 40.7850,
    currentLng: -73.9720,
    driverName: 'Vikram Patel',
    paramedics: ['Clara Oswald', 'Danny Pink'],
    speed: 0,
    heading: 0,
    oxygenLevel: 99
  }
];

const initialDoctors: User[] = [
  { id: 'doc-1', name: 'Dr. Evelyn Mercer', email: 'evelyn.mercer@lifelink.ai', role: 'doctor', hospitalId: 'hosp-1' },
  { id: 'doc-2', name: 'Dr. Julian Subin', email: 'julian.subin@lifelink.ai', role: 'doctor', hospitalId: 'hosp-1' },
  { id: 'doc-3', name: 'Dr. Sarah Chen', email: 'sarah.chen@lifelink.ai', role: 'doctor', hospitalId: 'hosp-2' },
  { id: 'doc-4', name: 'Dr. Alan Grant', email: 'alan.grant@lifelink.ai', role: 'doctor', hospitalId: 'hosp-3' },
  { id: 'doc-5', name: 'Dr. Ellie Sattler', email: 'ellie.sattler@lifelink.ai', role: 'doctor', hospitalId: 'hosp-4' }
];

const initialNotifications: SystemNotification[] = [
  {
    id: 'notif-1',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    title: 'Ambulance 101 Online',
    message: 'Ambulance AMB-101 has reported online and is available for dispatch.',
    type: 'success',
    role: 'dispatcher',
    isRead: false
  },
  {
    id: 'notif-2',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    title: 'Hospital Capacity Alert',
    message: 'St. Jude Neurology & Stroke ER load is high. Available beds: 2.',
    type: 'warning',
    role: 'all',
    isRead: false
  }
];

interface EmergencyState {
  // Database Collections
  currentUser: User | null;
  emergencies: Emergency[];
  hospitals: Hospital[];
  ambulances: Ambulance[];
  doctors: User[];
  notifications: SystemNotification[];
  simulationIntervals: Record<string, NodeJS.Timeout>;

  // Actions
  loginAs: (role: UserRole, userDetails?: Partial<User>) => void;
  logout: () => void;
  
  // Emergency Workflow Actions
  createEmergency: (data: {
    patientName: string;
    patientDetails: Partial<Patient>;
    incidentLocationName: string;
    incidentLat: number;
    incidentLng: number;
    dispatcherId: string;
  }) => string;

  assignAmbulance: (emergencyId: string, ambulanceId: string) => void;
  acceptEmergency: (emergencyId: string) => void;
  updateVitals: (emergencyId: string, vitals: Vitals) => void;
  addVoiceNote: (emergencyId: string, text: string) => void;
  assignHospital: (emergencyId: string, hospitalId: string) => void;
  assignDoctor: (emergencyId: string, doctorId: string) => void;
  setHospitalReady: (emergencyId: string) => void;
  markArrived: (emergencyId: string) => void;
  markTreatmentStarted: (emergencyId: string) => void;
  completeCase: (emergencyId: string) => void;
  
  // Hospital/Ambulance updates (Admin controls)
  updateHospitalBeds: (hospitalId: string, updates: Partial<Hospital>) => void;
  addHospital: (hospital: Omit<Hospital, 'id'>) => void;
  addAmbulance: (ambulance: Omit<Ambulance, 'id'>) => void;
  
  // Real-time Simulation Drivers
  startTelemetrySimulation: (emergencyId: string) => void;
  stopTelemetrySimulation: (emergencyId: string) => void;
  triggerMockVitalsDrop: (emergencyId: string) => void;

  // Notifications
  addNotification: (title: string, message: string, type: SystemNotification['type'], role: UserRole | 'all', emergencyId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  currentUser: null,
  emergencies: [],
  hospitals: initialHospitals,
  ambulances: initialAmbulances,
  doctors: initialDoctors,
  notifications: initialNotifications,
  simulationIntervals: {},

  loginAs: (role, userDetails) => {
    let mockUser: User = {
      id: `usr-${role}`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} Agent`,
      email: `${role}@lifelink.ai`,
      role,
      ...userDetails
    };
    if (role === 'doctor') {
      mockUser.hospitalId = 'hosp-1';
      mockUser.name = 'Dr. Evelyn Mercer';
    } else if (role === 'hospital') {
      mockUser.hospitalId = 'hosp-1';
      mockUser.name = 'City Central Admin';
    } else if (role === 'ambulance') {
      mockUser.ambulanceId = 'amb-1';
      mockUser.name = 'Sarah Paramedic';
    }
    set({ currentUser: mockUser });
  },

  logout: () => set({ currentUser: null }),

  createEmergency: (data) => {
    const id = `emg-${Math.random().toString(36).substr(2, 9)}`;
    const timelineEvent: TimelineEvent = {
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      title: 'Emergency Incident Reported',
      description: `Incident logged at ${data.incidentLocationName}. Patient Name: ${data.patientName}.`,
      role: 'dispatcher',
      status: 'created'
    };

    const patientFull: Patient = {
      id: `pat-${Math.random().toString(36).substr(2, 9)}`,
      name: data.patientName,
      age: data.patientDetails.age || 40,
      gender: data.patientDetails.gender || 'Male',
      weight: data.patientDetails.weight || 75,
      knownDiseases: data.patientDetails.knownDiseases || [],
      allergies: data.patientDetails.allergies || [],
      currentMedications: data.patientDetails.currentMedications || [],
      symptoms: data.patientDetails.symptoms || [],
      consciousness: data.patientDetails.consciousness || 'Conscious',
      painLevel: data.patientDetails.painLevel || 5,
      accidentType: data.patientDetails.accidentType
    };

    // Initial stable vitals
    const initialVitals: Vitals = {
      heartRate: 82,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      temperature: 36.8,
      spo2: 98,
      respiratoryRate: 16,
      bloodSugar: 100,
      timestamp: new Date().toISOString(),
      ecgWave: [0, 0, 0.2, -0.1, 1.2, -0.3, 0.1, 0, 0]
    };

    const triage = runAITriage(patientFull, initialVitals);

    const newEmergency: Emergency = {
      id,
      status: 'created',
      patientId: patientFull.id,
      patientName: patientFull.name,
      patientDetails: patientFull,
      dispatcherId: data.dispatcherId,
      incidentLat: data.incidentLat,
      incidentLng: data.incidentLng,
      incidentLocationName: data.incidentLocationName,
      vitals: initialVitals,
      vitalsHistory: [initialVitals],
      triage,
      voiceNotes: [],
      timeline: [timelineEvent],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set(state => ({
      emergencies: [newEmergency, ...state.emergencies]
    }));

    get().addNotification(
      'New Emergency Created',
      `Emergency #${id.slice(-4).toUpperCase()} at ${data.incidentLocationName} classified as ${triage.level.toUpperCase()}`,
      triage.level === 'critical' || triage.level === 'red' ? 'error' : 'warning',
      'all',
      id
    );

    return id;
  },

  assignAmbulance: (emergencyId, ambulanceId) => {
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      const ambulance = state.ambulances.find(a => a.id === ambulanceId);
      if (!emergency || !ambulance) return {};

      const timestamp = new Date().toISOString();
      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Ambulance Dispatched',
        description: `Ambulance ${ambulance.code} (${ambulance.driverName}) assigned to incident.`,
        role: 'dispatcher',
        status: 'assigned'
      };

      const updatedEmergencies = state.emergencies.map(e => {
        if (e.id === emergencyId) {
          // Calculate distance and route
          const distanceKm = recommendHospitals(e.incidentLat, e.incidentLng, e.patientDetails || {}, e.triage?.level || 'green', [
            { id: 'temp', name: '', address: '', lat: ambulance.currentLat, lng: ambulance.currentLng } as Hospital
          ])[0].distanceKm;

          // Simple linear route interpolation between Ambulance and Patient
          const steps = 15;
          const routeCoordinates: [number, number][] = [];
          for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            routeCoordinates.push([
              ambulance.currentLat + (e.incidentLat - ambulance.currentLat) * ratio,
              ambulance.currentLng + (e.incidentLng - ambulance.currentLng) * ratio
            ]);
          }

          return {
            ...e,
            status: 'assigned' as EmergencyStatus,
            ambulanceId,
            distanceKm,
            etaMinutes: Math.round(distanceKm * 1.5 + 3),
            routeCoordinates,
            timeline: [...e.timeline, timelineEvent],
            updatedAt: timestamp
          };
        }
        return e;
      });

      const updatedAmbulances = state.ambulances.map(a => 
        a.id === ambulanceId ? { ...a, status: 'assigned' as const } : a
      );

      return {
        emergencies: updatedEmergencies,
        ambulances: updatedAmbulances
      };
    });

    const emergency = get().emergencies.find(e => e.id === emergencyId);
    const ambulance = get().ambulances.find(a => a.id === ambulanceId);
    if (emergency && ambulance) {
      get().addNotification(
        'Ambulance Dispatched',
        `Ambulance ${ambulance.code} assigned to Case #${emergencyId.slice(-4).toUpperCase()}`,
        'info',
        'ambulance',
        emergencyId
      );
    }
  },

  acceptEmergency: (emergencyId) => {
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency) return {};

      const timestamp = new Date().toISOString();
      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Emergency Accepted by Paramedics',
        description: `Ambulance crew has accepted the emergency call and is enroute.`,
        role: 'ambulance',
        status: 'accepted'
      };

      const updatedEmergencies = state.emergencies.map(e => 
        e.id === emergencyId 
          ? { ...e, status: 'accepted' as EmergencyStatus, timeline: [...e.timeline, timelineEvent], updatedAt: timestamp }
          : e
      );

      return { emergencies: updatedEmergencies };
    });

    get().addNotification(
      'Emergency Accepted',
      `Ambulance Crew accepted Case #${emergencyId.slice(-4).toUpperCase()}`,
      'success',
      'dispatcher',
      emergencyId
    );

    // Auto trigger streaming telemetry simulation
    get().startTelemetrySimulation(emergencyId);
  },

  updateVitals: (emergencyId, vitals) => {
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency) return {};

      const history = [...emergency.vitalsHistory, vitals].slice(-30); // Keep last 30 readings
      const triage = runAITriage(emergency.patientDetails || {}, vitals);
      const timestamp = new Date().toISOString();
      
      let timeline = emergency.timeline;
      // If status transitions to vitals_streaming, log it
      if (emergency.status === 'accepted') {
        timeline = [...timeline, {
          id: `evt-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          title: 'Vitals Telemetry Streaming Started',
          description: `Live Patient Telemetry connected. AI Assisted Triage activated.`,
          role: 'ai',
          status: 'vitals_streaming'
        }];
      }

      // Check if triage level increased to Critical / Red, raise alert
      if (emergency.triage && triage.level !== emergency.triage.level && ['red', 'critical'].includes(triage.level)) {
        setTimeout(() => {
          get().addNotification(
            `CRITICAL PATIENT STATUS: ${triage.level.toUpperCase()}`,
            `Patient status in Case #${emergencyId.slice(-4).toUpperCase()} degraded. AI recommendations updated.`,
            'error',
            'all',
            emergencyId
          );
        }, 10);
      }

      const updatedEmergencies = state.emergencies.map(e => 
        e.id === emergencyId 
          ? { 
              ...e, 
              vitals, 
              vitalsHistory: history, 
              triage, 
              status: e.status === 'accepted' ? 'vitals_streaming' : e.status,
              timeline,
              updatedAt: timestamp 
            }
          : e
      );

      return { emergencies: updatedEmergencies };
    });
  },

  addVoiceNote: (emergencyId, text) => {
    // Dynamic text parser to extract fields
    const { patient: parsedPatient, vitals: parsedVitals } = parseVoiceDictation(text);

    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency) return {};

      const timestamp = new Date().toISOString();
      const newVoiceNote: VoiceNote = {
        id: `vn-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        transcript: text,
        parsedFields: { ...parsedPatient, ...parsedVitals }
      };

      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Paramedic Voice Log Recorded',
        description: `Voice transmission: "${text.slice(0, 50)}..."`,
        role: 'ambulance',
        status: emergency.status
      };

      // Merge patient details
      const mergedPatient = {
        ...(emergency.patientDetails || {}),
        ...parsedPatient,
        symptoms: Array.from(new Set([...(emergency.patientDetails?.symptoms || []), ...(parsedPatient.symptoms || [])])),
        knownDiseases: Array.from(new Set([...(emergency.patientDetails?.knownDiseases || []), ...(parsedPatient.knownDiseases || [])]))
      } as Patient;

      // Merge vitals if parsed
      const mergedVitals = parsedVitals.heartRate ? {
        ...(emergency.vitals || {}),
        ...parsedVitals,
        timestamp
      } as Vitals : emergency.vitals;

      const updatedEmergencies = state.emergencies.map(e => {
        if (e.id === emergencyId) {
          const triage = mergedVitals ? runAITriage(mergedPatient, mergedVitals) : e.triage;
          return {
            ...e,
            voiceNotes: [...e.voiceNotes, newVoiceNote],
            patientDetails: mergedPatient,
            vitals: mergedVitals,
            triage,
            timeline: [...e.timeline, timelineEvent],
            updatedAt: timestamp
          };
        }
        return e;
      });

      return { emergencies: updatedEmergencies };
    });

    get().addNotification(
      'Voice Note Parsed',
      `Voice log processed for Case #${emergencyId.slice(-4).toUpperCase()}. Patient record updated.`,
      'info',
      'all',
      emergencyId
    );
  },

  assignHospital: (emergencyId, hospitalId) => {
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      const hospital = state.hospitals.find(h => h.id === hospitalId);
      if (!emergency || !hospital) return {};

      const timestamp = new Date().toISOString();
      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Receiving Hospital Selected',
        description: `${hospital.name} locked in as destination. Routing updated.`,
        role: 'system',
        status: 'hospital_assigned'
      };

      // Redraw route from ambulance current coordinates towards hospital coordinates
      const ambulance = state.ambulances.find(a => a.id === emergency.ambulanceId);
      const currentLat = ambulance ? ambulance.currentLat : emergency.incidentLat;
      const currentLng = ambulance ? ambulance.currentLng : emergency.incidentLng;
      
      const distanceKm = recommendHospitals(currentLat, currentLng, {}, 'green', [hospital])[0].distanceKm;
      
      const steps = 25;
      const routeCoordinates: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        routeCoordinates.push([
          currentLat + (hospital.lat - currentLat) * ratio,
          currentLng + (hospital.lng - currentLng) * ratio
        ]);
      }

      const updatedEmergencies = state.emergencies.map(e => 
        e.id === emergencyId 
          ? { 
              ...e, 
              hospitalId, 
              status: 'hospital_assigned' as EmergencyStatus,
              distanceKm,
              etaMinutes: Math.round(distanceKm * 1.5 + 2),
              routeCoordinates,
              timeline: [...e.timeline, timelineEvent], 
              updatedAt: timestamp 
            }
          : e
      );

      return { emergencies: updatedEmergencies };
    });

    const hospital = get().hospitals.find(h => h.id === hospitalId);
    if (hospital) {
      get().addNotification(
        'Incoming Emergency Alert',
        `Hospital assigned. Case #${emergencyId.slice(-4).toUpperCase()} enroute to ${hospital.name}`,
        'warning',
        'hospital',
        emergencyId
      );
    }
  },

  assignDoctor: (emergencyId, doctorId) => {
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      const doctor = state.doctors.find(d => d.id === doctorId);
      if (!emergency || !doctor) return {};

      const timestamp = new Date().toISOString();
      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Trauma Specialist Assigned',
        description: `${doctor.name} (${doctor.email}) assigned to prepare clinical treatment.`,
        role: 'hospital',
        status: 'doctor_assigned'
      };

      const updatedEmergencies = state.emergencies.map(e => 
        e.id === emergencyId 
          ? { ...e, doctorId, status: 'doctor_assigned' as EmergencyStatus, timeline: [...e.timeline, timelineEvent], updatedAt: timestamp }
          : e
      );

      return { emergencies: updatedEmergencies };
    });

    get().addNotification(
      'Doctor Assigned',
      `Dr. ${get().doctors.find(d => d.id === doctorId)?.name.split(' ').slice(-1)} assigned to Patient.`,
      'info',
      'doctor',
      emergencyId
    );
  },

  setHospitalReady: (emergencyId) => {
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency) return {};

      const timestamp = new Date().toISOString();
      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Emergency Bay Ready',
        description: `ER Team confirmed preparedness: bed secured, ventilator checked, specialists ready.`,
        role: 'hospital',
        status: 'hospital_ready'
      };

      const updatedEmergencies = state.emergencies.map(e => 
        e.id === emergencyId 
          ? { ...e, status: 'hospital_ready' as EmergencyStatus, timeline: [...e.timeline, timelineEvent], updatedAt: timestamp }
          : e
      );

      return { emergencies: updatedEmergencies };
    });

    get().addNotification(
      'Hospital Ready',
      `Emergency Bay prepared. Trauma bay stands ready.`,
      'success',
      'ambulance',
      emergencyId
    );
  },

  markArrived: (emergencyId) => {
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency) return {};

      const timestamp = new Date().toISOString();
      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Ambulance Arrived at ER',
        description: `Patient handoff in progress. Telemetry offline soon.`,
        role: 'ambulance',
        status: 'arrived'
      };

      const updatedEmergencies = state.emergencies.map(e => 
        e.id === emergencyId 
          ? { ...e, status: 'arrived' as EmergencyStatus, etaMinutes: 0, distanceKm: 0, timeline: [...e.timeline, timelineEvent], updatedAt: timestamp }
          : e
      );

      return { emergencies: updatedEmergencies };
    });

    get().addNotification(
      'Ambulance Arrived',
      `Case #${emergencyId.slice(-4).toUpperCase()} arrived at ER trauma bay.`,
      'success',
      'all',
      emergencyId
    );
  },

  markTreatmentStarted: (emergencyId) => {
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency) return {};

      const timestamp = new Date().toISOString();
      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Clinical Treatment Initiated',
        description: `Physician treatment started. Patient stabilized.`,
        role: 'doctor',
        status: 'treatment_started'
      };

      const updatedEmergencies = state.emergencies.map(e => 
        e.id === emergencyId 
          ? { ...e, status: 'treatment_started' as EmergencyStatus, timeline: [...e.timeline, timelineEvent], updatedAt: timestamp }
          : e
      );

      return { emergencies: updatedEmergencies };
    });
  },

  completeCase: (emergencyId) => {
    get().stopTelemetrySimulation(emergencyId);

    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency) return {};

      const timestamp = new Date().toISOString();
      const timelineEvent: TimelineEvent = {
        id: `evt-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title: 'Emergency Admitted & Case Closed',
        description: `Handoff complete. Case archived in EMR records.`,
        role: 'system',
        status: 'completed'
      };

      const updatedEmergencies = state.emergencies.map(e => 
        e.id === emergencyId 
          ? { ...e, status: 'completed' as EmergencyStatus, timeline: [...e.timeline, timelineEvent], updatedAt: timestamp }
          : e
      );

      // Free up the ambulance
      const updatedAmbulances = state.ambulances.map(a => 
        a.id === emergency.ambulanceId ? { ...a, status: 'available' as const } : a
      );

      // Free up one ER/ICU bed slightly (mock utilization adjustment)
      const updatedHospitals = state.hospitals.map(h => {
        if (h.id === emergency.hospitalId) {
          return {
            ...h,
            icuBedsAvailable: Math.max(0, h.icuBedsAvailable - 1), // Patient took a bed
            erBedsAvailable: Math.max(0, h.erBedsAvailable - 1)
          };
        }
        return h;
      });

      return { 
        emergencies: updatedEmergencies,
        ambulances: updatedAmbulances,
        hospitals: updatedHospitals
      };
    });

    get().addNotification(
      'Case Completed',
      `Emergency case closed. Ambulance has cleared.`,
      'info',
      'all',
      emergencyId
    );
  },

  updateHospitalBeds: (hospitalId, updates) => {
    set(state => ({
      hospitals: state.hospitals.map(h => h.id === hospitalId ? { ...h, ...updates } : h)
    }));
  },

  addHospital: (hospital) => {
    const id = `hosp-${Math.random().toString(36).substr(2, 9)}`;
    set(state => ({
      hospitals: [...state.hospitals, { ...hospital, id }]
    }));
  },

  addAmbulance: (ambulance) => {
    const id = `amb-${Math.random().toString(36).substr(2, 9)}`;
    set(state => ({
      ambulances: [...state.ambulances, { ...ambulance, id }]
    }));
  },

  // ----------------------------------------------------
  // REAL-TIME SIMULATION ENGINE
  // ----------------------------------------------------
  startTelemetrySimulation: (emergencyId) => {
    const intervals = get().simulationIntervals;
    if (intervals[emergencyId]) return; // Already running

    // ECG wave generator helper
    const generateECG = (hr: number): number[] => {
      // Basic normal cardiac wave rhythm
      return Array.from({ length: 15 }, (_, i) => {
        if (i === 4) return 1.2;  // R peak
        if (i === 3) return -0.2; // Q dip
        if (i === 5) return -0.4; // S dip
        if (i === 7) return 0.2;  // T wave
        return 0; // Baseline
      });
    };

    const intervalId = setInterval(() => {
      const state = get();
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency || ['arrived', 'treatment_started', 'completed'].includes(emergency.status)) {
        state.stopTelemetrySimulation(emergencyId);
        return;
      }

      // 1. Telemetry vital adjustments (simulate live fluctuate readings)
      const currentVitals = emergency.vitals || {
        heartRate: 85,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        temperature: 36.8,
        spo2: 97,
        respiratoryRate: 16,
        bloodSugar: 105,
        timestamp: new Date().toISOString(),
        ecgWave: []
      };

      // Random small drift
      const hrDrift = Math.round((Math.random() - 0.5) * 4);
      const spo2Drift = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      const bpSysDrift = Math.round((Math.random() - 0.5) * 6);
      const bpDiaDrift = Math.round((Math.random() - 0.5) * 4);
      const tempDrift = Number(((Math.random() - 0.5) * 0.2).toFixed(1));
      const respDrift = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;

      const newHR = Math.max(40, Math.min(220, currentVitals.heartRate + hrDrift));
      const newSpO2 = Math.max(50, Math.min(100, currentVitals.spo2 + spo2Drift));
      const newBPSys = Math.max(60, Math.min(240, currentVitals.bloodPressureSystolic + bpSysDrift));
      const newBPDiag = Math.max(40, Math.min(140, currentVitals.bloodPressureDiastolic + bpDiaDrift));
      const newTemp = Number(Math.max(34, Math.min(42, currentVitals.temperature + tempDrift)).toFixed(1));
      const newResp = Math.max(6, Math.min(45, currentVitals.respiratoryRate + respDrift));

      const newVitals: Vitals = {
        heartRate: newHR,
        bloodPressureSystolic: newBPSys,
        bloodPressureDiastolic: newBPDiag,
        temperature: newTemp,
        spo2: newSpO2,
        respiratoryRate: newResp,
        bloodSugar: currentVitals.bloodSugar, // Keep blood sugar stable
        ecgWave: generateECG(newHR),
        timestamp: new Date().toISOString()
      };

      // 2. GPS routing updates (move ambulance along routeCoordinates)
      let currentDistance = emergency.distanceKm || 5.0;
      let currentETA = emergency.etaMinutes || 10;
      let nextCoords = emergency.routeCoordinates || [];
      let ambulanceLat = emergency.incidentLat;
      let ambulanceLng = emergency.incidentLng;

      if (emergency.ambulanceId && emergency.status !== 'created') {
        const ambulance = state.ambulances.find(a => a.id === emergency.ambulanceId);
        if (ambulance && nextCoords.length > 0) {
          // Move ambulance along coordinates step
          const pathIndex = Math.min(
            nextCoords.length - 1,
            Math.max(1, Math.round(((10 - currentETA) / 10) * nextCoords.length))
          );
          const [lat, lng] = nextCoords[pathIndex];
          ambulanceLat = lat;
          ambulanceLng = lng;

          // Update Ambulance list GPS coordinates
          set(state => ({
            ambulances: state.ambulances.map(a => 
              a.id === emergency.ambulanceId 
                ? { ...a, currentLat: lat, currentLng: lng, speed: 60, heading: 45 } 
                : a
            )
          }));

          // Decr ETA and distance as it travels
          currentDistance = Math.max(0.1, Number((currentDistance * 0.92).toFixed(2)));
          currentETA = Math.max(1, currentETA - (Math.random() > 0.6 ? 1 : 0));

          // If close enough and heading to hospital, trigger arrival
          if (currentDistance <= 0.2 && emergency.status === 'hospital_ready') {
            state.markArrived(emergencyId);
            currentETA = 0;
            currentDistance = 0;
          }
        }
      }

      // Update emergency structure in store
      state.updateVitals(emergencyId, newVitals);

      // Write distance / ETA updates back
      set(state => ({
        emergencies: state.emergencies.map(e => 
          e.id === emergencyId 
            ? { ...e, distanceKm: currentDistance, etaMinutes: currentETA }
            : e
        )
      }));

    }, 3000);

    set(state => ({
      simulationIntervals: { ...state.simulationIntervals, [emergencyId]: intervalId }
    }));
  },

  stopTelemetrySimulation: (emergencyId) => {
    const intervals = get().simulationIntervals;
    if (intervals[emergencyId]) {
      clearInterval(intervals[emergencyId]);
      const newIntervals = { ...intervals };
      delete newIntervals[emergencyId];
      set({ simulationIntervals: newIntervals });
    }
  },

  triggerMockVitalsDrop: (emergencyId) => {
    // Drop SpO2 and Systolic BP immediately to trigger critical alert logic
    set(state => {
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      if (!emergency || !emergency.vitals) return {};

      const droppedVitals: Vitals = {
        ...emergency.vitals,
        spo2: 79,
        heartRate: 165,
        bloodPressureSystolic: 75,
        bloodPressureDiastolic: 45,
        timestamp: new Date().toISOString()
      };

      const triage = runAITriage(emergency.patientDetails || {}, droppedVitals);
      const timestamp = new Date().toISOString();

      const updatedTimeline = [
        ...emergency.timeline,
        {
          id: `evt-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          title: 'CRITICAL ARREST WARNING',
          description: 'AI detected high survival risk. Sudden drop in blood pressure and hypoxemia. Action needed.',
          role: 'ai' as const,
          status: emergency.status
        }
      ];

      return {
        emergencies: state.emergencies.map(e => 
          e.id === emergencyId 
            ? { ...e, vitals: droppedVitals, vitalsHistory: [...e.vitalsHistory, droppedVitals].slice(-30), triage, timeline: updatedTimeline, updatedAt: timestamp }
            : e
        )
      };
    });

    get().addNotification(
      'PATIENT VITALS CRITICAL',
      `Case #${emergencyId.slice(-4).toUpperCase()} SpO2 dropped to 79%! Heart rate: 165 bpm.`,
      'error',
      'all',
      emergencyId
    );
  },

  // ----------------------------------------------------
  // NOTIFICATION UTILS
  // ----------------------------------------------------
  addNotification: (title, message, type, role, emergencyId) => {
    const newNotif: SystemNotification = {
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      role,
      emergencyId,
      isRead: false
    };
    set(state => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50) // Keep last 50
    }));
  },

  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}));
