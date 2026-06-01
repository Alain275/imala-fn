"use client"

import { cn } from "@/lib/utils"

interface Icon3DProps {
  children: React.ReactNode
  className?: string
  gradient?: "green" | "gold" | "sky" | "earth" | "leaf"
  size?: "sm" | "md" | "lg" | "xl"
}

const gradientColors = {
  green: "from-emerald-500 to-green-600", 
  gold: "from-amber-400 to-yellow-500",
  sky: "from-sky-400 to-blue-500",
  earth: "from-amber-700 to-orange-800",
  leaf: "from-lime-500 to-emerald-600",
}

const sizeClasses = {
  sm: "w-10 h-10 p-2",
  md: "w-14 h-14 p-3",
  lg: "w-18 h-18 p-4",
  xl: "w-24 h-24 p-5",
}

export function Icon3D({ 
  children, 
  className, 
  gradient = "green",
  size = "md" 
}: Icon3DProps) {
  return (
    <div 
      className={cn(
        "relative rounded-2xl bg-gradient-to-br shadow-lg",
        "transform transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-xl hover:-translate-y-1",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-white/20 before:opacity-0 before:transition-opacity hover:before:opacity-100",
        gradientColors[gradient],
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: `
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 -2px 0 0 rgba(255, 255, 255, 0.1) inset,
          0 2px 0 0 rgba(0, 0, 0, 0.1) inset
        `
      }}
    >
      <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
        {children}
      </div>
    </div>
  )
}

export function Icon3DFlat({ 
  children, 
  className, 
  gradient = "green",
  size = "md" 
}: Icon3DProps) {
  return (
    <div 
      className={cn(
        "relative rounded-xl bg-gradient-to-br",
        "transform transition-all duration-300 ease-out",
        "hover:scale-105",
        gradientColors[gradient],
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-center justify-center w-full h-full text-white drop-shadow-md">
        {children}
      </div>
    </div>
  )
}
