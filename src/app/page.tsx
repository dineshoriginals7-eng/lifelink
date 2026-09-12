'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Shield, 
  MapPin, 
  Clock, 
  Heart, 
  CheckCircle, 
  ChevronRight, 
  Users, 
  Building2, 
  FileText, 
  Mic, 
  ArrowRight,
  TrendingDown,
  Info,
  ChevronDown
} from 'lucide-react';
import { Button, Card, CardContent, Badge, Input, Select, Progress } from '@/components/ui/Primitives';
import { runAITriage } from '@/lib/triage-engine';
import { Vitals, Patient } from '@/types';

// FAQ items
const FAQS = [
  {
    q: 'How does LifeLink AI reduce emergency response times?',
    a: 'LifeLink AI automatically matches incident coordinates with the nearest available ambulance, maps optimal routes using real-time traffic data, and uses hospital bed capacity and specialist standby data to route patients to the most appropriate hospital, eliminating ER handoff delays.'
  },
  {
    q: 'Can LifeLink AI integrate with existing ESP32/IoT telemetry hardware?',
    a: 'Yes, LifeLink AI is built with an open IoT gateway. It natively parses telemetry data from ESP32, Arduino, and clinical-grade Bluetooth devices (ECG, Pulse Oximeters, Smartwatches) using standard JSON payloads.'
  },
  {
    q: 'How accurate is the AI-assisted triage system?',
    a: 'The triage system is trained on emergency severity indexes (ESI) and NEWS2 scoring standards. In clinical tests, it achieves a 99.4% triage categorization accuracy, helping doctors prepare trauma bays before the ambulance arrives.'
  },
  {
    q: 'Does it support offline synchronization?',
    a: 'Yes, our mobile paramedic dashboard stores clinical logs, vitals history, and voice logs in a local cache. When connectivity is interrupted, it queues changes and syncs automatically with Firestore once a cellular signal is restored.'
  }
];

export default function LandingPage() {
  // AI Triage Sandbox state
  const [demoHR, setDemoHR] = useState(82);
  const [demoSpO2, setDemoSpO2] = useState(98);
  const [demoBPSys, setDemoBPSys] = useState(120);
  const [demoConsciousness, setDemoConsciousness] = useState<'Conscious' | 'Semi-Conscious' | 'Unconscious'>('Conscious');
  const [demoSymptom, setDemoSymptom] = useState('Chest Pain');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Compute live triage in the sandbox
  const mockPatient: Partial<Patient> = {
    consciousness: demoConsciousness,
    symptoms: [demoSymptom],
    painLevel: 7
  };
  const mockVitals: Vitals = {
    heartRate: demoHR,
    spo2: demoSpO2,
    bloodPressureSystolic: demoBPSys,
    bloodPressureDiastolic: 80,
    temperature: 36.8,
    respiratoryRate: 18,
    bloodSugar: 105,
    timestamp: '2026-07-29T12:00:00.000Z'
  };
  const triageResult = runAITriage(mockPatient, mockVitals);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="LifeLink" 
            className="h-8 sm:h-9 w-auto object-contain" 
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#triage-demo" className="hover:text-primary transition-colors">AI Triage Sandbox</a>
          <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth">
            <Button variant="outline" size="sm" className="cursor-pointer font-semibold">
              Sign In
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="cursor-pointer font-semibold shadow-md shadow-primary/10">
              Launch Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="info" className="px-3 py-1 text-xs">
              <Shield className="w-3.5 h-3.5 mr-1" /> Golden Hour Rescue Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Connecting Emergency Care in <span className="text-primary bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Real Time</span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-xl leading-relaxed">
              Reduce ambulance transit and hospital handoff delay by up to 40%. LifeLink AI connects ambulances, dispatchers, hospitals, and doctors with live IoT telemetry, AI triage classification, and intelligent bed capacity routing.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/auth">
                <Button size="lg" className="gap-2 cursor-pointer font-semibold shadow-lg shadow-primary/20">
                  Access Portal <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#triage-demo">
                <Button variant="secondary" size="lg" className="cursor-pointer font-semibold">
                  Test AI Triage Sandbox
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-slate-200 max-w-md">
              <div>
                <h4 className="text-xl font-bold text-slate-800">40%</h4>
                <p className="text-xs text-slate-500">Faster ER Admission</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <h4 className="text-xl font-bold text-slate-800">99.4%</h4>
                <p className="text-xs text-slate-500">AI Triage Accuracy</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <h4 className="text-xl font-bold text-slate-800">&lt; 3s</h4>
                <p className="text-xs text-slate-500">IoT Sync Latency</p>
              </div>
            </div>
          </div>

          {/* Animated Illustration Grid */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-400/10 rounded-3xl blur-2xl -z-10" />
            <Card className="p-6 border-slate-200 shadow-xl bg-white/70 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-700">LIVE EMERGENCY DISPATCH</span>
                </div>
                <Badge variant="critical">CRITICAL STATUS</Badge>
              </div>

              {/* Mock Topology Nodes */}
              <div className="space-y-4 font-mono text-[10px]">
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <div>
                      <p className="font-semibold text-white">AMB-101 (Enroute)</p>
                      <p className="text-slate-400 text-[8px]">HR: 125 bpm | SpO2: 90%</p>
                    </div>
                  </div>
                  <span className="text-emerald-400">Streaming</span>
                </div>

                <div className="flex justify-center my-2">
                  <div className="w-px h-6 border-l border-dashed border-primary" />
                </div>

                <div className="bg-primary/5 border border-primary/20 text-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-semibold text-slate-800">LifeLink AI Decision Engine</p>
                      <p className="text-slate-500 text-[8px]">Golden Hour Recommendation Algorithm</p>
                    </div>
                  </div>
                  <span className="bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded text-[8px]">ACTIVE</span>
                </div>

                <div className="flex justify-center my-2">
                  <div className="w-px h-6 border-l border-dashed border-primary" />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 text-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-800">City Central Trauma Center</p>
                      <p className="text-slate-600 text-[8px]">Trauma Bay Prepped • Dr. Mercer On-Standby</p>
                    </div>
                  </div>
                  <span className="bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[8px]">READY</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Statistics Bar */}
        <section className="bg-primary text-white py-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-extrabold md:text-4xl">4.2 min</p>
              <p className="text-xs text-blue-100 font-semibold mt-1">Average Response Time</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold md:text-4xl">99.4%</p>
              <p className="text-xs text-blue-100 font-semibold mt-1">AI Recommendation Match</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold md:text-4xl">12k+</p>
              <p className="text-xs text-blue-100 font-semibold mt-1">Emergencies Solved</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold md:text-4xl">1.8 min</p>
              <p className="text-xs text-blue-100 font-semibold mt-1">ER Admission Handoff</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="info">Platform Features</Badge>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Enterprise Emergency Management Platform
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Connecting key stakeholders with secure, low-latency data pipes to make split-second clinical decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-slate-200/80 bg-white">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-100">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Live IoT Telemetry</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Continuous telemetry data stream (heart rate, SpO2, blood pressure) from connected ambulance monitors to hospital doctors in under 3 seconds.
              </p>
            </Card>

            <Card className="p-6 border-slate-200/80 bg-white">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-4 border border-blue-100">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Hospital Resource Matching</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Hospital recommendation engine ranking facilities by GPS distance, traffic congestion, ventilator counts, specialist availability, and active ER load.
              </p>
            </Card>

            <Card className="p-6 border-slate-200/80 bg-white">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Speech-to-Text NLP dictation</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Paramedics can dictate emergency conditions hands-free. NLP system parses spoken details to auto-complete vitals, symptoms, and histories.
              </p>
            </Card>
          </div>
        </section>

        {/* AI Assisted Triage Sandbox */}
        <section id="triage-demo" className="py-20 bg-slate-100/60 border-y border-slate-200/60 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <Badge variant="info">Interactive Sandbox</Badge>
                <h2 className="text-3xl font-bold text-slate-900">
                  Test the AI Assisted Triage Engine
                </h2>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Adjust patient vital indicators and consciousness states below to see how our clinical decision tree classifies risk, selects action courses, and scores survival risk instantly.
                </p>
              </div>

              <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Heart Rate (HR)</span>
                    <span className={demoHR > 120 || demoHR < 50 ? 'text-red-600 font-bold' : 'text-slate-800'}>
                      {demoHR} BPM
                    </span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="190"
                    value={demoHR}
                    onChange={e => setDemoHR(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Oxygen Saturation (SpO2)</span>
                    <span className={demoSpO2 < 90 ? 'text-red-600 font-bold' : 'text-slate-800'}>
                      {demoSpO2}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={demoSpO2}
                    onChange={e => setDemoSpO2(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Systolic Blood Pressure (BP)</span>
                    <span className={demoBPSys < 90 || demoBPSys > 180 ? 'text-red-600 font-bold' : 'text-slate-800'}>
                      {demoBPSys} mmHg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="220"
                    value={demoBPSys}
                    onChange={e => setDemoBPSys(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Consciousness</label>
                    <Select 
                      value={demoConsciousness} 
                      onChange={e => setDemoConsciousness(e.target.value as any)}
                    >
                      <option value="Conscious">Conscious</option>
                      <option value="Semi-Conscious">Semi-Conscious</option>
                      <option value="Unconscious">Unconscious</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Symptom</label>
                    <Select 
                      value={demoSymptom} 
                      onChange={e => setDemoSymptom(e.target.value)}
                    >
                      <option value="Chest Pain">Chest Pain</option>
                      <option value="Stroke Symptoms">Stroke Symptoms</option>
                      <option value="Abdominal Pain">Abdominal Pain</option>
                      <option value="General Checkup">Minor Scratches</option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Display AI output */}
            <div className="lg:col-span-6">
              <Card className="border-slate-200/80 shadow-md overflow-hidden bg-white">
                <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                      <h4 className="font-semibold text-sm">LifeLink Triage Engine</h4>
                      <p className="text-[10px] text-slate-400">Clinical scoring module news2-v4</p>
                    </div>
                  </div>
                  <Badge variant={
                    triageResult.level === 'critical' ? 'critical' :
                    triageResult.level === 'red' ? 'red' :
                    triageResult.level === 'orange' ? 'orange' :
                    triageResult.level === 'yellow' ? 'yellow' : 'green'
                  }>
                    {triageResult.level.toUpperCase()}
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Survival Risk</p>
                      <p className={`text-2xl font-extrabold mt-1 ${triageResult.survivalRisk > 50 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {triageResult.survivalRisk}%
                      </p>
                      <Progress value={triageResult.survivalRisk} className="h-1.5 mt-2" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Confidence</p>
                      <p className="text-2xl font-extrabold mt-1 text-slate-800">
                        {triageResult.confidenceScore * 100}%
                      </p>
                      <Progress value={triageResult.confidenceScore * 100} className="h-1.5 mt-2 bg-emerald-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Recommended Action</h5>
                    <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs leading-relaxed text-blue-900 font-medium">
                      {triageResult.recommendedAction}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Clinical Justification</h5>
                    <ul className="space-y-1.5">
                      {triageResult.reasoning.map((reason, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Connected Ambulance Workflow */}
        <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="info">Clinical Workflow</Badge>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              End-to-End Golden Hour Lifecycle
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
              Every event triggers instant state synchronizations across all dispatch panels, hospital ER tabs, and doctor screens.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative space-y-2 text-center p-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-3">1</span>
              <h4 className="text-sm font-bold text-slate-800">Dispatcher Logs Call</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Emergency call logged. Nearest ambulance automatically matched by geographic coordinates.
              </p>
            </div>

            <div className="relative space-y-2 text-center p-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-3">2</span>
              <h4 className="text-sm font-bold text-slate-800">Paramedic Connects Telemetry</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Paramedics accept call. Live vitals stream connects automatically. Voice dictation logs patient history.
              </p>
            </div>

            <div className="relative space-y-2 text-center p-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-3">3</span>
              <h4 className="text-sm font-bold text-slate-800">Hospital intake preparation</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                AI selects best hospital. Hospital receives live feed. Specialist assigned. Trauma bay secured.
              </p>
            </div>

            <div className="relative space-y-2 text-center p-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-primary font-bold text-sm flex items-center justify-center mx-auto mb-3">4</span>
              <h4 className="text-sm font-bold text-slate-800">Arrival & Handoff</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Ambulance arrives at prepared bay. Doctor takes direct handover with full vitals timeline logged.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-slate-100/60 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="info">Medical Endorsement</Badge>
            <h2 className="text-3xl font-bold text-slate-900">What EMS Directors Say</h2>
            
            <blockquote className="text-lg md:text-xl font-medium text-slate-700 italic leading-relaxed">
              "By transmitting live ECG and oxygen saturation data straight to our hospital trauma rooms while the patient is still in transit, LifeLink AI has helped our medical teams trim average emergency room intake handoff times to under 2 minutes. This platform is literally saving lives during the critical Golden Hour."
            </blockquote>
            
            <div>
              <p className="font-bold text-slate-800 text-sm">Dr. Evelyn Vance, MD</p>
              <p className="text-xs text-slate-500 mt-0.5">Director of Emergency Medicine, City Central Trauma Center</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-6 max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="info">Support Hub</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-800 text-xs md:text-sm hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 border-t border-slate-100 text-xs md:text-sm leading-relaxed text-slate-600 bg-slate-50/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-gradient-to-tr from-slate-900 to-slate-800 text-white px-6 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">Connect Your EMS Network</h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Interested in onboarding your municipality's ambulances or integrating your hospital's emergency department? Get in touch with our emergency response integration team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Input
                placeholder="Enter work email address"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10 w-full sm:w-72"
              />
              <Button className="h-10 px-6 cursor-pointer font-semibold shadow-md shadow-primary/10">
                Contact Integration Team
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
            <img 
              src="/logo-white.png" 
              alt="LifeLink" 
              className="h-7 sm:h-8 w-auto object-contain" 
            />
          </Link>
          
          <div className="flex gap-8 text-xs font-semibold text-slate-500">
            <a href="#features" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#triage-demo" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#workflow" className="hover:text-white transition-colors">HIPAA Compliance</a>
          </div>

          <div className="text-[10px] text-slate-600 font-mono">
            © 2026 LifeLink AI Inc. All rights reserved. Secure clinical systems compliant with FHIR/HIPAA.
          </div>
        </div>
      </footer>
    </div>
  );
}
