'use client';

import React, { useEffect, useState } from 'react';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { Navigation } from '@/components/Navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button, 
  Input, 
  Select, 
  Badge, 
  Label,
  Progress
} from '@/components/ui/Primitives';
import { FloatingAIAssistant } from '@/components/ai-assistant/Chat';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  ShieldCheck, 
  Building2, 
  Truck, 
  Activity, 
  Clock, 
  Users, 
  PlusCircle, 
  Settings,
  BellRing
} from 'lucide-react';
import { Hospital, Ambulance } from '@/types';

// Mock analytics data for admin graphs
const MOCK_DAILY_EMERGENCIES = [
  { date: 'Mon', count: 12, critical: 3 },
  { date: 'Tue', count: 19, critical: 6 },
  { date: 'Wed', count: 15, critical: 4 },
  { date: 'Thu', count: 22, critical: 8 },
  { date: 'Fri', count: 28, critical: 11 },
  { date: 'Sat', count: 18, critical: 5 },
  { date: 'Sun', count: 14, critical: 2 }
];

const MOCK_TRIAGE_BREAKDOWN = [
  { name: 'Critical (Red)', value: 14, color: '#EF4444' },
  { name: 'Urgent (Orange)', value: 28, color: '#F97316' },
  { name: 'Semi-Urgent (Yellow)', value: 45, color: '#F59E0B' },
  { name: 'Non-Urgent (Green)', value: 35, color: '#10B981' }
];

export default function AdminPage() {
  const { 
    currentUser, 
    loginAs,
    hospitals, 
    ambulances, 
    emergencies,
    doctors,
    addHospital,
    addAmbulance,
    updateHospitalBeds
  } = useEmergencyStore();

  // Route protection
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      loginAs('admin');
    }
  }, [currentUser, loginAs]);

  // Tab state: 'analytics' | 'hospitals' | 'ambulances' | 'config'
  const [activeTab, setActiveTab] = useState<'analytics' | 'hospitals' | 'ambulances' | 'config'>('analytics');

  // Form states for adding assets
  const [newHospName, setNewHospName] = useState('');
  const [newHospAddr, setNewHospAddr] = useState('');
  const [newHospLat, setNewHospLat] = useState(40.7128);
  const [newHospLng, setNewHospLng] = useState(-74.0060);
  const [newHospICU, setNewHospICU] = useState(15);
  const [newHospER, setNewHospER] = useState(30);

  const [newAmbCode, setNewAmbCode] = useState('');
  const [newAmbPlate, setNewAmbPlate] = useState('');
  const [newAmbDriver, setNewAmbDriver] = useState('');

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName || !newHospAddr) return;

    addHospital({
      name: newHospName,
      address: newHospAddr,
      lat: newHospLat,
      lng: newHospLng,
      hospitalType: 'Trauma Center',
      tier: 'Tier 2',
      trafficDensity: 'Moderate Traffic',
      icuBedsTotal: newHospICU,
      icuBedsAvailable: newHospICU - 2,
      erBedsTotal: newHospER,
      erBedsAvailable: newHospER - 5,
      ventilatorsTotal: Math.round(newHospICU * 0.8),
      ventilatorsAvailable: Math.round(newHospICU * 0.4),
      specialists: ['Cardiologist', 'Trauma Surgeon'],
      capacity: 70,
      currentEmergencyLoad: 'low',
      rating: 4.8,
      avgResponseTime: 4.0,
      emergencyReadiness: 'Ready',
      contactNumber: '+1 (555) 999-0000'
    });

    setNewHospName('');
    setNewHospAddr('');
  };

  const handleAddAmbulance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmbCode || !newAmbPlate) return;

    addAmbulance({
      code: newAmbCode,
      plateNumber: newAmbPlate,
      status: 'available',
      currentLat: 40.7300,
      currentLng: -73.9900,
      driverName: newAmbDriver || 'Unnamed Driver',
      paramedics: ['John Paramedic', 'Lisa Medic'],
      speed: 0,
      heading: 0
    });

    setNewAmbCode('');
    setNewAmbPlate('');
    setNewAmbDriver('');
  };

  const activeCases = emergencies.filter(e => e.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span>System Administrator Control Center</span>
            </h2>
            <p className="text-slate-500 text-xs">Manage assets, review network telemetry graphs, and configure algorithms.</p>
          </div>
          
          {/* Quick tab switchers */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50 text-xs font-semibold">
            {(['analytics', 'hospitals', 'ambulances', 'config'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Core Analytics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Active emergencies</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{activeCases}</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Hospitals online</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{hospitals.length}</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Fleet ambulances</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">
                {ambulances.filter(a => a.status !== 'offline').length} / {ambulances.length}
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Response Time</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">4.2 min</p>
            </div>
          </Card>
        </div>

        {/* -------------------- TAB 1: ANALYTICS -------------------- */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Daily emergencies chart */}
            <Card className="lg:col-span-8 border-slate-200">
              <CardHeader className="pb-3 bg-slate-50/30">
                <CardTitle className="text-sm">Daily Emergency Incidents Trend</CardTitle>
                <CardDescription>Response numbers and critical alerts over the last week.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_DAILY_EMERGENCIES}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="count" name="Total Incidents" stroke="#2563EB" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="critical" name="Critical Triage (Red)" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Triage breakdown pie chart */}
            <Card className="lg:col-span-4 border-slate-200">
              <CardHeader className="pb-3 bg-slate-50/30">
                <CardTitle className="text-sm">Triage Category Distribution</CardTitle>
                <CardDescription>Breakdown by ESI classification.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col items-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_TRIAGE_BREAKDOWN}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {MOCK_TRIAGE_BREAKDOWN.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-600 mt-2">
                  {MOCK_TRIAGE_BREAKDOWN.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hospital Load stats */}
            <Card className="lg:col-span-12 border-slate-200">
              <CardHeader className="bg-slate-50/30 pb-3">
                <CardTitle className="text-sm">Hospital Resource Performance</CardTitle>
                <CardDescription>Bed availability and load profiles across target centers.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wide">
                        <th className="p-4">Hospital Name</th>
                        <th className="p-4">ICU Bed Utilization</th>
                        <th className="p-4">ER Bay Utilization</th>
                        <th className="p-4">Ventilators Standby</th>
                        <th className="p-4">Specialists</th>
                        <th className="p-4">Current Load</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {hospitals.map(h => {
                        const icuPct = Math.round(((h.icuBedsTotal - h.icuBedsAvailable) / h.icuBedsTotal) * 100);
                        const erPct = Math.round(((h.erBedsTotal - h.erBedsAvailable) / h.erBedsTotal) * 100);
                        return (
                          <tr key={h.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-800">{h.name}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Progress value={icuPct} className="w-16 h-1.5" />
                                <span>{icuPct}% ({h.icuBedsAvailable}/{h.icuBedsTotal} free)</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Progress value={erPct} className="w-16 h-1.5" />
                                <span>{erPct}% ({h.erBedsAvailable}/{h.erBedsTotal} free)</span>
                              </div>
                            </td>
                            <td className="p-4">{h.ventilatorsAvailable} / {h.ventilatorsTotal}</td>
                            <td className="p-4 text-[10px]">{h.specialists.join(', ')}</td>
                            <td className="p-4">
                              <Badge variant={h.currentEmergencyLoad === 'high' ? 'error' : h.currentEmergencyLoad === 'medium' ? 'warning' : 'green'}>
                                {h.currentEmergencyLoad.toUpperCase()}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* -------------------- TAB 2: HOSPITALS -------------------- */}
        {activeTab === 'hospitals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Hospitals catalog list */}
            <div className="lg:col-span-8 space-y-4">
              {hospitals.map(h => (
                <Card key={h.id} className="border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{h.name}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">{h.address}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-semibold mt-2">
                      <span>ICU: {h.icuBedsAvailable}/{h.icuBedsTotal} Available</span>
                      <span>ER: {h.erBedsAvailable}/{h.erBedsTotal} Available</span>
                      <span>Ventilators: {h.ventilatorsAvailable}/{h.ventilatorsTotal} Free</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={h.currentEmergencyLoad === 'high' ? 'warning' : 'green'}>
                      {h.currentEmergencyLoad.toUpperCase()} LOAD
                    </Badge>
                    
                    {/* Tiny inline modifier */}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateHospitalBeds(h.id, { icuBedsAvailable: Math.max(0, h.icuBedsAvailable - 1) })}
                      className="px-2 py-1 text-[10px] cursor-pointer"
                    >
                      Use ICU Bed
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add Hospital Form */}
            <div className="lg:col-span-4">
              <Card className="border-slate-200 shadow-md">
                <CardHeader className="bg-slate-50/50 pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <span>Onboard Hospital Facility</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddHospital} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label htmlFor="hname">Hospital Name</Label>
                      <Input id="hname" placeholder="Mercy General Hospital" value={newHospName} onChange={e => setNewHospName(e.target.value)} required />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="haddr">Address</Label>
                      <Input id="haddr" placeholder="123 Health Ave, NY" value={newHospAddr} onChange={e => setNewHospAddr(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="hlat">Latitude</Label>
                        <Input id="hlat" type="number" step="0.0001" value={newHospLat} onChange={e => setNewHospLat(Number(e.target.value))} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="hlng">Longitude</Label>
                        <Input id="hlng" type="number" step="0.0001" value={newHospLng} onChange={e => setNewHospLng(Number(e.target.value))} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="hicu">ICU Bed Capacity</Label>
                        <Input id="hicu" type="number" value={newHospICU} onChange={e => setNewHospICU(Number(e.target.value))} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="her">ER Bed Capacity</Label>
                        <Input id="her" type="number" value={newHospER} onChange={e => setNewHospER(Number(e.target.value))} required />
                      </div>
                    </div>

                    <Button type="submit" className="w-full font-bold cursor-pointer h-9 text-xs">
                      Register Hospital Network Node
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* -------------------- TAB 3: AMBULANCES -------------------- */}
        {activeTab === 'ambulances' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Catalog list */}
            <div className="lg:col-span-8 space-y-4">
              {ambulances.map(amb => (
                <Card key={amb.id} className="border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                        {amb.code} — <span className="font-mono text-xs">{amb.plateNumber}</span>
                      </h4>
                      <p className="text-slate-500 text-xs mt-0.5">Driver: {amb.driverName} • Paramedics: {amb.paramedics.join(', ')}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Location: {amb.currentLat.toFixed(4)}° N, {amb.currentLng.toFixed(4)}° W</p>
                    </div>
                  </div>

                  <div>
                    <Badge variant={
                      amb.status === 'available' ? 'green' : 
                      amb.status === 'assigned' ? 'info' : 
                      amb.status === 'busy' ? 'warning' : 'neutral'
                    }>
                      {amb.status.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add ambulance form */}
            <div className="lg:col-span-4">
              <Card className="border-slate-200 shadow-md">
                <CardHeader className="bg-slate-50/50 pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <span>Onboard Fleet Ambulance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAmbulance} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label htmlFor="acode">Ambulance Code</Label>
                      <Input id="acode" placeholder="e.g. AMB-105" value={newAmbCode} onChange={e => setNewAmbCode(e.target.value)} required />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="aplate">License Plate</Label>
                      <Input id="aplate" placeholder="NY-EMG-105" value={newAmbPlate} onChange={e => setNewAmbPlate(e.target.value)} required />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="adriver">Primary Driver Name</Label>
                      <Input id="adriver" placeholder="Marcus Vance" value={newAmbDriver} onChange={e => setNewAmbDriver(e.target.value)} required />
                    </div>

                    <Button type="submit" className="w-full font-bold cursor-pointer h-9 text-xs">
                      Register Fleet Vehicle
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* -------------------- TAB 4: CONFIG -------------------- */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AI engine weight parameters config */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="bg-slate-50/50 pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-primary" />
                  <span>AI Golden Hour Recommendation Weights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Geographical Transit Distance (ETA) weight</span>
                    <span className="text-primary font-bold">40%</span>
                  </div>
                  <Progress value={40} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>ICU Bed Availability priority</span>
                    <span className="text-primary font-bold">25%</span>
                  </div>
                  <Progress value={25} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Specialist standby match multiplier</span>
                    <span className="text-primary font-bold">20%</span>
                  </div>
                  <Progress value={20} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Emergency room load penalties</span>
                    <span className="text-primary font-bold">15%</span>
                  </div>
                  <Progress value={15} />
                </div>

                <Button className="w-full font-bold cursor-pointer h-9 text-xs mt-4">
                  Save Weight Constants
                </Button>
              </CardContent>
            </Card>

            {/* Notification triggers configs */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="bg-slate-50/50 pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BellRing className="w-4.5 h-4.5 text-primary" />
                  <span>Global Dispatch Notification Triggers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-100 rounded">
                  <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
                  <span>Push notification to hospitals on orange/red AI triage</span>
                </div>

                <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-100 rounded">
                  <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
                  <span>Auto SMS alert to stand-by cardiologists on chest pain symptoms</span>
                </div>

                <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-100 rounded">
                  <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
                  <span>Sound alert sirens on dispatcher panels for SpO2 &lt; 90%</span>
                </div>

                <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-100 rounded">
                  <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
                  <span>Trigger email summaries to directors upon case completions</span>
                </div>

                <Button className="w-full font-bold cursor-pointer h-9 text-xs mt-3">
                  Save Trigger Configuration
                </Button>
              </CardContent>
            </Card>

          </div>
        )}

      </main>

      <FloatingAIAssistant />
    </div>
  );
}
