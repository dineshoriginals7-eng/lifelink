import React, { useState } from 'react';
import { Hospital, HospitalTier, HospitalType } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input, Select } from '@/components/ui/Primitives';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Star, 
  Clock, 
  Bed, 
  Activity, 
  Filter, 
  X, 
  Search,
  CheckCircle2,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';

interface HospitalDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  onSelectHospital?: (hospital: Hospital) => void;
}

export const HospitalDatabaseModal: React.FC<HospitalDatabaseModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  onSelectHospital
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.specialists.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTier = selectedTier === 'all' || h.tier === selectedTier;
    const matchesType = selectedType === 'all' || h.hospitalType === selectedType;
    return matchesSearch && matchesTier && matchesType;
  });

  const getTierBadge = (tier: HospitalTier) => {
    switch (tier) {
      case 'Tier 1':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-bold">Tier 1 • High Congestion</Badge>;
      case 'Tier 2':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">Tier 2 • Moderate Traffic</Badge>;
      case 'Tier 3':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">Tier 3 • Highway Access</Badge>;
      default:
        return null;
    }
  };

  const getReadinessBadge = (status: string) => {
    switch (status) {
      case 'Ready':
        return <Badge variant="green" className="font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</Badge>;
      case 'Busy':
        return <Badge variant="warning" className="font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Busy</Badge>;
      case 'Full':
      case 'Critical':
        return <Badge variant="error" className="font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Registered Hospital Database</h2>
              <p className="text-xs text-slate-400">Real-time capacity, ICU beds, specialist availability & traffic tiering</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search hospital name, address, or specialist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white text-xs border-slate-200"
            />
          </div>
          
          <div className="sm:col-span-3">
            <Select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-white text-xs border-slate-200"
            >
              <option value="all">All Traffic Tiers</option>
              <option value="Tier 1">Tier 1 (Heavy Traffic)</option>
              <option value="Tier 2">Tier 2 (Moderate Traffic)</option>
              <option value="Tier 3">Tier 3 (Clear Roads)</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white text-xs border-slate-200"
            >
              <option value="all">All Hospital Types</option>
              <option value="Trauma Center">Trauma Center</option>
              <option value="Specialty Hospital">Specialty Hospital</option>
              <option value="Private">Private Hospital</option>
              <option value="Government">Government Hospital</option>
            </Select>
          </div>
        </div>

        {/* Hospital List Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50">
          {filteredHospitals.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold">No registered hospitals match your filter criteria.</p>
            </div>
          ) : (
            filteredHospitals.map(hospital => (
              <Card key={hospital.id} className="border-slate-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-white flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Card Header Banner Image */}
                  <div className="h-36 w-full relative bg-slate-800 overflow-hidden">
                    <img 
                      src={hospital.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80'} 
                      alt={hospital.name}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {getTierBadge(hospital.tier)}
                    </div>
                    <div className="absolute top-3 right-3">
                      {getReadinessBadge(hospital.emergencyReadiness)}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{hospital.rating}</span>
                      <span className="text-slate-400">• {hospital.hospitalType}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{hospital.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{hospital.address}</span>
                      </p>
                    </div>

                    {/* Bed Capacity Counters */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">ICU Beds</span>
                        <span className="text-sm font-extrabold text-blue-600">{hospital.icuBedsAvailable} / {hospital.icuBedsTotal}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">ER Beds</span>
                        <span className="text-sm font-extrabold text-slate-800">{hospital.erBedsAvailable} / {hospital.erBedsTotal}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Ventilators</span>
                        <span className="text-sm font-extrabold text-emerald-600">{hospital.ventilatorsAvailable} / {hospital.ventilatorsTotal}</span>
                      </div>
                    </div>

                    {/* Specialists Tags */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Specialists</span>
                      <div className="flex flex-wrap gap-1">
                        {hospital.specialists.map((spec, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contacts & Performance */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hospital.contactNumber}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Avg intake: {hospital.avgResponseTime}m</span>
                      </div>
                    </div>
                  </div>
                </div>

                {onSelectHospital && (
                  <div className="p-4 pt-0">
                    <Button 
                      onClick={() => {
                        onSelectHospital(hospital);
                        onClose();
                      }}
                      className="w-full text-xs font-semibold cursor-pointer"
                      variant="outline"
                    >
                      Assign to Active Incident
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
