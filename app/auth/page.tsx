"use client"

import { useState } from "react"
import Link from "next/link"

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="w-full border-b">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#2E7D32]">EcoDrive Hub</span>
          </div>
          <button
            aria-label="Toggle Menu"
            className="md:hidden p-2 border rounded"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <ul className="hidden md:flex items-center gap-6">
            <li><Link href="/" className="hover:text-[#2E7D32]">Home</Link></li>
            <li><Link href="/rent" className="hover:text-[#2E7D32]">Rent</Link></li>
            <li><Link href="/service" className="hover:text-[#2E7D32]">Service</Link></li>
            <li><Link href="/dashboard" className="hover:text-[#2E7D32]">Dashboard</Link></li>
            <li><Link href="/profile" className="hover:text-[#2E7D32]">Profile</Link></li>
            <li><Link href="/admin" className="hover:text-[#2E7D32]">Admin</Link></li>
            <li><Link href="/auth" className="text-white bg-[#2E7D32] px-3 py-1 rounded">Login</Link></li>
          </ul>
        </nav>
        {menuOpen && (
          <ul className="md:hidden px-4 pb-3 flex flex-col gap-2 border-t">
            <li><Link href="/" className="py-2">Home</Link></li>
            <li><Link href="/rent" className="py-2">Rent</Link></li>
            <li><Link href="/service" className="py-2">Service</Link></li>
            <li><Link href="/dashboard" className="py-2">Dashboard</Link></li>
            <li><Link href="/profile" className="py-2">Profile</Link></li>
            <li><Link href="/admin" className="py-2">Admin</Link></li>
            <li><Link href="/auth" className="py-2 text-white bg-[#2E7D32] rounded text-center">Login</Link></li>
          </ul>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-2 items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#2E7D32]">Rent Green, Drive Clean</h1>
          <p className="mt-3 text-gray-700">
            AI-powered sustainable car rental and service management. Save CO2, earn credits, and track your eco journey.
          </p>
          <div className="mt-5 flex gap-3">
            <Link href="/rent" className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded">Find Cars</Link>
            <Link href="/dashboard" className="border border-[#4CAF50] text-[#2E7D32] px-4 py-2 rounded">View Dashboard</Link>
          </div>
        </div>
        <div className="rounded-lg bg-[#A5D6A7] p-4 text-[#2E7D32]">
          <p className="font-semibold">Featured:</p>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <li className="bg-white p-3 rounded shadow">Tesla Model 3 • EV</li>
            <li className="bg-white p-3 rounded shadow">Toyota Prius • Hybrid</li>
            <li className="bg-white p-3 rounded shadow">Nissan Leaf • EV</li>
            <li className="bg-white p-3 rounded shadow">Honda Civic • Gas</li>
          </ul>
        </div>
      </section>

      {/* Carousel (simple cards) */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-xl font-bold text-[#2E7D32] mb-3">Popular Choices</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="border rounded p-3 flex flex-col">
              <div className="h-24 bg-gray-100 rounded mb-2" />
              <div className="text-sm font-semibold">Eco Car #{i}</div>
              <div className="text-xs text-gray-600">Low emissions • Great range</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
          © {new Date().getFullYear()} EcoDrive Hub
        </div>
      </footer>
    </div>
  )
}
