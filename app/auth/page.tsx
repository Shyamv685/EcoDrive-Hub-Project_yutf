"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2E7D32]">🌱 EcoDrive Hub</h1>
          <div className="flex gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-[#2E7D32] hover:text-[#1B5E20]">
                  Dashboard
                </Link>
                <Link href="/rent" className="text-[#2E7D32] hover:text-[#1B5E20]">
                  Rent Cars
                </Link>
                <Link href="/service" className="text-[#2E7D32] hover:text-[#1B5E20]">
                  Services
                </Link>
                <Link href="/admin" className="text-[#2E7D32] hover:text-[#1B5E20]">
                  Admin
                </Link>
              </>
            ) : (
              <Link href="/auth" className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Drive Green, Save the Planet
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join EcoDrive Hub and make a difference with every trip. Choose from our fleet of 
            electric, hybrid, and eco-friendly vehicles while earning credits and reducing your carbon footprint.
          </p>
          
          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Link 
                  href="/rent" 
                  className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white font-bold py-3 px-8 rounded-lg text-lg"
                >
                  Rent a Car
                </Link>
                <Link 
                  href="/dashboard" 
                  className="border-2 border-[#4CAF50] text-[#2E7D32] hover:bg-[#4CAF50] hover:text-white font-bold py-3 px-8 rounded-lg text-lg"
                >
                  View Dashboard
                </Link>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white font-bold py-3 px-8 rounded-lg text-lg"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2">Eco-Friendly Fleet</h3>
            <p className="text-gray-600">
              Choose from electric vehicles, hybrids, and fuel-efficient cars to minimize your environmental impact.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
            <p className="text-gray-600">
              Get credits for eco-friendly choices, climb the leaderboard, and unlock exclusive benefits.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Track Your Impact</h3>
            <p className="text-gray-600">
              Monitor your CO2 savings, eco score, and contribution to a greener planet through detailed analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
