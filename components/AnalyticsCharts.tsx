"use client"

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

interface AnalyticsChartsProps {
  ecoTrends: Array<{
    date_bucket: string
    ev_bookings: number
    hybrid_bookings: number
    gas_bookings: number
    total_eco_savings: number
  }>
  carAnalytics: Array<{
    car_name: string
    utilization_rate: number
    total_revenue: number
    total_bookings: number
  }>
  locationAnalytics: Array<{
    location: string
    total_bookings: number
    total_cars: number
    available_cars: number
  }>
  carTypes: {
    EV: number
    Hybrid: number
    Gas: number
  }
}

export default function AnalyticsCharts({
  ecoTrends,
  carAnalytics,
  locationAnalytics,
  carTypes
}: AnalyticsChartsProps) {
  // Eco Trends Chart
  const ecoTrendsChartData = {
    labels: ecoTrends.map(trend => format(new Date(trend.date_bucket), "MMM dd")),
    datasets: [
      {
        label: "EV Bookings",
        data: ecoTrends.map(trend => trend.ev_bookings),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.4
      },
      {
        label: "Hybrid Bookings",
        data: ecoTrends.map(trend => trend.hybrid_bookings),
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.4
      },
      {
        label: "Gas Bookings",
        data: ecoTrends.map(trend => trend.gas_bookings),
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.1)",
        tension: 0.4
      }
    ]
  }

  // Eco Savings Trend
  const ecoSavingsChartData = {
    labels: ecoTrends.map(trend => format(new Date(trend.date_bucket), "MMM dd")),
    datasets: [
      {
        label: "Eco Savings (kg CO2)",
        data: ecoTrends.map(trend => trend.total_eco_savings),
        borderColor: "#2E7D32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        tension: 0.4,
        fill: true
      }
    ]
  }

  // Car Type Distribution
  const carTypeChartData = {
    labels: ["EV", "Hybrid", "Gas"],
    datasets: [{
      label: "Cars by Type",
      data: [carTypes.EV, carTypes.Hybrid, carTypes.Gas],
      backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"],
      borderWidth: 2,
      borderColor: "#fff"
    }]
  }

  // Location Performance
  const locationChartData = {
    labels: locationAnalytics.map(loc => loc.location),
    datasets: [
      {
        label: "Total Bookings",
        data: locationAnalytics.map(loc => loc.total_bookings),
        backgroundColor: "#2E7D32"
      },
      {
        label: "Available Cars",
        data: locationAnalytics.map(loc => loc.available_cars),
        backgroundColor: "#4CAF50"
      }
    ]
  }

  // Car Utilization
  const utilizationChartData = {
    labels: carAnalytics.slice(0, 10).map(car => car.car_name.length > 15 ? car.car_name.substring(0, 15) + "..." : car.car_name),
    datasets: [{
      label: "Utilization Rate (%)",
      data: carAnalytics.slice(0, 10).map(car => car.utilization_rate),
      backgroundColor: carAnalytics.slice(0, 10).map(car => 
        car.utilization_rate > 70 ? "#4CAF50" : 
        car.utilization_rate > 40 ? "#FF9800" : "#F44336"
      )
    }]
  }

  // Revenue by Car
  const revenueChartData = {
    labels: carAnalytics.slice(0, 8).map(car => car.car_name.length > 15 ? car.car_name.substring(0, 15) + "..." : car.car_name),
    datasets: [{
      label: "Revenue ($)",
      data: carAnalytics.slice(0, 8).map(car => car.total_revenue),
      backgroundColor: "#2196F3"
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Eco Trends */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Booking Trends by Car Type</h3>
        <div className="h-80">
          <Line data={ecoTrendsChartData} options={chartOptions} />
        </div>
      </div>

      {/* Eco Savings */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Environmental Impact</h3>
        <div className="h-80">
          <Line data={ecoSavingsChartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Car Type Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Fleet Composition</h3>
          <div className="h-64">
            <Doughnut data={carTypeChartData} options={chartOptions} />
          </div>
        </div>

        {/* Location Performance */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Location Performance</h3>
          <div className="h-64">
            <Bar data={locationChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Car Utilization */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Car Utilization Rates</h3>
        <div className="h-80">
          <Bar data={utilizationChartData} options={chartOptions} />
        </div>
      </div>

      {/* Revenue Analysis */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Top Performing Cars by Revenue</h3>
        <div className="h-80">
          <Bar data={revenueChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
