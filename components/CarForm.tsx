"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import { createClient } from "@/lib/supabase/client"
import 'react-toastify/dist/ReactToastify.css'

type CarFormData = {
  name: string
  type: "EV" | "Hybrid" | "Gas"
  emission_rate: number
  location: string
  available: boolean
  image_url?: string
  latitude?: number
  longitude?: number
}

interface CarFormProps {
  car?: any
  onSave: () => void
  onCancel: () => void
}

const locationCoordinates: { [key: string]: [number, number] } = {
  "San Francisco": [37.7749, -122.4194],
  "Los Angeles": [34.0522, -118.2437],
  "New York": [40.7128, -74.0060],
  "Chicago": [41.8781, -87.6298],
  "Seattle": [47.6062, -122.3321]
}

export default function CarForm({ car, onSave, onCancel }: CarFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm<CarFormData>({
    defaultValues: car || {
      name: "",
      type: "EV",
      emission_rate: 0,
      location: "San Francisco",
      available: true,
      image_url: ""
    }
  })

  const watchedLocation = watch("location")

  useEffect(() => {
    if (watchedLocation && locationCoordinates[watchedLocation]) {
      const [lat, lng] = locationCoordinates[watchedLocation]
      setValue("latitude", lat)
      setValue("longitude", lng)
    }
  }, [watchedLocation, setValue])

  const onSubmit = async (data: CarFormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      if (car) {
        // Update existing car
        const { error } = await supabase
          .from("cars")
          .update(data)
          .eq("id", car.id)
        
        if (error) {
          toast.error("Failed to update car")
          return
        }
        
        toast.success("Car updated successfully!")
      } else {
        // Create new car
        const { error } = await supabase
          .from("cars")
          .insert(data)
        
        if (error) {
          toast.error("Failed to create car")
          return
        }
        
        toast.success("Car created successfully!")
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
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {car ? "Edit Car" : "Add New Car"}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Car Name</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              {...register("name", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="w-full border rounded p-2"
              {...register("type", { required: true })}
            >
              <option value="EV">EV</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Gas">Gas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Emission Rate (g CO2/km)</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              {...register("emission_rate", { required: true, valueAsNumber: true })}
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <select
              className="w-full border rounded p-2"
              {...register("location", { required: true })}
            >
              {Object.keys(locationCoordinates).map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              className="w-full border rounded p-2"
              {...register("image_url")}
              placeholder="https://example.com/car-image.jpg"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="border rounded"
                {...register("available")}
              />
              <span className="text-sm font-medium">Available for rental</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : (car ? "Update Car" : "Add Car")}
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
