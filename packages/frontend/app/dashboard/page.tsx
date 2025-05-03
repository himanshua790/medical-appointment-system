"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Layout from "@/components/layout"

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!loading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [loading, isAuthenticated, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    )
  }

  // Protected content (only shown when authenticated)
  return (
    <Layout title="Dashboard">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user?.username}!</h2>
          <p className="text-gray-600">
            This is your personal dashboard where you can manage appointments and medical records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Upcoming Appointments</h3>
            <p className="text-gray-500">No upcoming appointments.</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Recent Medical Records</h3>
            <p className="text-gray-500">No recent records.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
} 