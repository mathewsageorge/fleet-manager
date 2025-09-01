'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useActiveCars } from '@/lib/queries/incidents'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Car {
  id: number
  make: string
  model: string
  licensePlate: string
  status: string
}

interface SearchableVehicleSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SearchableVehicleSelect({
  value,
  onChange,
  placeholder = "Search vehicles by license plate or name...",
  className,
  disabled = false
}: SearchableVehicleSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch active cars with search
  const { data: cars = [], isLoading } = useActiveCars(searchTerm || undefined)

  // Update selected car when value changes
  useEffect(() => {
    if (value && cars.length > 0) {
      const car = cars.find(c => c.id.toString() === value)
      setSelectedCar(car || null)
    } else {
      setSelectedCar(null)
    }
  }, [value, cars])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (car: Car) => {
    setSelectedCar(car)
    onChange(car.id.toString())
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    setSelectedCar(null)
    onChange('')
    setSearchTerm('')
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const displayValue = selectedCar
    ? `${selectedCar.make} ${selectedCar.model} (${selectedCar.licensePlate})`
    : ''

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={selectedCar ? displayValue : placeholder}
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={handleInputFocus}
          disabled={disabled}
          className={cn(
            "pr-20",
            selectedCar && !isOpen && "text-gray-900"
          )}
        />

        {/* Clear button */}
        {selectedCar && !isOpen && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-8 top-0 h-full px-2 py-0 hover:bg-transparent"
            onClick={handleClear}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Dropdown toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2 py-0 hover:bg-transparent"
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen)
              if (!isOpen) {
                inputRef.current?.focus()
              }
            }
          }}
          disabled={disabled}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                Searching...
              </div>
            </div>
          ) : cars.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? 'No vehicles found' : 'No active vehicles available'}
            </div>
          ) : (
            <>
              {/* Search hint */}
              <div className="px-3 py-2 text-xs text-gray-400 border-b bg-gray-50">
                <Search className="inline h-3 w-3 mr-1" />
                Search by license plate or vehicle name
              </div>

              {/* Vehicle list */}
              {cars.map((car) => (
                <button
                  key={car.id}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                    selectedCar?.id === car.id && "bg-blue-50"
                  )}
                  onClick={() => handleSelect(car)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {car.make} {car.model}
                      </div>
                      <div className="text-xs text-gray-500">
                        License: {car.licensePlate}
                      </div>
                    </div>
                    {selectedCar?.id === car.id && (
                      <Check className="h-4 w-4 text-blue-600 ml-2" />
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
