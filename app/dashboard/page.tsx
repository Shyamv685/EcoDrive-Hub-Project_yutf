"use client"

import { useMemo, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js"
import dynamic from "next/dynamic"

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

// Leaflet (client only)
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false })

export default function DashboardPage() {
  const [tab, setTab] = useState<"bookings" | "services" | "eco">("bookings")

  const chartData = useMemo(() => ({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Eco Savings (kg CO2)",
        data: [2.1, 3.2, 4.0, 3.5, 2.8, 5.1, 4.2],
        borderColor: "#2E7D32",
        backgroundColor: "#A5D6A7",
      },
    ],
  }), [])

  return (
    <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-4">Dashboard</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("bookings")}
          className={`px-3 py-2 rounded border ${tab === "bookings" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Bookings
        </button>
        <button
          onClick={() => setTab("services")}
          className={`px-3 py-2 rounded border ${tab === "services" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Services
        </button>
        <button
          onClick={() => setTab("eco")}
          className={`px-3 py-2 rounded border ${tab === "eco" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Eco Profile
        </button>
      </div>

      {tab === "bookings" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Recent Bookings</h2>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between"><span>Tesla Model 3</span><span>45km • Completed</span></li>
              <li className="flex justify-between"><span>Toyota Prius</span><span>30km • Active</span></li>
              <li className="flex justify-between"><span>Nissan Leaf</span><span>55km • Completed</span></li>
            </ul>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Route Preview</h2>
            <div className="h-64 rounded overflow-hidden">
              <MapContainer center={[37.7749, -122.4194]} zoom={11} style={{ height: "100%", width: "100%" }}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[37.7749, -122.4194]} />
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "services" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Upcoming Services</h2>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between"><span>Battery Check (EV)</span><span>Due in 3 days</span></li>
              <li className="flex justify-between"><span>Hybrid System Service</span><span>Due in 7 days</span></li>
            </ul>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Service Map</h2>
            <div className="h-64 rounded overflow-hidden">
              <MapContainer center={[34.0522, -118.2437]} zoom={11} style={{ height: "100%", width: "100%" }}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[34.0522, -118.2437]} />
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "eco" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Eco Savings</h2>
            <Line data={chartData} />
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Profile</h2>
            <div className="text-sm space-y-2">
              <div>Eco Score: <span className="font-semibold">145</span></div>
              <div>Tier: <span className="font-semibold">Silver</span></div>
              <div>Credits: <span className="font-semibold">80</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
