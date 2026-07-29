import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react';
import { BPD_ADAT_MENU } from './menu';
import apiClient from '../../lib/apiClient';

export default function AdatCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [scheduledEvents, setScheduledEvents] = useState<Record<number, any>>({});

  useEffect(() => {
    apiClient.get('/dashboard/bpd-adat/calendar')
      .then(res => {
        setScheduledEvents(res.data);
      })
      .catch(console.error);
  }, []);

  // Simple calendar logic
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Generate blank cells for days before the 1st
  const blanks = Array(firstDayOfMonth).fill(null);
  // Generate actual day cells
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalCells = [...blanks, ...days];

  return (
    <RoleLayout menuItems={BPD_ADAT_MENU} userName="Dewan & Tokoh Adat" userRole="BPD & Adat">
      <PageHeader 
        title="Kalender Musyawarah" 
        description="Jadwal persidangan adat, mediasi warga, dan rapat BPD terkait pengawasan desa."
      />

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        
        {/* Kolom Kiri: Kalender */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-brand-600" />
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex gap-2">
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {totalCells.map((day, idx) => {
              if (day === null) {
                return <div key={`blank-${idx}`} className="h-14 md:h-20 bg-slate-50/50 rounded-xl"></div>;
              }

              const isToday = day === today.getDate();
              const hasEvent = !!scheduledEvents[day];
              const isSelected = selectedDate === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    h-14 md:h-20 relative flex flex-col items-center pt-2 rounded-xl border transition-all
                    ${isSelected ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-100 bg-white hover:border-brand-300 hover:bg-slate-50'}
                  `}
                >
                  <span className={`text-sm md:text-base font-bold ${isToday ? 'text-brand-600' : 'text-slate-700'}`}>
                    {day}
                  </span>
                  
                  {hasEvent && (
                    <div className="mt-1 flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Detail Jadwal */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-800">Detail Jadwal</h3>
          
          {!selectedDate ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full">
              <CalendarDays className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium text-sm">Pilih tanggal pada kalender untuk melihat detail musyawarah.</p>
            </div>
          ) : !scheduledEvents[selectedDate] ? (
             <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full">
               <p className="text-slate-500 font-medium text-sm">Tidak ada jadwal musyawarah pada tanggal ini.</p>
             </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
              <div className="inline-block px-3 py-1 bg-brand-100 text-brand-700 font-bold text-xs rounded-full mb-4">
                {scheduledEvents[selectedDate].type}
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-4 leading-tight">
                {scheduledEvents[selectedDate].title}
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Waktu</div>
                    <div className="text-sm font-bold text-slate-800">{scheduledEvents[selectedDate].time}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lokasi</div>
                    <div className="text-sm font-bold text-slate-800">{scheduledEvents[selectedDate].location}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pihak Terlibat</div>
                    <ul className="text-sm font-medium text-slate-700 list-disc list-inside">
                      {scheduledEvents[selectedDate].parties.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {scheduledEvents[selectedDate].description}
                </p>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </RoleLayout>
  );
}
