"use client"

import * as React from "react"
import { Check } from "lucide-react"

interface CheckboxProps {
  id?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({ id, checked, onCheckedChange, className = "" }: CheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${
        checked 
          ? "bg-red-500 border-red-500 text-white" 
          : "border-white/20 bg-transparent text-transparent hover:bg-white/5"
      } ${className}`}
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </button>
  )
}
