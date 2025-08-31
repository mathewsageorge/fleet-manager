import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const latlng = searchParams.get('latlng')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 })
  }

  try {
    let apiUrl: string

    if (address) {
      // Forward geocoding (address to coordinates)
      apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=en&components=country:IN`
    } else if (latlng) {
      // Reverse geocoding (coordinates to address)
      apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${apiKey}&language=en&result_type=establishment|geocode&location_type=ROOFTOP|RANGE_INTERPOLATED&components=country:IN`
    } else {
      return NextResponse.json({ error: 'Either address or latlng parameter is required' }, { status: 400 })
    }

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geocoding data' },
      { status: 500 }
    )
  }
}
