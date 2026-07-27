import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix untuk masalah default icon leaflet di Vite/Webpack
// Membuat icon SVG pin merah kustom agar tidak bergantung pada asset lokal
const redIcon = new L.DivIcon({
  className: 'custom-div-icon bg-transparent border-none',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32px" height="32px" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export type MapWidgetProps = {
  latitude: number;
  longitude: number;
  photoUrl?: string;
  popupText?: string;
};

// Komponen helper untuk mengupdate titik tengah peta jika prop latitude/longitude berubah
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapWidget({
  latitude,
  longitude,
  photoUrl,
  popupText,
}: MapWidgetProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="flex flex-col gap-4">
      {/* Tampilkan foto di atas peta jika tersedia */}
      {photoUrl && (
        <div className="w-full relative overflow-hidden rounded-lg shadow-sm border border-slate-200">
          <img
            src={photoUrl}
            alt="Preview Lokasi"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Kontainer Peta */}
      {/* z-0 digunakan agar peta tidak menumpuk (overlap) dengan dropdown/modal tailwind lainnya */}
      <div className="w-full h-[300px] rounded-lg overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <ChangeMapView center={position} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={position} icon={redIcon}>
            <Popup>
              {popupText || (
                <div className="text-sm">
                  <strong>Koordinat Lokasi:</strong><br/>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </div>
              )}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
