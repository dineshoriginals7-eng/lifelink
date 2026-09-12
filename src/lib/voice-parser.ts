import { Patient, Vitals } from '@/types';

export function parseVoiceDictation(text: string): {
  patient: Partial<Patient>;
  vitals: Partial<Vitals>;
} {
  const lowercaseText = text.toLowerCase();
  const patient: Partial<Patient> = {
    symptoms: [],
    knownDiseases: [],
    allergies: [],
    currentMedications: []
  };
  const vitals: Partial<Vitals> = {};

  // 1. Age extraction
  // e.g., "45 years old", "age 32", "72 yo", "65 y/o"
  const ageMatch = lowercaseText.match(/(\d+)\s*(?:years\s*old|yo|y\/o|yr|year\s*old|age)/);
  if (ageMatch) {
    patient.age = parseInt(ageMatch[1], 10);
  }

  // 2. Gender extraction
  if (lowercaseText.includes('female') || lowercaseText.includes('woman') || lowercaseText.includes('girl')) {
    patient.gender = 'Female';
  } else if (lowercaseText.includes('male') || lowercaseText.includes('man') || lowercaseText.includes('boy')) {
    patient.gender = 'Male';
  }

  // 3. Consciousness
  if (lowercaseText.includes('unconscious') || lowercaseText.includes('unresponsive') || lowercaseText.includes('passed out')) {
    patient.consciousness = 'Unconscious';
  } else if (lowercaseText.includes('semi-conscious') || lowercaseText.includes('drowsy') || lowercaseText.includes('confused')) {
    patient.consciousness = 'Semi-Conscious';
  } else {
    patient.consciousness = 'Conscious';
  }

  // 4. Pain Level
  // e.g., "pain level 8", "pain is 9 out of 10"
  const painMatch = lowercaseText.match(/pain\s*(?:level|is)?\s*(\d+)/);
  if (painMatch) {
    const val = parseInt(painMatch[1], 10);
    if (val >= 1 && val <= 10) {
      patient.painLevel = val;
    }
  }

  // 5. Symptoms extraction
  const symptomsKeywords = [
    { key: 'chest pain', term: 'Chest Pain' },
    { key: 'angina', term: 'Chest Pain' },
    { key: 'shortness of breath', term: 'Shortness of Breath' },
    { key: 'breathing difficulty', term: 'Shortness of Breath' },
    { key: 'dyspnea', term: 'Shortness of Breath' },
    { key: 'sob', term: 'Shortness of Breath' },
    { key: 'bleeding', term: 'Severe Bleeding' },
    { key: 'hemorrhage', term: 'Severe Bleeding' },
    { key: 'headache', term: 'Severe Headache' },
    { key: 'dizzy', term: 'Dizziness' },
    { key: 'nausea', term: 'Nausea' },
    { key: 'abdominal pain', term: 'Abdominal Pain' },
    { key: 'burn', term: 'Severe Burns' },
    { key: 'seizure', term: 'Active Seizures' },
    { key: 'paralysis', term: 'Stroke Symptoms' },
    { key: 'numbness', term: 'Stroke Symptoms' },
    { key: 'slurred speech', term: 'Stroke Symptoms' },
    { key: 'fracture', term: 'Bone Fracture' }
  ];

  symptomsKeywords.forEach(({ key, term }) => {
    if (lowercaseText.includes(key) && !patient.symptoms?.includes(term)) {
      patient.symptoms?.push(term);
    }
  });

  // 6. Medical History / Diseases extraction
  const diseasesKeywords = [
    { key: 'diabetes', term: 'Diabetes' },
    { key: 'diabetic', term: 'Diabetes' },
    { key: 'asthma', term: 'Asthma' },
    { key: 'copd', term: 'COPD' },
    { key: 'heart disease', term: 'Heart Disease' },
    { key: 'cardiac history', term: 'Heart Disease' },
    { key: 'hypertension', term: 'Hypertension' },
    { key: 'high blood pressure', term: 'Hypertension' },
    { key: 'stroke history', term: 'Stroke' },
    { key: 'kidney disease', term: 'Chronic Kidney Disease' }
  ];

  diseasesKeywords.forEach(({ key, term }) => {
    if (lowercaseText.includes(key) && !patient.knownDiseases?.includes(term)) {
      patient.knownDiseases?.push(term);
    }
  });

  // 7. Vitals Parsing (Simulated speech capture)
  // e.g. "heart rate 120", "pulse 90", "bp 120 over 80", "spo2 95%"
  const hrMatch = lowercaseText.match(/(?:heart rate|pulse|hr)\s*(?:is)?\s*(\d+)/);
  if (hrMatch) {
    vitals.heartRate = parseInt(hrMatch[1], 10);
  }

  const spo2Match = lowercaseText.match(/(?:spo2|oxygen|o2)\s*(?:is)?\s*(\d+)/);
  if (spo2Match) {
    vitals.spo2 = parseInt(spo2Match[1], 10);
  }

  const tempMatch = lowercaseText.match(/(?:temp|temperature)\s*(?:is)?\s*(\d+(?:\.\d+)?)/);
  if (tempMatch) {
    vitals.temperature = parseFloat(tempMatch[1]);
  }

  // BP matches "120 over 80", "120/80"
  const bpMatch = lowercaseText.match(/(?:bp|blood pressure)\s*(?:is)?\s*(\d+)\s*(?:\/|over)\s*(\d+)/);
  if (bpMatch) {
    vitals.bloodPressureSystolic = parseInt(bpMatch[1], 10);
    vitals.bloodPressureDiastolic = parseInt(bpMatch[2], 10);
  }

  return { patient, vitals };
}
