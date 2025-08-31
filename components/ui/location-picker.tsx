'use client'

/**
 * LocationPicker Component with Google Maps Integration
 *
 * SETUP GOOGLE MAPS API:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create a new API key
 * 3. Enable these APIs:
 *    - Places API
 *    - Geocoding API
 * 4. Add to your .env.local file:
 *    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
 *
 * FEATURES:
 * - Google Places Autocomplete (if API key provided)
 * - OpenStreetMap fallback (free, no API key needed)
 * - Manual entry mode
 * - Current location detection
 * - Reverse geocoding
 */

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react'

interface LocationPickerProps {
  value?: {
    location: string
    latitude: string
    longitude: string
  }
  onChange: (location: {
    location: string
    latitude: string
    longitude: string
  }) => void
  placeholder?: string
  className?: string
}

interface GeolocationPosition {
  coords: {
    latitude: number
    longitude: number
    accuracy?: number
  }
}

interface LocationSuggestion {
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
  place_id?: string // For Google Places API
}

export function LocationPicker({ value, onChange, placeholder = "Search southern India cities, landmarks, or addresses...", className }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(value?.location || '')
  const [coordinates, setCoordinates] = useState({
    latitude: value?.latitude || '',
    longitude: value?.longitude || ''
  })
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [manualMode, setManualMode] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Popular Southern Indian cities for quick access (focused on Kerala operations)
  const POPULAR_SOUTH_INDIAN_CITIES = [
    { name: 'Kochi, Kerala', lat: 9.9312, lng: 76.2673 },
    { name: 'Trivandrum, Kerala', lat: 8.5241, lng: 76.9366 },
    { name: 'Kozhikode, Kerala', lat: 11.2588, lng: 75.7804 },
    { name: 'Thrissur, Kerala', lat: 10.5276, lng: 76.2144 },
    { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Bangalore, Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Coimbatore, Tamil Nadu', lat: 11.0168, lng: 76.9558 },
    { name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Mysore, Karnataka', lat: 12.2958, lng: 76.6394 },
    { name: 'Mangalore, Karnataka', lat: 12.9141, lng: 74.8560 }
  ]

  // Update search query when value changes
  useEffect(() => {
    if (value?.location) {
      setSearchQuery(value.location)
    }
    if (value?.latitude && value?.longitude) {
      setCoordinates({
        latitude: value.latitude,
        longitude: value.longitude
      })
    }
  }, [value])

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lon: number) => {
    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // Try Google Maps Geocoding API first if API key is available
    if (GOOGLE_API_KEY) {
      try {
        console.log('Trying Google reverse geocoding...')

        const response = await fetch(
          `/api/geocode?latlng=${lat},${lon}`
        )

        if (!response.ok) {
          throw new Error(`Google Geocoding API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          return data.results[0].formatted_address
        } else if (data.status !== 'OK') {
          console.warn('Google Geocoding API error:', data.status, data.error_message)
        }
      } catch (error) {
        console.error('Google reverse geocoding failed, falling back to OpenStreetMap:', error)
      }
    }

    // Fallback to OpenStreetMap Nominatim
    try {
      console.log('Using OpenStreetMap for reverse geocoding...')

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en`
      )

      if (!response.ok) {
        throw new Error(`OpenStreetMap reverse geocoding error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    } catch (error) {
      console.error('All reverse geocoding services failed:', error)
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    }
  }

  // Fetch suggestions with debouncing
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    let hasUsedGoogle = false

    try {
      // Try Google Places API first if API key is available
      const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (GOOGLE_API_KEY) {
        try {
          hasUsedGoogle = true
          console.log('Trying Google Places API via Next.js route...')

          // Southern India location bias (Kochi coordinates as center)
          const SOUTH_INDIA_BOUNDS = {
            northeast: { lat: 21.0, lng: 88.0 },   // Northeast boundary (covers up to Kolkata)
            southwest: { lat: 8.0, lng: 73.0 }     // Southwest boundary (covers down to Kanyakumari)
          }

          const response = await fetch(
            `/api/places/autocomplete?input=${encodeURIComponent(query)}`
          )

          if (!response.ok) {
            throw new Error(`Google API error: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()

          if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
            // Transform Google Places predictions to our format
            const transformedSuggestions = data.predictions.map((prediction: any) => ({
              display_name: prediction.description,
              lat: '', // We'll get coordinates when selected
              lon: '',
              type: prediction.types?.[0] || 'place',
              importance: 1,
              place_id: prediction.place_id
            }))

            setSuggestions(transformedSuggestions)
            setShowSuggestions(transformedSuggestions.length > 0)
            setSelectedIndex(-1)
            setIsSearching(false)
            return
          } else if (data.status !== 'OK') {
            console.warn('Google Places API error:', data.status, data.error_message)
          }
        } catch (googleError) {
          console.warn('Google Places API failed (CORS/API issue), falling back to OpenStreetMap:', googleError)
        }
      }

      // Fallback to OpenStreetMap (either no API key or Google failed)
      console.log(hasUsedGoogle ? 'Falling back to OpenStreetMap...' : 'Using OpenStreetMap (no Google API key)')

      // Southern India bounding box for OpenStreetMap (focused on Kerala, Tamil Nadu, Karnataka, etc.)
      const southIndiaBounds = 'bbox=73.0,8.0,88.0,21.0'
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&dedupe=1&accept-language=en&countrycodes=IN&${southIndiaBounds}&bounded=1`
      )

      if (!response.ok) {
        throw new Error(`OpenStreetMap API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
        setSelectedIndex(-1)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }

    } catch (error) {
      console.error('Failed to fetch suggestions from all sources:', error)
      setSuggestions([])
      setShowSuggestions(false)

      // Show user-friendly error message
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Network error: Check your internet connection or CORS settings')
      }
    } finally {
      setIsSearching(false)
    }
  }

  // Handle suggestion selection
  const selectSuggestion = async (suggestion: LocationSuggestion) => {
    // If this is a Google Places suggestion (has place_id), get coordinates
    if ((suggestion as any).place_id) {
      const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (GOOGLE_API_KEY) {
        try {
          console.log('Getting coordinates for place:', (suggestion as any).place_id)

          const response = await fetch(
            `/api/places/details?place_id=${(suggestion as any).place_id}`
          )

          if (!response.ok) {
            throw new Error(`Place Details API error: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()

          if (data.status === 'OK' && data.result?.geometry?.location) {
            const latitude = data.result.geometry.location.lat.toFixed(6)
            const longitude = data.result.geometry.location.lng.toFixed(6)

            setSearchQuery(suggestion.display_name)
            setCoordinates({ latitude, longitude })
            setShowSuggestions(false)
            setSelectedIndex(-1)

            onChange({
              location: suggestion.display_name,
              latitude,
              longitude
            })
            return
          } else {
            console.warn('Place Details API returned error:', data.status, data.error_message)
          }
        } catch (error) {
          console.error('Failed to get place details, falling back to OpenStreetMap:', error)
        }
      }
    }

    // Fallback for OpenStreetMap suggestions or Google fallback
    if (suggestion.lat && suggestion.lon) {
      try {
        const latitude = parseFloat(suggestion.lat).toFixed(6)
        const longitude = parseFloat(suggestion.lon).toFixed(6)

        setSearchQuery(suggestion.display_name)
        setCoordinates({ latitude, longitude })
        setShowSuggestions(false)
        setSelectedIndex(-1)

        onChange({
          location: suggestion.display_name,
          latitude,
          longitude
        })
      } catch (error) {
        console.error('Failed to parse coordinates:', error)
        // Fallback: just use the text without coordinates
        setSearchQuery(suggestion.display_name)
        setShowSuggestions(false)
        setSelectedIndex(-1)

        onChange({
          location: suggestion.display_name,
          latitude: '',
          longitude: ''
        })
      }
    } else {
      // No coordinates available, just use the text
      setSearchQuery(suggestion.display_name)
      setShowSuggestions(false)
      setSelectedIndex(-1)

      onChange({
        location: suggestion.display_name,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })
    }
  }

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords
        const latStr = latitude.toFixed(6)
        const lonStr = longitude.toFixed(6)

        setCoordinates({ latitude: latStr, longitude: lonStr })

        // Get address from coordinates
        const address = await reverseGeocode(latitude, longitude)
        setSearchQuery(address)

        // Update parent component
        onChange({
          location: address,
          latitude: latStr,
          longitude: lonStr
        })

        setShowSuggestions(false)
        setSuggestions([])
        setIsLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setIsLoading(false)

        let errorMessage = 'Unable to get your location.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        alert(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Search for location (forward geocoding)
  const searchLocation = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

      // Try Google Maps Geocoding API first if API key is available
      if (GOOGLE_API_KEY) {
        const response = await fetch(
          `/api/geocode?address=${encodeURIComponent(query)}`
        )
        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          const latitude = result.geometry.location.lat.toFixed(6)
          const longitude = result.geometry.location.lng.toFixed(6)

          setCoordinates({ latitude, longitude })
          setSearchQuery(result.formatted_address)

          onChange({
            location: result.formatted_address,
            latitude,
            longitude
          })

          setShowSuggestions(false)
          setSuggestions([])
          setIsLoading(false)
          return
        }
      }

      // Fallback to OpenStreetMap Nominatim
      console.log('Using OpenStreetMap as fallback')
      const southIndiaBounds = 'bbox=73.0,8.0,88.0,21.0'
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en&countrycodes=IN&${southIndiaBounds}&bounded=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const latitude = parseFloat(result.lat).toFixed(6)
        const longitude = parseFloat(result.lon).toFixed(6)

        setCoordinates({ latitude, longitude })
        setSearchQuery(result.display_name)

        onChange({
          location: result.display_name,
          latitude,
          longitude
        })

        setShowSuggestions(false)
        setSuggestions([])
      } else {
        alert('Location not found. Please try a different search term.')
      }
    } catch (error) {
      console.error('Location search failed:', error)
      alert('Failed to search location. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search input with keyboard navigation
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (!showSuggestions || manualMode) {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (!manualMode) {
          searchLocation(searchQuery)
        }
        // In manual mode, just allow normal text entry
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex])
        } else {
          searchLocation(searchQuery)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle manual coordinate changes
  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    const newCoordinates = { ...coordinates, [field]: value }
    setCoordinates(newCoordinates)

    // If both coordinates are provided, try to get address
    if (newCoordinates.latitude && newCoordinates.longitude) {
      const lat = parseFloat(newCoordinates.latitude)
      const lon = parseFloat(newCoordinates.longitude)

      if (!isNaN(lat) && !isNaN(lon)) {
        reverseGeocode(lat, lon).then(address => {
          setSearchQuery(address)
          onChange({
            location: address,
            latitude: newCoordinates.latitude,
            longitude: newCoordinates.longitude
          })
        })
      } else {
        onChange({
          location: searchQuery,
          latitude: newCoordinates.latitude,
          longitude: newCoordinates.longitude
        })
      }
    }
  }

  // Handle location text change with debounced suggestions (only if not in manual mode)
  const handleLocationChange = (location: string) => {
    setSearchQuery(location)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Only fetch suggestions if not in manual mode
    if (!manualMode && location.length >= 2) {
      // Debounce suggestions fetch
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(location)
      }, 300)
    } else {
      // In manual mode, hide suggestions
      setShowSuggestions(false)
      setSuggestions([])
    }

    onChange({
      location,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    })
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search input with buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => handleLocationChange(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            onFocus={() => {
              if (!manualMode && !isOffline) {
                if (suggestions.length > 0) {
                  setShowSuggestions(true)
                } else if (searchQuery.length === 0) {
                  // Show popular southern cities when input is empty and focused
                  const popularSuggestions = POPULAR_SOUTH_INDIAN_CITIES.map(city => ({
                    display_name: city.name,
                    lat: city.lat.toString(),
                    lon: city.lng.toString(),
                    type: 'city',
                    importance: 1
                  }))
                  setSuggestions(popularSuggestions)
                  setShowSuggestions(true)
                  setSelectedIndex(-1)
                }
              }
            }}
            placeholder={manualMode ? "Enter location manually (e.g., 'Infopark, Kochi')" : "Search southern India cities, landmarks, or addresses..."}
            className="pl-9"
          />

          {/* Suggestions Dropdown - Mobile optimized */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-y-auto"
            >
              {/* Popular cities header */}
              {searchQuery.length === 0 && suggestions.some(s => s.type === 'city') && (
                <div className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  🇮🇳 Popular Southern Indian Cities
                </div>
              )}
              {suggestions.map((suggestion, index) => {
                // Create a unique key using multiple fields to avoid duplicates
                const uniqueKey = (suggestion as any).place_id ||
                  `${suggestion.display_name}-${suggestion.lat || 'no-lat'}-${suggestion.lon || 'no-lon'}-${index}`

                return (
                  <div
                    key={uniqueKey}
                    className={`px-3 py-3 sm:py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                      index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => selectSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {suggestion.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.display_name}
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}

          {/* Loading indicator for suggestions */}
          {isSearching && searchQuery.length >= 2 && !manualMode && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching locations...
              </div>
            </div>
          )}
        </div>
        {/* Mobile-friendly button layout */}
        <div className="flex gap-1 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => searchLocation(searchQuery)}
            disabled={isLoading || !searchQuery.trim() || manualMode || isOffline}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline ml-1">Search</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoading}
            size="sm"
            title="Get current location"
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline ml-1">Current</span>
          </Button>
          <Button
            type="button"
            variant={manualMode ? "default" : "outline"}
            onClick={() => {
              setManualMode(!manualMode)
              if (!manualMode) {
                // Switching to manual mode - hide suggestions
                setShowSuggestions(false)
                setSuggestions([])
              }
            }}
            size="sm"
            title={manualMode ? "Switch to auto-complete mode" : "Switch to manual entry mode"}
            className="flex-1 sm:flex-none"
          >
            {manualMode ? "✏️" : "🔍"}
            <span className="hidden sm:inline ml-1">{manualMode ? "Manual" : "Auto"}</span>
          </Button>
        </div>
      </div>

      {/* Coordinate inputs - Mobile optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Input
            type="number"
            step="any"
            value={coordinates.latitude}
            onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
            placeholder="Latitude"
            className="text-sm"
          />
        </div>
        <div>
          <Input
            type="number"
            step="any"
            value={coordinates.longitude}
            onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
            placeholder="Longitude"
            className="text-sm"
          />
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        {isOffline && (
          <>⚠️ Offline mode: Location suggestions unavailable. Use manual entry.</>
        )}
        {manualMode ? (
          <>✏️ Manual mode: Type any location description. Use "🔍 Auto" to enable suggestions.</>
        ) : isOffline ? (
          <>🔍 Auto mode disabled (offline). Switch to manual mode for typing.</>
        ) : (
          <>🔍 Auto mode: Type to see location suggestions. Use "✏️ Manual" for free-form entry.</>
        )}
        <br />
        {!isOffline && (
          <>
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <>🌐 Using Google Maps for enhanced location search.</>
            ) : (
              <>🗺️ Using OpenStreetMap for southern India-focused search (add Google Maps API key for better results).</>
            )}
            <br />
          </>
        )}
        Use the search button to find a location, or click the navigation button to use your current location.
        Coordinates will be automatically filled when a location is selected.
      </p>
    </div>
  )
}
