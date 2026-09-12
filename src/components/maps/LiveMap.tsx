import React, { useEffect, useRef } from 'react';
import { Emergency, Hospital, Ambulance } from '@/types';
import { MapPin, ShieldAlert, Award, Navigation, Activity } from 'lucide-react';

interface LiveMapProps {
  emergency?: Emergency;
  hospitals: Hospital[];
  ambulances: Ambulance[];
}

export const LiveMap: React.FC<LiveMapProps> = ({ emergency, hospitals, ambulances }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // We map latitude and longitude coordinates into 2D canvas pixel coordinates
  // Manhattan coordinates box: 
  // North (Top): 40.795, South (Bottom): 40.655
  // West (Left): -74.020, East (Right): -73.925
  const latNorth = 40.795;
  const latSouth = 40.655;
  const lngWest = -74.020;
  const lngEast = -73.925;

  const getCanvasCoords = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng - lngWest) / (lngEast - lngWest)) * width;
    const y = height - ((lat - latSouth) / (latNorth - latSouth)) * height;
    return { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear with Slate Background
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw mock grid roads (Manhattan grid style)
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      
      // Vertical Avenues
      for (let x = 30; x < width; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal Streets
      for (let y = 20; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw East River / Hudson River curves
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(width * 0.15, height * 0.4, 0, height * 0.95);
      ctx.lineTo(0, height);
      ctx.lineTo(0, 0);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.quadraticCurveTo(width * 0.8, height * 0.5, width, height * 0.9);
      ctx.lineTo(width, height);
      ctx.lineTo(width, 0);
      ctx.fill();

      // 3. Draw Hospitals with Tier 1 (Red), Tier 2 (Orange), Tier 3 (Green) Badges
      hospitals.forEach(hospital => {
        const { x, y } = getCanvasCoords(hospital.lat, hospital.lng, width, height);
        
        // Tier badge colors
        const tierColor = hospital.tier === 'Tier 1' ? '#EF4444' : hospital.tier === 'Tier 2' ? '#F59E0B' : '#22C55E';
        
        // Glow effect
        ctx.fillStyle = `${tierColor}20`;
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, 2 * Math.PI);
        ctx.fill();

        // Pin base
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = tierColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner medical cross
        ctx.fillStyle = tierColor;
        ctx.fillRect(x - 2, y - 6, 4, 12);
        ctx.fillRect(x - 6, y - 2, 12, 4);

        // Hospital Label & Tier Pill
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hospital.name.split(' ').slice(0, 2).join(' '), x, y - 14);

        // Tier Indicator Pill
        ctx.fillStyle = tierColor;
        ctx.fillRect(x - 12, y + 12, 24, 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(hospital.tier || 'Tier 2', x, y + 19);
      });

      // 4. Draw Route Coordinates with Traffic Density stroke styling
      if (emergency && emergency.routeCoordinates && emergency.routeCoordinates.length > 0) {
        // Multi-segment traffic representation
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.shadowColor = 'rgba(37, 99, 235, 0.4)';
        ctx.shadowBlur = 8;
        
        for (let i = 0; i < emergency.routeCoordinates.length - 1; i++) {
          const pt1 = getCanvasCoords(emergency.routeCoordinates[i][0], emergency.routeCoordinates[i][1], width, height);
          const pt2 = getCanvasCoords(emergency.routeCoordinates[i + 1][0], emergency.routeCoordinates[i + 1][1], width, height);
          
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);

          // Color route based on traffic density segment
          ctx.strokeStyle = i % 3 === 0 ? '#EF4444' : i % 3 === 1 ? '#F59E0B' : '#22C55E';
          ctx.stroke();
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
      }

      // 5. Draw Patient Incident SOS Beacon
      if (emergency) {
        const { x, y } = getCanvasCoords(emergency.incidentLat, emergency.incidentLng, width, height);
        
        // Pulsing rings
        const time = Date.now() / 400;
        const radius1 = 10 + (time % 1) * 20;
        const opacity1 = 1 - (time % 1);

        ctx.strokeStyle = `rgba(239, 68, 68, ${opacity1})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius1, 0, 2 * Math.PI);
        ctx.stroke();

        // Pin core
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();

        // Label
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('INCIDENT SITE', x, y - 10);
      }

      // 6. Draw Ambulances
      ambulances.forEach(amb => {
        const { x, y } = getCanvasCoords(amb.currentLat, amb.currentLng, width, height);
        
        // Pulsing active highlight if assigned to current emergency
        const isAssigned = emergency?.ambulanceId === amb.id;
        
        if (isAssigned) {
          const time = Date.now() / 250;
          ctx.fillStyle = time % 2 === 0 ? 'rgba(37, 99, 235, 0.25)' : 'rgba(239, 68, 68, 0.25)';
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Vehicle Base
        ctx.fillStyle = amb.status === 'offline' ? '#94A3B8' : '#2563EB';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Direction Arrow
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();

        // Code Tag
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(amb.code, x, y + 16);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [emergency, hospitals, ambulances]);

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-xl overflow-hidden border border-border shadow-sm bg-slate-100 flex flex-col">
      {/* HUD Info Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-2 pointer-events-none">
        <div className="glass shadow-md rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Real-time GPS Dispatch Map</span>
        </div>
        {emergency && (
          <div className="bg-primary text-white shadow-md rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold">
            <Navigation className="w-3.5 h-3.5 animate-bounce" />
            <span>ETA: {emergency.etaMinutes || '--'} mins ({emergency.distanceKm || '--'} km)</span>
          </div>
        )}
      </div>

      <canvas 
        ref={canvasRef} 
        width={700} 
        height={450} 
        className="w-full h-full object-cover" 
      />

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-10 glass shadow-md rounded-lg px-3 py-2 flex items-center justify-between text-[10px] md:text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary border border-white" />
            <span>Ambulance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive border border-white" />
            <span>Emergency site</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-red-500">
            <span className="w-3 h-3 bg-red-100 border border-red-300 rounded flex items-center justify-center text-[8px] font-bold text-red-600">+</span>
            <span>Hospital</span>
          </div>
        </div>
        <div className="hidden sm:block text-slate-400">
          GIS Telemetry active • 40.7128° N, 74.0060° W
        </div>
      </div>
    </div>
  );
};
