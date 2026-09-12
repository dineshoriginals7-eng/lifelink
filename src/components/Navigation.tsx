import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { 
  Activity, 
  Bell, 
  LogOut, 
  UserCheck, 
  Map, 
  Truck, 
  Building2, 
  UserSquare2, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  Database
} from 'lucide-react';
import { Badge, Button, Card } from './ui/Primitives';
import { UserRole } from '@/types';
import { HospitalDatabaseModal } from '@/components/hospitals/HospitalDatabaseModal';

export const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, loginAs, notifications, markNotificationAsRead, hospitals } = useEmergencyStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHospitalDb, setShowHospitalDb] = useState(false);

  const activeNotifications = notifications.filter(n => !n.isRead);
  const displayRoleName = (role?: UserRole) => {
    if (!role) return '';
    return role.toUpperCase();
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="w-4 h-4 text-slate-700" />;
      case 'dispatcher': return <Map className="w-4 h-4 text-primary" />;
      case 'ambulance': return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'hospital': return <Building2 className="w-4 h-4 text-amber-500" />;
      case 'doctor': return <UserSquare2 className="w-4 h-4 text-rose-500" />;
      default: return <UserCheck className="w-4 h-4" />;
    }
  };

  const handleQuickSwitch = (role: UserRole) => {
    loginAs(role);
    router.push(`/${role}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <div className="bg-white border-b border-slate-200/60 sticky top-0 z-30 shadow-xs">
      {/* Hospital Database Modal */}
      <HospitalDatabaseModal
        isOpen={showHospitalDb}
        onClose={() => setShowHospitalDb(false)}
        hospitals={hospitals}
      />

      {/* Simulation Helper Banner */}
      <div className="bg-primary/5 border-b border-primary/10 py-1.5 px-6 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Interactive Simulation Helper: Switch stakeholder role views →</span>
        </div>
        <div className="flex items-center gap-2">
          {(['dispatcher', 'ambulance', 'hospital', 'doctor', 'admin'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => handleQuickSwitch(role)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                pathname.startsWith(`/${role}`) 
                  ? 'bg-primary text-white border-primary shadow-xs' 
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {role.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Nav Header */}
      <header className="px-6 py-3 flex items-center justify-between">
        {/* Left Brand & Primary Workspaces */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
            <img 
              src="/logo.png" 
              alt="LifeLink" 
              className="h-8 sm:h-9 w-auto object-contain" 
            />
          </Link>

          {/* Main Workspaces Nav Tabs */}
          <nav className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-6">
            <Link
              href="/ambulance"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                pathname.startsWith('/ambulance')
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ambulance Workspace</span>
            </Link>

            <Link
              href="/hospital"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                pathname.startsWith('/hospital')
                  ? 'bg-blue-600/10 text-blue-700 border border-blue-500/20 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Hospital Workspace</span>
            </Link>

            <button
              onClick={() => setShowHospitalDb(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span>Hospital DB</span>
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {activeNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse">
                  {activeNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-40 border-slate-200 shadow-xl bg-white flex flex-col">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-800">Alert Center</span>
                  {activeNotifications.length > 0 && (
                    <Badge variant="error" className="text-[10px]">
                      {activeNotifications.length} Active
                    </Badge>
                  )}
                </div>
                <div className="flex-1 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-mono">
                      No notifications reported
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs space-y-1 ${
                          !notif.isRead ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{notif.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                        {!notif.isRead && (
                          <span className="text-[9px] text-primary font-bold flex items-center justify-end">
                            ● Mark Read
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* User Profile Info */}
          {currentUser && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  {getRoleIcon(currentUser.role)}
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    {displayRoleName(currentUser.role)}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                size="sm" 
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};
