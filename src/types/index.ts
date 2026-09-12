export type UserRole = 'admin' | 'dispatcher' | 'ambulance' | 'hospital' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  hospitalId?: string; // If role is doctor or hospital staff
  ambulanceId?: string; // If role is ambulance staff
}

export type EmergencyStatus = 
  | 'created' 
  | 'assigned' 
  | 'accepted'
  | 'vitals_streaming' 
  | 'hospital_assigned'
  | 'doctor_assigned'
  | 'hospital_ready'
  | 'arrived' 
  | 'treatment_started'
  | 'completed';

export type TriageLevel = 'green' | 'yellow' | 'orange' | 'red' | 'critical';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number; // in kg
  knownDiseases: string[];
  allergies: string[];
  currentMedications: string[];
  accidentType?: string;
  symptoms: string[];
  consciousness: 'Conscious' | 'Semi-Conscious' | 'Unconscious';
  painLevel: number; // 1-10
}

export interface TriageResult {
  level: TriageLevel;
  confidenceScore: number;
  reasoning: string[];
  recommendedAction: string;
  survivalRisk: number; // 0 to 100 (%)
}

export interface Ambulance {
  id: string;
  code: string; // e.g., AMB-101
  plateNumber: string;
  status: 'available' | 'assigned' | 'busy' | 'offline';
  currentLat: number;
  currentLng: number;
  driverName: string;
  paramedics: string[];
  speed: number; // km/h
  heading: number; // degrees
  oxygenLevel?: number; // IoT metric
}

export type HospitalTier = 'Tier 1' | 'Tier 2' | 'Tier 3';
export type HospitalType = 'Government' | 'Private' | 'Specialty Hospital' | 'Trauma Center';
export type TrafficDensity = 'Heavy Traffic' | 'Moderate Traffic' | 'Clear Roads';
export type EmergencyReadiness = 'Ready' | 'Busy' | 'Full' | 'Critical';

export interface Hospital {
  id: string;
  name: string;
  image?: string;
  address: string;
  lat: number;
  lng: number;
  contactNumber: string;
  email?: string;
  emergencyContact?: string;
  hospitalType: HospitalType;
  tier: HospitalTier;
  trafficDensity: TrafficDensity;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  erBedsTotal: number;
  erBedsAvailable: number;
  ventilatorsTotal: number;
  ventilatorsAvailable: number;
  specialists: string[]; // e.g., ['Cardiologist', 'Trauma Surgeon']
  capacity: number; // Percentage overall capacity (0-100%)
  currentEmergencyLoad: 'low' | 'medium' | 'high';
  rating: number; // e.g., 4.8
  avgResponseTime: number; // Average ER response time in minutes
  emergencyReadiness: EmergencyReadiness;
}

export interface Vitals {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  temperature: number; // in C
  spo2: number; // oxygen saturation percentage
  respiratoryRate: number;
  bloodSugar: number; // mg/dL
  ecgWave?: number[]; // simulated array of values for rendering
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  role: UserRole | 'system' | 'ai';
  status: EmergencyStatus;
}

export interface VoiceNote {
  id: string;
  timestamp: string;
  transcript: string;
  audioUrl?: string;
  parsedFields?: Partial<Patient & Vitals>;
}

export interface Emergency {
  id: string;
  status: EmergencyStatus;
  patientId: string;
  patientName: string;
  patientDetails?: Patient;
  ambulanceId?: string;
  hospitalId?: string;
  doctorId?: string;
  dispatcherId: string;
  
  // Locations
  incidentLat: number;
  incidentLng: number;
  incidentLocationName: string;
  
  // Real-time metrics
  vitals?: Vitals;
  vitalsHistory: Vitals[];
  triage?: TriageResult;
  voiceNotes: VoiceNote[];
  timeline: TimelineEvent[];
  
  // Route details
  etaMinutes?: number;
  distanceKm?: number;
  routeCoordinates?: [number, number][]; // Array of [lat, lng] for drawing the path
  
  createdAt: string;
  updatedAt: string;
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  role: UserRole | 'all';
  emergencyId?: string;
  isRead: boolean;
}

export interface AnalyticsSummary {
  dailyEmergencies: { date: string; count: number; critical: number }[];
  avgResponseTime: number; // minutes
  hospitalPerformance: { name: string; avgAdmitTime: number; activeCases: number }[];
  aiAccuracy: number; // percentage
  ambulanceUtilization: { id: string; code: string; activeHoursPercent: number }[];
  emergencyTypes: { name: string; value: number }[];
}
