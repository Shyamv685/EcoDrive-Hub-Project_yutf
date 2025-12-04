"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
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
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import 'react-toastify/dist/ReactToastify.css'

ChartJS.register(
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  BarElement,
  ArcElement
)

type CarForm = {
  name: string
  type: "EV" | "Hybrid" | "Gas"
  emission_rate: number
  location: string
  latitude?: number
  longitude?: number
  image_url?: string
}

type ServiceForm = {
  car_id: string
  type: string
  scheduled_date: string
}

type DashboardStats = {
  total_users: number
  total_cars: number
  total_bookings: number
  active_bookings: number
  total_eco_savings: number
  total_credits_awarded: number
  average_eco_score: number
  ev_percentage: number
  most_popular_location: string
  revenue_this_month: number
}

type CarAnalytics = {
  car_id: string
  car_name: string
  car_type: string
  total_bookings: number
  total_revenue: number
  average_booking_distance: number
  utilization_rate: number
  total_eco_savings: number
}

type LeaderboardEntry = {
  user_id: string
  user_name: string
  user_email: string
  eco_score: number
  green_tier: string
  credits: number
  total_bookings: number
  total_eco_savings: number
}

export default function AdminPage() {
  const { user } = useAuth()
  const { register, handleSubmit, reset } = useForm<CarForm>()
  const { register: registerService, handleSubmit: handleServiceSubmit, reset: resetService } = useForm<ServiceForm>()
  const [tab, setTab] = useState<"overview" | "cars" | "services" | "analytics" | "users">("overview")
  const [loading, setLoading] = useState(false)
  const [cars, setCars] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [carAnalytics, setCarAnalytics] = useState<CarAnalytics[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [ecoTrends, setEcoTrends] = useState<any[]>([])
  const [revenueTrends, setRevenueTrends] = useState<any[]>([])
  const [userGrowthTrends, setUserGrowthTrends] = useState<any[]>([])
  const [carUtilizationTrends, setCarUtilizationTrends] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [user])

  const checkAdminAccess = async () => {
    if (!user) {
      console.log('[Admin] No user found, skipping admin check')
      return
    }
    
    console.log('[Admin] useEffect checkAdminAccess triggered. user:', user.id)
    
    try {
      const { data, error } = await supabase.rpc("is_admin", {
        user_id: user.id
      })
      
      console.log('[Admin] is_admin RPC result. error:', error, 'data:', data)
      
      if (error || !data) {
        toast.error("Access denied. Admin privileges required.")
        return
      }
      
      setIsAdmin(true)
      fetchDashboardData()
    } catch (error) {
      console.error('[Admin] Failed to check admin access:', error)
      toast.error("Failed to verify admin access")
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch dashboard stats
      const { data: stats, error: statsError } = await supabase.rpc("get_dashboard_stats")
      console.log('[Admin] get_dashboard_stats RPC. error:', statsError, 'data:', stats)
      if (!statsError && stats && stats.length > 0) {
        setDashboardStats(stats[0])
      }

      // Fetch cars
      const { data: carsData, error: carsError } = await supabase.from("cars").select("*")
      console.log('[Admin] cars table fetch. error:', carsError, 'data:', carsData)
      if (!carsError) {
        setCars(carsData || [])
      }

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase.from("services").select("*")
      console.log('[Admin] services table fetch. error:', servicesError, 'data:', servicesData)
      if (!servicesError) {
        setServices(servicesData || [])
      }

      // Fetch car analytics
      const { data: analyticsData, error: analyticsError } = await supabase.rpc("get_car_analytics")
      console.log('[Admin] get_car_analytics RPC. error:', analyticsError, 'data:', analyticsData)
      if (!analyticsError) {
        setCarAnalytics(analyticsData || [])
      }

      // Fetch leaderboard
      const { data: leaderboardData, error: leaderboardError } = await supabase.rpc("get_leaderboard")
      console.log('[Admin] get_leaderboard RPC. error:', leaderboardError, 'data:', leaderboardData)
      if (!leaderboardError) {
        setLeaderboard(leaderboardData || [])
      }

      // Fetch trends data
      const { data: ecoData } = await supabase.rpc("get_eco_trends_formatted", { days_back: 30 })
      console.log('[Admin] get_eco_trends_formatted RPC. ecoData:', ecoData)
      setEcoTrends(ecoData || [])

      const { data: revenueData } = await supabase.rpc("get_revenue_trends", { months_back: 12 })
      console.log('[Admin] get_revenue_trends RPC. revenueData:', revenueData)
      setRevenueTrends(revenueData || [])

      const { data: userGrowthData } = await supabase.rpc("get_user_growth_trends", { months_back: 12 })
      console.log('[Admin] get_user_growth_trends RPC. userGrowthData:', userGrowthData)
      setUserGrowthTrends(userGrowthData || [])

      const { data: utilizationData } = await supabase.rpc("get_car_utilization_trends", { days_back: 30 })
      console.log('[Admin] get_car_utilization_trends RPC. utilizationData:', utilizationData)
      setCarUtilizationTrends(utilizationData || [])
    } catch (error) {
      console.error('[Admin] Failed to load admin data:', error)
      toast.error("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  const addCar = async (data: CarForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("cars").insert({
        name: data.name,
        type: data.type,
        emission_rate: data.emission_rate,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        image_url: data.image_url,
        available: true
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Car added successfully!")
      reset()
      fetchDashboardData()
    } catch (error) {
      toast.error("Failed to add car")
    } finally {
      setLoading(false)
    }
  }

  const deleteCar = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return

    try {
      const { error } = await supabase.from("cars").delete().eq("id", carId)
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Car deleted successfully!")
      fetchDashboardData()
    } catch (error) {
      toast.error("Failed to delete car")
    }
  }

  const addService = async (data: ServiceForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("services").insert({
        car_id: data.car_id,
        type: data.type,
        scheduled_date: data.scheduled_date,
        status: "scheduled",
        discount_applied: false
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Service added successfully!")
      resetService()
      fetchDashboardData()
    } catch (error) {
      toast.error("Failed to add service")
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const { error } = await supabase.from("services").delete().eq("id", serviceId)
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Service deleted successfully!")
      fetchDashboardData()
    } catch (error) {
      toast.error("Failed to delete service")
    }
  }

  // Chart configurations
  const ecoTrendsChart = {
    labels: ecoTrends.slice().reverse().map(t => t.date_bucket),
    datasets: [
      {
        label: 'Total Bookings',
        data: ecoTrends.slice().reverse().map(t => t.total_bookings),
        borderColor: '#2E7D32',
        backgroundColor: '#A5D6A7',
      },
      {
        label: 'EV Bookings',
        data: ecoTrends.slice().reverse().map(t => t.ev_bookings),
        borderColor: '#1976D2',
        backgroundColor: '#90CAF9',
      },
      {
        label: 'Hybrid Bookings',
        data: ecoTrends.slice().reverse().map(t => t.hybrid_bookings),
        borderColor: '#FF9800',
        backgroundColor: '#FFCC80',
      }
    ]
  }

  const revenueChart = {
    labels: revenueTrends.slice().reverse().map(t => t.month_bucket),
    datasets: [
      {
        label: 'Total Revenue ($)',
        data: revenueTrends.slice().reverse().map(t => t.total_revenue),
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Eco Savings Bonus ($)',
        data: revenueTrends.slice().reverse().map(t => t.eco_savings_bonus),
        backgroundColor: '#2196F3',
      }
    ]
  }

  const carTypeDistribution = {
    labels: ['EV', 'Hybrid', 'Gas'],
    datasets: [{
      data: [
        cars.filter(c => c.type === 'EV').length,
        cars.filter(c => c.type === 'Hybrid').length,
        cars.filter(c => c.type === 'Gas').length
      ],
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
    }]
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-4">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setTab("overview")}
          className={`px-3 py-2 rounded border ${tab === "overview" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab("cars")}
          className={`px-3 py-2 rounded border ${tab === "cars" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Cars
        </button>
        <button
          onClick={() => setTab("services")}
          className={`px-3 py-2 rounded border ${tab === "services" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Services
        </button>
        <button
          onClick={() => setTab("analytics")}
          className={`px-3 py-2 rounded border ${tab === "analytics" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-3 py-2 rounded border ${tab === "users" ? "bg-[#A5D6A7] text-[#2E7D32]" : ""}`}
        >
          Users
        </button>
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          {dashboardStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded p-4">
                <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                <p className="text-2xl font-bold text-[#2E7D32]">{dashboardStats.total_users}</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="text-sm font-medium text-gray-600">Total Cars</h3>
                <p className="text-2xl font-bold text-[#2E7D32]">{dashboardStats.total_cars}</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="text-sm font-medium text-gray-600">Total Bookings</h3>
                <p className="text-2xl font-bold text-[#2E7D32]">{dashboardStats.total_bookings}</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="text-sm font-medium text-gray-600">Revenue This Month</h3>
                <p className="text-2xl font-bold text-[#2E7D32]">${dashboardStats.revenue_this_month}</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="text-sm font-medium text-gray-600">Active Bookings</h3>
                <p className="text-2xl font-bold text-[#1976D2]">{dashboardStats.active_bookings}</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="text-sm font-medium text-gray-600">Total Eco Savings</h3>
                <p className="text-2xl font-bold text-[#4CAF50]">{dashboardStats.total_eco_savings} kg CO2</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="text-sm font-medium text-gray-600">EV Percentage</h3>
                <p className="text-2xl font-bold text-[#2196F3]">{dashboardStats.ev_percentage}%</p>
              </div>
              <div className="border rounded p-4">
                <h3 className="text-sm font-medium text-gray-600">Avg Eco Score</h3>
                <p className="text-2xl font-bold text-[#FF9800]">{dashboardStats.average_eco_score}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-4">Car Type Distribution</h2>
              <Doughnut data={carTypeDistribution} />
            </div>
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-2">
                <p className="text-sm">📊 {dashboardStats?.total_bookings} total bookings</p>
                <p className="text-sm">🌱 {dashboardStats?.total_eco_savings} kg CO2 saved</p>
                <p className="text-sm">🏆 {dashboardStats?.total_credits_awarded} credits awarded</p>
                <p className="text-sm">📍 Most popular: {dashboardStats?.most_popular_location}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "cars" && (
        <div className="space-y-6">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-4">Add New Car</h2>
            <form onSubmit={handleSubmit(addCar)} className="grid md:grid-cols-2 gap-3">
              <input className="border rounded p-2" placeholder="Car Name" {...register("name", { required: true })} />
              <select className="border rounded p-2" {...register("type", { required: true })}>
                <option value="">Select Type</option>
                <option value="EV">EV</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Gas">Gas</option>
              </select>
              <input type="number" className="border rounded p-2" placeholder="Emission Rate (g/km)" {...register("emission_rate", { required: true, valueAsNumber: true })} />
              <input className="border rounded p-2" placeholder="Location" {...register("location", { required: true })} />
              <input type="number" step="0.000001" className="border rounded p-2" placeholder="Latitude" {...register("latitude", { valueAsNumber: true })} />
              <input type="number" step="0.000001" className="border rounded p-2" placeholder="Longitude" {...register("longitude", { valueAsNumber: true })} />
              <input className="border rounded p-2 md:col-span-2" placeholder="Image URL" {...register("image_url")} />
              <button type="submit" disabled={loading} className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded disabled:opacity-50">
                {loading ? "Adding..." : "Add Car"}
              </button>
            </form>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-semibold mb-4">Car Inventory</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-left p-2">Emission</th>
                    <th className="text-left p-2">Available</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id} className="border-b">
                      <td className="p-2">{car.name}</td>
                      <td className="p-2">{car.type}</td>
                      <td className="p-2">{car.location}</td>
                      <td className="p-2">{car.emission_rate} g/km</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {car.available ? 'Available' : 'Booked'}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => deleteCar(car.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
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

      {tab === "services" && (
        <div className="space-y-6">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-4">Schedule Service</h2>
            <form onSubmit={handleServiceSubmit(addService)} className="grid md:grid-cols-2 gap-3">
              <select className="border rounded p-2" {...registerService("car_id", { required: true })}>
                <option value="">Select Car</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>{car.name} - {car.location}</option>
                ))}
              </select>
              <input className="border rounded p-2" placeholder="Service Type" {...registerService("type", { required: true })} />
              <input type="datetime-local" className="border rounded p-2 md:col-span-2" {...registerService("scheduled_date", { required: true })} />
              <button type="submit" disabled={loading} className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded disabled:opacity-50">
                {loading ? "Scheduling..." : "Schedule Service"}
              </button>
            </form>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-semibold mb-4">Service Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Car ID</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Scheduled Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Discount</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b">
                      <td className="p-2">{service.car_id}</td>
                      <td className="p-2">{service.type}</td>
                      <td className="p-2">{new Date(service.scheduled_date).toLocaleString()}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          service.status === 'completed' ? 'bg-green-100 text-green-800' :
                          service.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="p-2">{service.discount_applied ? 'Yes' : 'No'}</td>
                      <td className="p-2">
                        <button
                          onClick={() => deleteService(service.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
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

      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-4">Booking Trends (30 days)</h2>
              <Line data={ecoTrendsChart} />
            </div>
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-4">Revenue Trends (12 months)</h2>
              <Bar data={revenueChart} />
            </div>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-semibold mb-4">Car Performance Analytics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Car Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Total Bookings</th>
                    <th className="text-left p-2">Revenue</th>
                    <th className="text-left p-2">Avg Distance</th>
                    <th className="text-left p-2">Utilization</th>
                    <th className="text-left p-2">Eco Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {carAnalytics.map((car) => (
                    <tr key={car.car_id} className="border-b">
                      <td className="p-2">{car.car_name}</td>
                      <td className="p-2">{car.car_type}</td>
                      <td className="p-2">{car.total_bookings}</td>
                      <td className="p-2">${car.total_revenue}</td>
                      <td className="p-2">{car.average_booking_distance} km</td>
                      <td className="p-2">{car.utilization_rate}%</td>
                      <td className="p-2">{car.total_eco_savings} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-6">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-4">User Leaderboard</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Eco Score</th>
                    <th className="text-left p-2">Tier</th>
                    <th className="text-left p-2">Credits</th>
                    <th className="text-left p-2">Bookings</th>
                    <th className="text-left p-2">Eco Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr key={user.user_id} className="border-b">
                      <td className="p-2">
                        {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'} {user.user_name}
                      </td>
                      <td className="p-2">{user.user_email}</td>
                      <td className="p-2">{user.eco_score}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.green_tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                          user.green_tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {user.green_tier}
                        </span>
                      </td>
                      <td className="p-2">{user.credits}</td>
                      <td className="p-2">{user.total_bookings}</td>
                      <td className="p-2">{user.total_eco_savings} kg</td>
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
