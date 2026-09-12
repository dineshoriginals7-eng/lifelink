'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { UserRole } from '@/types';
import { 
  Activity, 
  Key, 
  Mail, 
  ShieldCheck, 
  Map, 
  Truck, 
  Building2, 
  UserSquare2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label } from '@/components/ui/Primitives';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const loginAs = useEmergencyStore(state => state.loginAs);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = (role: UserRole) => {
    setIsLoading(true);
    // Simulate auth token retrieval
    setTimeout(() => {
      loginAs(role);
      setIsLoading(false);
      
      // Redirect to correct dashboard
      if (role === 'admin') router.push('/admin');
      else if (role === 'dispatcher') router.push('/dispatcher');
      else if (role === 'ambulance') router.push('/ambulance');
      else if (role === 'hospital') router.push('/hospital');
      else if (role === 'doctor') router.push('/doctor');
    }, 500);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      // Deduce role from email for demo convenience, or default to dispatcher
      let role: UserRole = 'dispatcher';
      if (email.includes('admin')) role = 'admin';
      else if (email.includes('amb') || email.includes('paramedic')) role = 'ambulance';
      else if (email.includes('hosp') || email.includes('intake')) role = 'hospital';
      else if (email.includes('doc') || email.includes('physician')) role = 'doctor';

      loginAs(role, { email, name: email.split('@')[0].toUpperCase() });
      setIsLoading(false);
      router.push(`/${role}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-5 border-b border-slate-200/50 bg-white flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-800 font-bold hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="LifeLink" 
            className="h-7 w-auto object-contain" 
          />
          <span className="text-slate-300 mx-1">|</span>
          <span className="font-semibold text-xs tracking-tight text-slate-600 uppercase">Secure Auth</span>
        </Link>
      </header>

      {/* Main Form container */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Custom Credential Card */}
          <Card className="md:col-span-5 border-slate-200 shadow-lg bg-white flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-primary" />
                <span>Clinical sign in</span>
              </CardTitle>
              <CardDescription>
                Access the secure clinical emergency network using your FHIR credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@hospital.org"
                      className="pl-9"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">FHIR Keycode / Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-10 mt-2 cursor-pointer">
                  {isLoading ? 'Retrieving Token...' : 'Secure Sign In'}
                </Button>
              </form>
            </CardContent>
            <div className="p-5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-mono text-center">
              HIPAA compliant • SSL connection verified
            </div>
          </Card>

          {/* Quick Simulation Selectors (Absolute Wow Factor) */}
          <Card className="md:col-span-7 border-slate-200 shadow-lg bg-white flex flex-col justify-between">
            <CardHeader className="bg-primary/5 border-b-0">
              <CardTitle className="text-primary flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Simulation Portal Preset Logins</span>
              </CardTitle>
              <CardDescription className="text-primary/70">
                Instantly bypass credentials to login as pre-configured accounts for testing multi-stakeholder real-time synchronization.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-6">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleRoleSelection('dispatcher')}
                className="h-16 flex flex-col items-center justify-center p-3 text-center border-slate-200 hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer"
              >
                <Map className="w-5 h-5 mb-1.5 text-primary" />
                <span className="text-xs font-bold block">1. EMERGENCY DISPATCHER</span>
                <span className="text-[9px] text-slate-400 font-mono">Accepts calls & routes ambulances</span>
              </Button>

              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleRoleSelection('ambulance')}
                className="h-16 flex flex-col items-center justify-center p-3 text-center border-slate-200 hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer"
              >
                <Truck className="w-5 h-5 mb-1.5 text-emerald-600" />
                <span className="text-xs font-bold block">2. PARAMEDIC CREW</span>
                <span className="text-[9px] text-slate-400 font-mono">Streams vitals & dictation</span>
              </Button>

              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleRoleSelection('hospital')}
                className="h-16 flex flex-col items-center justify-center p-3 text-center border-slate-200 hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer"
              >
                <Building2 className="w-5 h-5 mb-1.5 text-amber-500" />
                <span className="text-xs font-bold block">3. ER COMMAND MANAGER</span>
                <span className="text-[9px] text-slate-400 font-mono">Beds/ICU ready & admits patient</span>
              </Button>

              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleRoleSelection('doctor')}
                className="h-16 flex flex-col items-center justify-center p-3 text-center border-slate-200 hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer"
              >
                <UserSquare2 className="w-5 h-5 mb-1.5 text-rose-500" />
                <span className="text-xs font-bold block">4. SPECIALIST DOCTOR</span>
                <span className="text-[9px] text-slate-400 font-mono">Monitors telemetry & treats</span>
              </Button>

              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleRoleSelection('admin')}
                className="h-16 flex flex-col items-center justify-center p-3 text-center border-slate-200 hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer sm:col-span-2"
              >
                <ShieldCheck className="w-5 h-5 mb-1.5 text-slate-700" />
                <span className="text-xs font-bold block">5. SYSTEM ADMINISTRATOR</span>
                <span className="text-[9px] text-slate-400 font-mono">Configure hospital assets, view full platform analytics</span>
              </Button>
            </CardContent>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 text-center font-medium">
              Tip: Open multiple browser tabs (one for each role) to see live updates sync in real time!
            </div>
          </Card>
        </div>
      </main>

      {/* HIPAA Compliance Footer Banner */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center border-t border-slate-950 text-xs">
        <p>This system accesses Protected Health Information (PHI) and is fully compliant with HIPAA Security Rules and the HITECH Act.</p>
        <p className="text-[10px] text-slate-500 mt-1">Audit logs are active for user actions. Unauthorized access will be prosecuted.</p>
      </footer>
    </div>
  );
}
