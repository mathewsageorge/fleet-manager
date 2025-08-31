import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!input) {
    return NextResponse.json({ error: 'Input parameter is required' }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&types=establishment|geocode&components=country:IN&location=9.9312,76.2673&radius=600000&strictbounds=true`
    )

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Places autocomplete API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch places data' },
      { status: 500 }
    )
  }
}
