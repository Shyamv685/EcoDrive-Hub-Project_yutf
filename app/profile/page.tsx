"use client"

import { useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'

export default function ProfilePage() {
  const [credits, setCredits] = useState(80)
  const [ecoScore] = useState(145)
  const [tier] = useState("Silver")

  const redeem = (amount: number) => {
    if (amount > credits) {
      toast.error("Not enough credits")
      return
    }
    setCredits(credits - amount)
    toast.success(`Redeemed ${amount} credits`)
  }

  return (
    <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-4">Profile</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">User Info</h2>
          <div className="text-sm space-y-2">
            <div>Name: Jane Doe</div>
            <div>Email: jane@example.com</div>
          </div>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Eco & Credits</h2>
          <div className="text-sm space-y-2">
            <div>Eco Score: <span className="font-semibold">{ecoScore}</span></div>
            <div>Tier: <span className="font-semibold">{tier}</span></div>
            <div>Credits: <span className="font-semibold">{credits}</span></div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => redeem(10)} className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-3 py-2 rounded">Redeem 10</button>
            <button onClick={() => redeem(20)} className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-3 py-2 rounded">Redeem 20</button>
          </div>
        </div>
      </div>
      <ToastContainer containerId="toast-root" />
    </div>
  )
}
