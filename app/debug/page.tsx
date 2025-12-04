"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

export default function DebugPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<any>({})
  const supabase = createClient()

  const testFunction = async (functionName: string, params: any = {}) => {
    try {
      console.log(`[Debug] Testing ${functionName} with params:`, params)
      const { data, error } = await supabase.rpc(functionName, params)
      console.log(`[Debug] ${functionName} result:`, { data, error })
      setResults(prev => ({ ...prev, [functionName]: { data, error } }))
    } catch (err) {
      console.error(`[Debug] ${functionName} error:`, err)
      setResults(prev => ({ ...prev, [functionName]: { error: err } }))
    }
  }

  const testTable = async (tableName: string) => {
    try {
      console.log(`[Debug] Testing table ${tableName}`)
      const { data, error } = await supabase.from(tableName).select("*").limit(5)
      console.log(`[Debug] ${tableName} result:`, { data, error })
      setResults(prev => ({ ...prev, [tableName]: { data, error } }))
    } catch (err) {
      console.error(`[Debug] ${tableName} error:`, err)
      setResults(prev => ({ ...prev, [tableName]: { error: err } }))
    }
  }

  useEffect(() => {
    if (user) {
      testFunction("is_admin", { user_id: user.id })
    }
  }, [user])

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="mb-4">
        <p><strong>User ID:</strong> {user?.id || "Not logged in"}</p>
        <p><strong>User Email:</strong> {user?.email || "Not logged in"}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <button 
          onClick={() => testFunction("get_dashboard_stats")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Dashboard Stats
        </button>
        <button 
          onClick={() => testFunction("get_car_analytics")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Car Analytics
        </button>
        <button 
          onClick={() => testFunction("get_leaderboard")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Leaderboard
        </button>
        <button 
          onClick={() => testFunction("get_eco_trends_formatted", { days_back: 30 })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Eco Trends
        </button>
        <button 
          onClick={() => testFunction("get_revenue_trends", { months_back: 12 })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Revenue Trends
        </button>
        <button 
          onClick={() => testFunction("get_user_growth_trends", { months_back: 12 })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test User Growth
        </button>
        <button 
          onClick={() => testTable("cars")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Cars Table
        </button>
        <button 
          onClick={() => testTable("services")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Services Table
        </button>
        <button 
          onClick={() => testTable("users")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Users Table
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Results:</h2>
        {Object.entries(results).map(([key, result]: [string, any]) => (
          <div key={key} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{key}</h3>
            {result.error ? (
              <div className="text-red-600">
                <p><strong>Error:</strong> {result.error.message || JSON.stringify(result.error)}</p>
              </div>
            ) : (
              <div>
                <p><strong>Data:</strong></p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
