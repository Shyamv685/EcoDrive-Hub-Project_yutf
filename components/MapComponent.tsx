"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { LatLngExpression } from "leaflet"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false })

interface MapComponentProps {
  center: LatLngExpression
  zoom?: number
  markers?: Array<{
    position: LatLngExpression
    popup?: string
    icon?: string
  }>
  routes?: Array<{
    positions: LatLngExpression[]
    color?: string
  }>
  height?: string
  onLocationSelect?: (lat: number, lng: number) => void
  showLocationSelector?: boolean
}

export default function MapComponent({
  center,
  zoom = 13,
  markers = [],
  routes = [],
  height = "400px",
  onLocationSelect,
  showLocationSelector = false
}: MapComponentProps) {
  const [L, setL] = useState<any>(null)
  const [map, setMap] = useState<any>(null)

  useEffect(() => {
    // Import Leaflet only on client side
    import("leaflet").then((leaflet) => {
      setL(leaflet)
      
      // Fix for default markers in React
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })
    })
  }, [])

  const handleMapClick = (e: any) => {
    if (onLocationSelect && showLocationSelector) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  }

  const createCustomIcon = (iconType: string) => {
    if (!L) return null
    
    const iconUrls = {
      car: "🚗",
      ev: "🔋",
      hybrid: "🔌",
      gas: "⛽",
      service: "🔧",
      user: "👤"
    }

    return L.divIcon({
      html: `<div style="background: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid #2E7D32;">${iconUrls[iconType as keyof typeof iconUrls] || "📍"}</div>`,
      className: "custom-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
  }

  if (!L) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        ref={setMap}
        onclick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={marker.icon ? createCustomIcon(marker.icon) : undefined}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        {routes.map((route, index) => (
          <Polyline
            key={index}
            positions={route.positions}
            color={route.color || "#2E7D32"}
            weight={4}
            opacity={0.7}
          />
        ))}
      </MapContainer>
    </div>
  )
}
