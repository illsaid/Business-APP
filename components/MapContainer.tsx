
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Business } from '../types';

interface MapContainerProps {
  businesses: Business[];
  onMarkerClick: (business: Business) => void;
  selectedBusiness: Business | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({ businesses, onMarkerClick, selectedBusiness }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!leafletInstance.current) {
      leafletInstance.current = L.map(mapRef.current).setView([34.0928, -118.3617], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(leafletInstance.current);
      
      markersGroup.current = L.layerGroup().addTo(leafletInstance.current);
    }

    const group = markersGroup.current;
    if (group) {
      group.clearLayers();

      businesses.forEach(biz => {
        if (biz.location?.latitude && biz.location?.longitude) {
          const lat = parseFloat(biz.location.latitude);
          const lng = parseFloat(biz.location.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return;

          const isSelected = selectedBusiness?.location_account === biz.location_account;
          
          const marker = L.circleMarker([lat, lng], {
            radius: isSelected ? 8 : 5,
            fillColor: isSelected ? '#ef4444' : '#6366f1',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          });

          marker.on('click', () => onMarkerClick(biz));
          
          const popupContent = `
            <div class="p-2">
              <h4 class="font-bold text-slate-800">${biz.business_name}</h4>
              <p class="text-xs text-slate-500 mt-1">${biz.street_address}, ${biz.zip_code}</p>
              <p class="text-[10px] uppercase font-semibold text-indigo-600 mt-2">${biz.primary_naics_description || 'N/A'}</p>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.addTo(group);

          if (isSelected) {
            leafletInstance.current?.panTo([lat, lng]);
            marker.openPopup();
          }
        }
      });
    }
  }, [businesses, selectedBusiness, onMarkerClick]);

  return <div ref={mapRef} className="h-full w-full shadow-inner" />;
};
