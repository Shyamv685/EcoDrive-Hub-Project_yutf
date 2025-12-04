"use client"

import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'

type ServiceForm = {
  car_id: string
  type: string
  scheduled_date: string
}

export default function ServicePage() {
  const { register, handleSubmit, reset } = useForm<ServiceForm>()
  const onSubmit = (data: ServiceForm) => {
    // UI-only for step 1
    toast.success("Service scheduled!")
    reset()
  }

  return (
    <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-4">Service Scheduler</h1>
      <div className="max-w-lg border rounded p-4">
        <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
          <input className="border rounded p-2" placeholder="Car ID" {...register("car_id", { required: true })} />
          <select className="border rounded p-2" {...register("type", { required: true })}>
            <option value="">Select Type</option>
            <option value="Battery Check">Battery Check</option>
            <option value="Hybrid System Service">Hybrid System Service</option>
            <option value="Oil Change & Maintenance">Oil Change & Maintenance</option>
          </select>
          <input type="date" className="border rounded p-2" {...register("scheduled_date", { required: true })} />
          <button type="submit" className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded">
            Schedule
          </button>
        </form>
      </div>
      <ToastContainer containerId="toast-root" />
    </div>
  )
}
