"use client"

import { useEffect, useState } from "react"

export function DashboardHeader() {
  const [pharmacyName, setPharmacyName] = useState("MedCare Pharmacy")
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const user = localStorage.getItem("pms_user")
    if (user) {
      const userData = JSON.parse(user)
      setPharmacyName(userData.pharmacyName || "MedCare Pharmacy")
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to {pharmacyName}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{currentTime.toLocaleDateString()}</span>
        <span>•</span>
        <span>{currentTime.toLocaleTimeString()}</span>
      </div>
    </div>
  )
}
