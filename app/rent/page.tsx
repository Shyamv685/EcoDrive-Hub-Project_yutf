"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

type CarCard = {
  car_id: string
  car_name: string
  car_type: string
  emission_rate: number
  location: string
  available: boolean
  image_url: string
  eco_rating: number
}

type SearchForm = {
  search_term?: string
  car_type_param?: "EV" | "Hybrid" | "Gas" | ""
  location_param?: string
  min_emission_rate?: number
  max_emission_rate?: number
  available_only?: boolean
}

export default function RentPage() {
  const supabase = createClient()
  const { register, handleSubmit } = useForm<SearchForm>({
    defaultValues: { available_only: true }
  })
  const [cars, setCars] = useState<CarCard[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCars = async (params?: Partial<SearchForm>) => {
    setLoading(true)
    const { data, error } = await supabase
      .rpc("search_cars", {
        search_term: params?.search_term ?? null,
        car_type_param: params?.car_type_param ? params.car_type_param : null,
        location_param: params?.location_param ?? null,
        min_emission_rate: params?.min_emission_rate ?? null,
        max_emission_rate: params?.max_emission_rate ?? null,
        available_only: params?.available_only ?? true,
        limit_count: 20,
        offset_count: 0,
      })

    setLoading(false)
    if (error) {
      toast.error("Failed to load cars")
      return
    }
    setCars((data ?? []) as CarCard[])
  }

  useEffect(() => {
    fetchCars()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = (values: SearchForm) => {
    fetchCars(values)
  }

  const bookCar = async (car: CarCard) => {
    // Placeholder booking action for step 1 UI only
    toast.success(`Requested booking for ${car.car_name}`)
  }

  return (
    <div className="min-h-screen mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-4">Rent a Car</h1>

      <form onSubmit={handleSubmit(onSearch)} className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-3 mb-6">
        <input className="border rounded p-2" placeholder="Search" {...register("search_term")} />
        <select className="border rounded p-2" {...register("car_type_param")}>
          <option value="">All Types</option>
          <option value="EV">EV</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Gas">Gas</option>
        </select>
        <input className="border rounded p-2" placeholder="Location" {...register("location_param")} />
        <input className="border rounded p-2" type="number" placeholder="Min Emission" {...register("min_emission_rate", { valueAsNumber: true })} />
        <input className="border rounded p-2" type="number" placeholder="Max Emission" {...register("max_emission_rate", { valueAsNumber: true })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("available_only")} />
          Available only
        </label>
        <button type="submit" className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-4 py-2 rounded md:col-span-3">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div key={car.car_id} className="border rounded p-3 flex flex-col">
            {car.image_url ? (
              <Image
                src={car.image_url}
                alt={car.car_name}
                width={400}
                height={240}
                className="w-full h-40 object-cover rounded mb-2"
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 rounded mb-2" />
            )}
            <div className="font-semibold">{car.car_name}</div>
            <div className="text-sm text-gray-600">{car.car_type} • {car.location}</div>
            <div className="text-xs text-gray-500">Emission: {car.emission_rate} g/km • Eco Rating: {car.eco_rating}</div>
            <button
              disabled={!car.available}
              onClick={() => bookCar(car)}
              className={`mt-3 px-3 py-2 rounded text-white ${car.available ? "bg-[#4CAF50] hover:bg-[#2E7D32]" : "bg-gray-400 cursor-not-allowed"}`}
            >
              {car.available ? "Book Now" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>

      <ToastContainer containerId="toast-root" />
    </div>
  )
}
