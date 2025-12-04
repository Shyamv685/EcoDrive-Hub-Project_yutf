"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { ToastContainer, toast } from "react-toastify"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2"
import { format, subDays } from "date-fns"
import 'react-toastify/dist/ReactToastify.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

type DashboardStats = {
  active_bookings: number
  average_eco_score: number
  ev_percentage: number
  most_popular_location: string
  revenue_this_month: number
  total_bookings: number
  total_cars: number
  total_credits_awarded: number
  total_eco_savings: number
  total_users: number
}

type CarAnalytics = {
  average_booking_distance: number
  car_id: string
  car_name: string
  car_type: string
  total_bookings: number
  total_eco_savings: number
  total_revenue: number
  utilization_rate: number
}

type LeaderboardEntry = {
  credits: number
  eco_score: number
  green_tier: string
  total_bookings: number
  total_eco_savings: number
  user_email: string
  user_id: string
  user_name: string
}

type LocationAnalytics = {
  available_cars: number
  average_emission_rate: number
  eco_score_potential: number
  location: string
  total_bookings: number
  total_cars: number
}

type EcoTrend = {
  average_emission_rate: number
  date_bucket: string
  ev_bookings: number
  gas_bookings: number
  hybrid_bookings: number
  total_bookings: number
  total_eco_savings: number
}

type Car = {
  id: string
  name: string
  type: string
  emission_rate: number
  location: string
  available: boolean
  image_url: string
  latitude?: number
  longitude?: number
}

type Service = {
  id: string
  car_id: string
  type: string
  scheduled_date: string
  status: string
  discount_applied: boolean
}

export default function AdminPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "cars" | "services" | "analytics" | "users">("overview")
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [carAnalytics, setCarAnalytics] = useState<CarAnalytics[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [locationAnalytics, setLocationAnalytics] = useState<LocationAnalytics[]>([])
  const [ecoTrends, setEcoTrends] = useState<EcoTrend[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [services, setServices] = useState<Service[]>([])
  
  // Form states
  const [showCarForm, setShowCarForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase.rpc("is_admin", {
        user_id: user.id
      })
      
      if (error) {
        toast.error("Failed to check admin status")
        return
      }
      
      setIsAdmin(data || false)
      
      if (data) {
        fetchAllData()
      } else {
        setLoading(false)
      }
    } catch (error) {
      toast.error("Failed to check admin status")
      setLoading(false)
    }
  }

  const fetchAllData = async () => {
    try {
      const [
        dashboardStatsRes,
        carAnalyticsRes,
        leaderboardRes,
        locationAnalyticsRes,
        ecoTrendsRes,
        carsRes,
        servicesRes
      ] = await Promise.all([
        supabase.rpc("get_dashboard_stats"),
        supabase.rpc("get_car_analytics"),
        supabase.rpc("get_leaderboard"),
        supabase.rpc("get_location_analytics"),
        supabase.rpc("get_eco_trends", { days_back: 30 }),
        supabase.from("cars").select("*"),
        supabase.from("services").select("*").order("scheduled_date", { ascending: false }).limit(20)
      ])

      if (dashboardStatsRes.data && dashboardStatsRes.data.length > 0) {
        setDashboardStats(dashboardStatsRes.data[0])
      }
      
      setCarAnalytics(carAnalyticsRes.data || [])
      setLeaderboard(leaderboardRes.data || [])
      setLocationAnalytics(locationAnalyticsRes.data || [])
      setEcoTrends(ecoTrendsRes.data || [])
      setCars(carsRes.data || [])
      setServices(servicesRes.data || [])
    } catch (error) {
      toast.error("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  // Chart data preparation
  const carTypeChartData = {
    labels: ["EV", "Hybrid", "Gas"],
    datasets: [{
      label: "Cars by Type",
      data: [
        cars.filter(c => c.type === "EV").length,
        cars.filter(c => c.type === "Hybrid").length,
        cars.filter(c => c.type === "Gas").length
      ],
      backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"]
    }]
  }

  const ecoTrendsChartData = {
    labels: ecoTrends.map(trend => format(new Date(trend.date_bucket), "MMM dd")),
    datasets: [
      {
        label: "EV Bookings",
        data: ecoTrends.map(trend => trend.ev_bookings),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)"
      },
      {
        label: "Hybrid Bookings",
        data: ecoTrends.map(trend => trend.hybrid_bookings),
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.1)"
      },
      {
        label: "Gas Bookings",
        data: ecoTrends.map(trend => trend.gas_bookings),
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.1)"
      }
    ]
  }

  const locationChartData = {
    labels: locationAnalytics.map(loc => loc.location),
    datasets: [{
      label: "Bookings by Location",
      data: locationAnalytics.map(loc => loc.total_bookings),
      backgroundColor: "#2E7D32"
    }]
  }

  const utilizationChartData = {
    labels: carAnalytics.slice(0, 10).map(car => car.car_name),
    datasets: [{
      label: "Utilization Rate (%)",
      data: carAnalytics.slice(0, 10).map(car => car.utilization_rate),
      backgroundColor: "#4CAF50"
    }]
  }

  if (!user) {
    return (
      <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-gray-600">Please login to access admin panel</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-gray-600">Loading admin panel...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-[#2E7D32] mb-6">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b">
        {["overview", "cars", "services", "analytics", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 capitalize ${
              activeTab === tab
                ? "border-b-2 border-[#2E7D32] text-[#2E7D32]"
                : "text-gray-600 hover:text-[#2E7D32]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && dashboardStats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <p className="text-2xl font-bold text-[#2E7D32]">{dashboardStats.total_users}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600">Total Cars</h3>
              <p className="text-2xl font-bold text-[#2E7D32]">{dashboardStats.total_cars}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600">Active Bookings</h3>
              <p className="text-2xl font-bold text-[#2E7D32]">{dashboardStats.active_bookings}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600">Revenue This Month</h3>
              <p className="text-2xl font-bold text-[#2E7D32]">${dashboardStats.revenue_this_month}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Cars by Type</h3>
              <Pie data={carTypeChartData} />
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Bookings by Location</h3>
              <Bar data={locationChartData} />
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600">Total Eco Savings</h3>
              <p className="text-xl font-bold text-green-600">{dashboardStats.total_eco_savings} kg CO2</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600">EV Percentage</h3>
              <p className="text-xl font-bold text-green-600">{dashboardStats.ev_percentage}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-600">Most Popular Location</h3>
              <p className="text-xl font-bold text-[#2E7D32]">{dashboardStats.most_popular_location}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cars Management Tab */}
      {activeTab === "cars" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Car Management</h2>
            <button
              onClick={() => setShowCarForm(true)}
              className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded"
            >
              Add New Car
            </button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Emission Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Available</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td className="px-4 py-3 text-sm">{car.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          car.type === "EV" ? "bg-green-100 text-green-800" :
                          car.type === "Hybrid" ? "bg-blue-100 text-blue-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {car.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{car.location}</td>
                      <td className="px-4 py-3 text-sm">{car.emission_rate} g/km</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          car.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {car.available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => setEditingCar(car)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCar(car.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Services Management Tab */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Service Management</h2>
            <button
              onClick={() => setShowServiceForm(true)}
              className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded"
            >
              Schedule Service
            </button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Service Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Car ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Scheduled Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Discount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-4 py-3 text-sm">{service.type}</td>
                      <td className="px-4 py-3 text-sm">{service.car_id}</td>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(service.scheduled_date), "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          service.status === "completed" ? "bg-green-100 text-green-800" :
                          service.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {service.discount_applied ? (
                          <span className="text-green-600">Applied</span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => setEditingService(service)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Analytics & Insights</h2>

          {/* Eco Trends Chart */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Eco Trends (Last 30 Days)</h3>
            <Line data={ecoTrendsChartData} />
          </div>

          {/* Car Utilization */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Car Utilization Rates</h3>
            <Bar data={utilizationChartData} />
          </div>

          {/* Top Performers */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Top Performing Cars</h3>
              <div className="space-y-2">
                {carAnalytics.slice(0, 5).map((car, index) => (
                  <div key={car.car_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{car.car_name}</p>
                      <p className="text-sm text-gray-600">{car.car_type} • {car.total_bookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${car.total_revenue}</p>
                      <p className="text-sm text-gray-600">{car.utilization_rate}% utilization</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Location Performance</h3>
              <div className="space-y-2">
                {locationAnalytics.map((location) => (
                  <div key={location.location} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{location.location}</p>
                      <p className="text-sm text-gray-600">{location.total_cars} cars • {location.available_cars} available</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{location.total_bookings} bookings</p>
                      <p className="text-sm text-gray-600">{location.eco_score_potential} eco potential</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">User Leaderboard</h2>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Eco Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Credits</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Bookings</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Eco Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leaderboard.map((user, index) => (
                    <tr key={user.user_id}>
                      <td className="px-4 py-3 text-sm font-medium">#{index + 1}</td>
                      <td className="px-4 py-3 text-sm">{user.user_name}</td>
                      <td className="px-4 py-3 text-sm">{user.user_email}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">{user.eco_score}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.green_tier === "Gold" ? "bg-yellow-100 text-yellow-800" :
                          user.green_tier === "Silver" ? "bg-gray-100 text-gray-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {user.green_tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{user.credits}</td>
                      <td className="px-4 py-3 text-sm">{user.total_bookings}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{user.total_eco_savings} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ToastContainer containerId="toast-root" />
    </div>
  )
}

// Helper functions (to be implemented)
const deleteCar = async (carId: string) => {
  // Implementation for car deletion
  console.log("Delete car:", carId)
}

const deleteService = async (serviceId: string) => {
  // Implementation for service deletion
  console.log("Delete service:", serviceId)
}
