"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import { createClient } from "@/lib/supabase/client"
import 'react-toastify/dist/ReactToastify.css'

type ServiceFormData = {
  car_id: string
  type: string
  scheduled_date: string
  status: "scheduled" | "completed" | "cancelled"
  discount_applied: boolean
}

interface ServiceFormProps {
  service?: any
  onSave: () => void
  onCancel: () => void
}

const serviceTypes = [
  "Battery Check",
  "Hybrid System Service", 
  "Oil Change & Maintenance",
  "General Inspection",
  "Tire Rotation",
  "Brake Service",
  "Software Update",
  "Charging System Service"
]

export default function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<ServiceFormData>({
    defaultValues: service || {
      car_id: "",
      type: "General Inspection",
      scheduled_date: "",
      status: "scheduled",
      discount_applied: false
    }
  })

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      if (service) {
        // Update existing service
        const { error } = await supabase
          .from("services")
          .update(data)
          .eq("id", service.id)
        
        if (error) {
          toast.error("Failed to update service")
          return
        }
        
        toast.success("Service updated successfully!")
      } else {
        // Create new service
        const { error } = await supabase
          .from("services")
          .insert(data)
        
        if (error) {
          toast.error("Failed to create service")
          return
        }
        
        toast.success("Service scheduled successfully!")
      }
      
      onSave()
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {service ? "Edit Service" : "Schedule New Service"}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Car ID</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              {...register("car_id", { required: true })}
              placeholder="Enter car ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Service Type</label>
            <select
              className="w-full border rounded p-2"
              {...register("type", { required: true })}
            >
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              className="w-full border rounded p-2"
              {...register("scheduled_date", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded p-2"
              {...register("status", { required: true })}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="border rounded"
                {...register("discount_applied")}
              />
              <span className="text-sm font-medium">Apply discount</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : (service ? "Update Service" : "Schedule Service")}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      <ToastContainer containerId="toast-root" />
    </div>
  )
}
