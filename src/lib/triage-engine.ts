import { Patient, Vitals, TriageResult, TriageLevel } from '@/types';

export function runAITriage(patient: Partial<Patient>, vitals: Vitals): TriageResult {
  const reasoning: string[] = [];
  let score = 0; // Cumulative risk score

  // 1. Consciousness check (Immediate Critical Indicator)
  if (patient.consciousness === 'Unconscious') {
    score += 15;
    reasoning.push('Patient is completely unresponsive/unconscious (GCS <= 8 equivalent).');
  } else if (patient.consciousness === 'Semi-Conscious') {
    score += 8;
    reasoning.push('Patient exhibits altered mental status / semi-consciousness.');
  }

  // 2. SpO2 Oxygen Saturation (Critical Indicator)
  if (vitals.spo2 < 85) {
    score += 20;
    reasoning.push(`Critical hypoxemia: SpO2 is dangerously low at ${vitals.spo2}%.`);
  } else if (vitals.spo2 >= 85 && vitals.spo2 < 90) {
    score += 12;
    reasoning.push(`Severe hypoxia: SpO2 is ${vitals.spo2}%. Oxygen therapy required immediately.`);
  } else if (vitals.spo2 >= 90 && vitals.spo2 < 95) {
    score += 5;
    reasoning.push(`Mild hypoxia: SpO2 is sub-optimal at ${vitals.spo2}%.`);
  }

  // 3. Heart Rate
  if (vitals.heartRate > 150 || vitals.heartRate < 40) {
    score += 12;
    reasoning.push(`Dangerous heart rate: ${vitals.heartRate} bpm indicates extreme tachy/bradycardia.`);
  } else if ((vitals.heartRate >= 120 && vitals.heartRate <= 150) || (vitals.heartRate >= 40 && vitals.heartRate < 50)) {
    score += 7;
    reasoning.push(`Abnormal heart rate: ${vitals.heartRate} bpm indicates significant cardiovascular stress.`);
  } else if ((vitals.heartRate >= 100 && vitals.heartRate < 120) || (vitals.heartRate >= 50 && vitals.heartRate < 60)) {
    score += 3;
    reasoning.push(`Mild tachy/bradycardia: ${vitals.heartRate} bpm.`);
  }

  // 4. Blood Pressure (Systolic)
  if (vitals.bloodPressureSystolic < 80) {
    score += 15;
    reasoning.push(`Critical hypotension: Systolic Blood Pressure is extremely low at ${vitals.bloodPressureSystolic} mmHg.`);
  } else if (vitals.bloodPressureSystolic >= 80 && vitals.bloodPressureSystolic < 95) {
    score += 8;
    reasoning.push(`Moderate hypotension: Systolic Blood Pressure is ${vitals.bloodPressureSystolic} mmHg.`);
  } else if (vitals.bloodPressureSystolic > 190) {
    score += 10;
    reasoning.push(`Hypertensive crisis: Systolic Blood Pressure is extremely high at ${vitals.bloodPressureSystolic} mmHg.`);
  } else if (vitals.bloodPressureSystolic > 160 && vitals.bloodPressureSystolic <= 190) {
    score += 4;
    reasoning.push(`Stage 2 Hypertension: Systolic Blood Pressure is ${vitals.bloodPressureSystolic} mmHg.`);
  }

  // 5. Respiratory Rate
  if (vitals.respiratoryRate > 30 || vitals.respiratoryRate < 8) {
    score += 12;
    reasoning.push(`Critical respiratory rate: ${vitals.respiratoryRate} bpm indicates acute respiratory distress or arrest.`);
  } else if ((vitals.respiratoryRate >= 25 && vitals.respiratoryRate <= 30) || (vitals.respiratoryRate >= 8 && vitals.respiratoryRate < 12)) {
    score += 6;
    reasoning.push(`Abnormal tachypnea/bradypnea: ${vitals.respiratoryRate} breaths per minute.`);
  }

  // 6. Temperature
  if (vitals.temperature > 40 || vitals.temperature < 35) {
    score += 8;
    reasoning.push(`Extreme temperature deviation: ${vitals.temperature}°C indicates severe hyperthermia or hypothermia.`);
  } else if (vitals.temperature > 38.5 || vitals.temperature < 36.0) {
    score += 3;
    reasoning.push(`Fever or subnormal temperature: ${vitals.temperature}°C.`);
  }

  // 7. Symptoms & Pain Level
  const symptomsStr = (patient.symptoms || []).join(', ').toLowerCase();
  const pain = patient.painLevel || 0;

  if (symptomsStr.includes('chest pain') || symptomsStr.includes('cardiac') || symptomsStr.includes('angina')) {
    score += 10;
    reasoning.push('Potential acute coronary syndrome: Patient reports active chest pain.');
  }
  if (symptomsStr.includes('stroke') || symptomsStr.includes('numbness') || symptomsStr.includes('slur') || symptomsStr.includes('facial droop')) {
    score += 10;
    reasoning.push('Stroke protocol alert: Neurological stroke symptoms detected.');
  }
  if (symptomsStr.includes('breathing') || symptomsStr.includes('shortness of breath') || symptomsStr.includes('sob') || symptomsStr.includes('dyspnea')) {
    score += 6;
    reasoning.push('Respiratory distress: Subjective shortness of breath reported.');
  }
  if (symptomsStr.includes('severe bleeding') || symptomsStr.includes('hemorrhage') || symptomsStr.includes('bleeding')) {
    score += 9;
    reasoning.push('Hemorrhagic warning: Active severe bleeding reported.');
  }

  if (pain >= 9) {
    score += 6;
    reasoning.push(`Severe pain score: Patient reports acute pain level of ${pain}/10.`);
  } else if (pain >= 6) {
    score += 3;
    reasoning.push(`Moderate-to-high pain score: ${pain}/10.`);
  }

  // 8. Medical History & Demographics
  if (patient.age && patient.age > 75) {
    score += 3; // Geriatric risk multiplier
  }
  if (patient.knownDiseases && patient.knownDiseases.some(d => ['Heart Disease', 'COPD', 'Stroke', 'CAD', 'CHF'].includes(d))) {
    score += 4;
    reasoning.push('High-risk medical history: History of chronic cardiopulmonary or cerebrovascular disease.');
  }

  // Determine Triage Level based on scores
  let level: TriageLevel = 'green';
  let recommendedAction = 'Routine assessment. Standard emergency room processing.';
  let survivalRisk = 2; // Default baseline risk

  if (score >= 35) {
    level = 'critical';
    recommendedAction = 'IMMEDIATE RESUSCITATION. Secure airway, high-flow oxygen, continuous cardiac monitoring, and direct-to-bed ICU transfer.';
    survivalRisk = 75 + Math.min(20, score - 35); // 75% to 95% mortality risk if untreated
  } else if (score >= 20) {
    level = 'red';
    recommendedAction = 'Emergent care. Hospital trauma/cardiac bay prep. Direct assessment by Emergency Physician within 5 minutes.';
    survivalRisk = 40 + Math.round((score - 20) * 2.3); // 40% to 75%
  } else if (score >= 10) {
    level = 'orange';
    recommendedAction = 'Urgent priority. Rapid ER bed assignment. Medical assessment within 15-30 minutes. IV access and labs.';
    survivalRisk = 15 + Math.round((score - 10) * 2.5); // 15% to 40%
  } else if (score >= 5) {
    level = 'yellow';
    recommendedAction = 'Semi-urgent priority. Normal emergency care. Visual triage check every 30 minutes in waiting area.';
    survivalRisk = 5 + Math.round((score - 5) * 2); // 5% to 15%
  } else {
    level = 'green';
    recommendedAction = 'Non-urgent care. Direct to clinic, general consultation, or urgent care overflow.';
    survivalRisk = 1 + Math.round(score * 0.8); // 1% to 5%
  }

  // Add default reasoning if empty
  if (reasoning.length === 0) {
    reasoning.push('Vitals are within stable reference thresholds. No high-risk historical indicators reported.');
  }

  // Generate a deterministic AI confidence score based on clinical risk score
  const variance = ((score * 3) % 5) * 0.01;
  const confidenceScore = Number((0.92 + (score > 20 ? 0.06 : variance)).toFixed(2));

  return {
    level,
    confidenceScore,
    reasoning,
    recommendedAction,
    survivalRisk,
  };
}
