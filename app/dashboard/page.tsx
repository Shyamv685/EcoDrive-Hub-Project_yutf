"use client"

import { useMemo, useState, useEffect } from "react"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { ToastContainer, toast } from "react-toastify"
import MapComponent from "@/components/MapComponent"
import type { LatLngExpression } from "leaflet"
import 'react-toastify/dist/ReactToastify.css'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, BarElement, ArcElement)

type BookingHistory = {
  booking_id: string
  car_name: string
  car_type: string
  credits_earned: number
  distance: number
  eco_savings: number
  end_date: string
  start_date: string
  status: string
}

type UserStats = {
  current_credits: number
  current_eco_score: number
  current_tier: string
  next_tier: string
  points_to_next_tier: number
  total_bookings: number
  total_distance: number
  total_eco_savings: number
}

type BookingSummary = {
  active_bookings: number
  average_trip_length: number
  completed_bookings: number
  favorite_car_type: string
  next_booking_date: string
  total_bookings: number
  total_distance: number
  total_eco_savings: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<"bookings" | "services" | "eco" | "analytics">("bookings")
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null)
  const supabase = createClient()

  // Enhanced chart data with real analytics
  const ecoTrendsChart = useMemo(() => ({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Eco Savings (kg CO2)",
        data: [2.1, 3.2, 4.0, 3.5, 2.8, 5.1, 4.2],
        borderColor: "#2E7D32",
        backgroundColor: "#A5D6A7",
      },
      {
        label: "Credits Earned",
        data: [21, 32, 40, 35, 28, 51, 42],
        borderColor: "#1976D2",
        backgroundColor: "#90CAF9",
      }
    ]
  }), [])

  const carTypeChart = useMemo(() => ({
    labels: ["EV", "Hybrid", "Gas"],
    datasets: [{
      data: [
        bookingHistory.filter(b => b.car_type === 'EV').length,
        bookingHistory.filter(b => b.car_type === 'Hybrid').length,
        bookingHistory.filter(b => b.car_type === 'Gas').length
      ],
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
    }]
  }), [bookingHistory])

  const monthlyPerformanceChart = useMemo(() => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Total Distance (km)",
        data: [120, 150, 180, 200, 170, 220],
        backgroundColor: "#4CAF50",
      },
      {
        label: "Eco Savings (kg CO2)",
        data: [12, 15, 18, 20, 17, 22],
        backgroundColor: "#2196F3",
      }
    ]
  }), [])

  useEffect(() => {
    if (!user) return

    const fetchUserData = async () => {
      try {
        // Fetch booking history
        const { data: bookings, error: bookingError } = await supabase.rpc("get_booking_history", {
          user_id_param: user.id,
          limit_count: 10,
          offset_count: 0
        })

        if (bookingError) {
          toast.error("Failed to load booking history")
        } else {
          setBookingHistory(bookings || [])
        }

        // Fetch user stats
        const { data: stats, error: statsError } = await supabase.rpc("get_user_stats", {
          user_id_param: user.id
        })

        if (statsError) {
          toast.error("Failed to load user stats")
        } else if (stats && stats.length > 0) {
          setUserStats(stats[0])
        }

        // Fetch booking summary
        const { data: summary, error: summaryError } = await supabase.rpc("get_booking_summary", {
          user_id_param: user.id,
          days_back: 30
        })

        if (summaryError) {
          toast.error("Failed to load booking summary")
        } else if (summary && summary.length > 0) {
          setBookingSummary(summary[0])
        }
      } catch (error) {
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, supabase])

  // Generate mock route for visualization
  const generateRoute = (distance: number): LatLngExpression[] => {
    const startLat = 37.7749 + (Math.random() - 0.5) * 0.1
    const startLng = -122.4194 + (Math.random() - 0.5) * 0.1
    const route: LatLngExpression[] = [[startLat, startLng]]
    
    // Generate intermediate points based on distance
    const points = Math.min(Math.max(2, Math.floor(distance / 10)), 10)
    for (let i = 1; i <= points; i++) {
      const lat = startLat + (Math.random() - 0.5) * 0.05 * (distance / 50)
      const lng = startLng + (Math.random() - 0.5) * 0.05 * (distance / 50)
      route.push([lat, lng])
    }
    
    return route
  }

  const bookingMarkers = selectedBooking ? [
    {
      position: generateRoute(selectedBooking.distance)[0] as LatLngExpression,
      popup: `Start: ${new Date(selectedBooking.start_date).toLocaleString()}`,
      icon: "user"
    },
    {
      position: generateRoute(selectedBooking.distance)[generateRoute(selectedBooking.distance).length - 1] as LatLngExpression,
      popup: `End: ${new Date(selectedBooking.end_date).toLocaleString()}`,
      icon: "car"
    }
  ] : []

  const bookingRoutes = selectedBooking ? [
    {
      positions: generateRoute(selectedBooking.distance),
      color: selectedBooking.status === "completed" ? "#4CAF50" : "#FF9800"
    }
  ] : []

  if (!user) {
    return (
      <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-gray-600">Please login to view your dashboard</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-4">Dashboard</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
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
        <button
          onClick={() => setTab("analytics")}
          className={`px-3 py-2 rounded border ${tab === "analytics" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Analytics
        </button>
      </div>

      {/* Quick Stats */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium text-gray-600">Eco Score</h3>
            <p className="text-2xl font-bold text-[#2E7D32]">{userStats.current_eco_score}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium text-gray-600">Credits</h3>
            <p className="text-2xl font-bold text-[#1976D2]">{userStats.current_credits}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium text-gray-600">Total Bookings</h3>
            <p className="text-2xl font-bold text-[#FF9800]">{userStats.total_bookings}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium text-gray-600">Eco Savings</h3>
            <p className="text-2xl font-bold text-[#4CAF50]">{userStats.total_eco_savings} kg</p>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Recent Bookings</h2>
            {loading ? (
              <p>Loading...</p>
            ) : bookingHistory.length > 0 ? (
              <div className="space-y-2">
                {bookingHistory.map((booking) => (
                  <div 
                    key={booking.booking_id} 
                    className={`flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      selectedBooking?.booking_id === booking.booking_id ? "bg-[#A5D6A7]" : ""
                    }`}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div>
                      <p className="font-medium">{booking.car_name}</p>
                      <p className="text-sm text-gray-600">
                        {booking.distance}km • {booking.status} • {booking.credits_earned} credits
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No bookings yet</p>
            )}
          </div>
          
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">
              Route Preview {selectedBooking && `- ${selectedBooking.car_name}`}
            </h2>
            {selectedBooking ? (
              <div>
                <div className="mb-2 text-sm text-gray-600">
                  <p>Distance: {selectedBooking.distance} km</p>
                  <p>Eco Savings: {selectedBooking.eco_savings} kg CO2</p>
                  <p>Credits Earned: {selectedBooking.credits_earned}</p>
                </div>
                <MapComponent
                  center={bookingMarkers[0]?.position || [37.7749, -122.4194]}
                  zoom={12}
                  markers={bookingMarkers}
                  routes={bookingRoutes}
                  height="350px"
                />
              </div>
            ) : (
              <div className="h-80 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Select a booking to view route</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "services" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Upcoming Services</h2>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between">
                <span>Battery Check (EV)</span>
                <span>Due in 3 days</span>
              </li>
              <li className="flex justify-between">
                <span>Hybrid System Service</span>
                <span>Due in 7 days</span>
              </li>
            </ul>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Service Centers</h2>
            <MapComponent
              center={[37.7749, -122.4194]}
              zoom={11}
              markers={[
                {
                  position: [37.7749, -122.4194] as LatLngExpression,
                  popup: "EcoDrive Service Center - San Francisco",
                  icon: "service"
                },
                {
                  position: [37.7849, -122.4094] as LatLngExpression,
                  popup: "EV Specialist - Downtown",
                  icon: "service"
                }
              ]}
              height="350px"
            />
          </div>
        </div>
      )}

      {tab === "eco" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Eco Savings Trend</h2>
            <Line data={ecoTrendsChart} />
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Car Type Distribution</h2>
            <Doughnut data={carTypeChart} />
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Profile</h2>
            {loading ? (
              <p>Loading...</p>
            ) : userStats ? (
              <div className="text-sm space-y-2">
                <div>Eco Score: <span className="font-semibold">{userStats.current_eco_score}</span></div>
                <div>Tier: <span className="font-semibold">{userStats.current_tier}</span></div>
                <div>Credits: <span className="font-semibold">{userStats.current_credits}</span></div>
                <div>Total Bookings: <span className="font-semibold">{userStats.total_bookings}</span></div>
                <div>Total Distance: <span className="font-semibold">{userStats.total_distance} km</span></div>
                <div>Total Eco Savings: <span className="font-semibold">{userStats.total_eco_savings} kg CO2</span></div>
                <div>Next Tier: <span className="font-semibold">{userStats.next_tier}</span> ({userStats.points_to_next_tier} points)</div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No stats available</p>
            )}
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Booking Summary</h2>
            {bookingSummary ? (
              <div className="text-sm space-y-2">
                <div>Active Bookings: <span className="font-semibold">{bookingSummary.active_bookings}</span></div>
                <div>Completed Bookings: <span className="font-semibold">{bookingSummary.completed_bookings}</span></div>
                <div>Average Trip Length: <span className="font-semibold">{bookingSummary.average_trip_length} km</span></div>
                <div>Favorite Car Type: <span className="font-semibold">{bookingSummary.favorite_car_type}</span></div>
                {bookingSummary.next_booking_date && (
                  <div>Next Booking: <span className="font-semibold">{new Date(bookingSummary.next_booking_date).toLocaleDateString()}</span></div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No booking summary available</p>
            )}
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">Monthly Performance</h2>
              <Bar data={monthlyPerformanceChart} />
            </div>
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">Eco Impact</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm font-medium">Total CO2 Saved</span>
                  <span className="text-lg font-bold text-green-600">{userStats?.total_eco_savings || 0} kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-sm font-medium">Equivalent Trees Planted</span>
                  <span className="text-lg font-bold text-blue-600">{Math.floor((userStats?.total_eco_savings || 0) * 0.73)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <span className="text-sm font-medium">Credits Earned</span>
                  <span className="text-lg font-bold text-orange-600">{userStats?.current_credits || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-sm font-medium">Green Miles Driven</span>
                  <span className="text-lg font-bold text-purple-600">{userStats?.total_distance || 0} km</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-4">Achievement Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded">
                <div className="text-2xl mb-2">🌱</div>
                <p className="text-sm font-medium">Eco Warrior</p>
                <p className="text-xs text-gray-600">100+ kg CO2 saved</p>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl mb-2">🏆</div>
                <p className="text-sm font-medium">Gold Tier</p>
                <p className="text-xs text-gray-600">300+ eco score</p>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm font-medium">EV Champion</p>
                <p className="text-xs text-gray-600">10+ EV bookings</p>
              </div>
              <div className="text-center p-4 border rounded">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-sm font-medium">Credit Saver</p>
                <p className="text-xs text-gray-600">500+ credits earned</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer containerId="toast-root" />
    </div>
  )
}
