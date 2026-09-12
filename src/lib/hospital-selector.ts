import { Hospital, Patient, TriageLevel, TrafficDensity } from '@/types';

export interface HospitalRecommendation {
  hospital: Hospital;
  score: number;
  confidenceScore: number;
  etaMinutes: number;
  distanceKm: number;
  reasons: string[];
}

// Haversine formula to compute distance in km between two lat/lng points
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Calculate ETA based on distance and traffic conditions
export function calculateETA(distanceKm: number, trafficDensity?: TrafficDensity | string): number {
  const averageSpeedKmh = 50; // Baseline EMS speed
  let timeHours = distanceKm / averageSpeedKmh;
  
  // Traffic multiplier
  let multiplier = 1.0;
  if (trafficDensity === 'Heavy Traffic' || trafficDensity === 'high') {
    multiplier = 1.6;
  } else if (trafficDensity === 'Moderate Traffic' || trafficDensity === 'medium') {
    multiplier = 1.25;
  } else {
    multiplier = 0.85; // Clear roads / Highway access
  }
  
  timeHours *= multiplier;
  
  // Convert to minutes, add a baseline dispatch overhead (2 mins)
  return Math.max(3, Math.round(timeHours * 60 + 2));
}

export function recommendHospitals(
  incidentLat: number,
  incidentLng: number,
  patient: Partial<Patient>,
  triageLevel: TriageLevel,
  hospitals: Hospital[]
): HospitalRecommendation[] {
  const matchedList = hospitals.map(hospital => {
    const reasons: string[] = [];
    let score = 100; // Start with base score of 100

    // 1. Distance & Traffic ETA calculations
    const distance = calculateDistance(incidentLat, incidentLng, hospital.lat, hospital.lng);
    const eta = calculateETA(distance, hospital.trafficDensity || hospital.currentEmergencyLoad);
    
    // Golden Hour travel penalty (2.5 points per minute)
    score -= eta * 2.5;
    reasons.push(`Distance: ${distance} km (${eta} min ETA via ${hospital.trafficDensity || 'Clear Roads'}).`);

    // Tier Traffic Bonus/Penalty
    if (hospital.tier === 'Tier 3') {
      score += 15;
      reasons.push('Tier 3 Highway Access: Low traffic congestion zone.');
    } else if (hospital.tier === 'Tier 1') {
      score -= 10;
      reasons.push('Tier 1 Urban Center: Heavy city traffic potential.');
    }

    // 2. Capacity Constraints & Emergency Readiness
    if (hospital.emergencyReadiness === 'Critical' || hospital.emergencyReadiness === 'Full') {
      score -= 45;
      reasons.push(`Hospital Status Alert: Readiness is currently ${hospital.emergencyReadiness}.`);
    } else if (hospital.emergencyReadiness === 'Ready') {
      score += 10;
      reasons.push('Hospital Readiness: Fully prepared for incoming emergency intake.');
    }

    // ICU Beds
    if (hospital.icuBedsAvailable <= 0) {
      if (triageLevel === 'critical' || triageLevel === 'red') {
        score -= 40;
        reasons.push('WARNING: 0 ICU beds available for critical intake.');
      } else {
        score -= 10;
        reasons.push('No ICU beds available.');
      }
    } else {
      score += Math.min(10, hospital.icuBedsAvailable * 1.5);
      reasons.push(`${hospital.icuBedsAvailable} ICU beds available.`);
    }

    // ER Beds
    if (hospital.erBedsAvailable <= 0) {
      score -= 50;
      reasons.push('CRITICAL: ER department at max capacity (0 beds).');
    } else {
      score += Math.min(10, hospital.erBedsAvailable * 0.5);
    }

    // Ventilators
    if (triageLevel === 'critical' && (hospital.ventilatorsAvailable ?? 0) <= 0) {
      score -= 30;
      reasons.push('WARNING: 0 Ventilator units available.');
    } else if ((hospital.ventilatorsAvailable ?? 0) > 0) {
      score += 5;
    }

    // 3. Specialist Matching
    const symptomsStr = (patient.symptoms || []).join(', ').toLowerCase();
    const requiresCardiologist = symptomsStr.includes('chest pain') || symptomsStr.includes('cardiac') || symptomsStr.includes('heart');
    const requiresNeurologist = symptomsStr.includes('stroke') || symptomsStr.includes('slur') || symptomsStr.includes('paralysis');
    const requiresTraumaSurgeon = symptomsStr.includes('accident') || symptomsStr.includes('bleeding') || symptomsStr.includes('fracture') || patient.accidentType !== undefined;

    if (requiresCardiologist) {
      if (hospital.specialists.includes('Cardiologist')) {
        score += 20;
        reasons.push('Specialist Match: On-call Cardiology team ready.');
      } else {
        score -= 25;
        reasons.push('Specialist Missing: No active Cardiologist on duty.');
      }
    }

    if (requiresNeurologist) {
      if (hospital.specialists.includes('Neurologist')) {
        score += 20;
        reasons.push('Specialist Match: Active Stroke/Neurology team.');
      } else {
        score -= 25;
        reasons.push('Specialist Missing: No active Neurologist on duty.');
      }
    }

    if (requiresTraumaSurgeon) {
      if (hospital.specialists.includes('Trauma Surgeon')) {
        score += 20;
        reasons.push('Specialist Match: Trauma Surgery bay on standby.');
      } else {
        score -= 20;
        reasons.push('Specialist Missing: Trauma surgeon unavailable.');
      }
    }

    // Deterministic confidence score
    const finalScore = Math.max(10, Math.round(score));
    const confidenceScore = Number((0.88 + Math.min(0.10, finalScore / 1000 + (hospital.specialists.length * 0.02))).toFixed(2));

    return {
      hospital,
      score: finalScore,
      confidenceScore,
      etaMinutes: eta,
      distanceKm: distance,
      reasons: reasons.slice(0, 4)
    };
  });

  // Sort descending by calculated score
  return matchedList.sort((a, b) => b.score - a.score);
}
