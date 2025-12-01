import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './RecommendationsPage.css'

// Curated recommendations for popular destinations
const POPULAR_RECOMMENDATIONS = {
  'France': {
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Mont Saint-Michel', 'Palace of Versailles'],
    activities: ['Wine tasting in Bordeaux', 'Skiing in the Alps', 'Exploring Provence', 'Cruise on the Seine', 'Visit French Riviera'],
    cuisine: ['Croissants & Pastries', 'French Wine', 'Cheese Tasting', 'Fine Dining', 'Street Food Markets']
  },
  'Japan': {
    attractions: ['Mount Fuji', 'Tokyo Skytree', 'Fushimi Inari Shrine', 'Hiroshima Peace Memorial', 'Osaka Castle'],
    activities: ['Cherry Blossom Viewing', 'Onsen Hot Springs', 'Temple Visits', 'Anime & Manga Culture', 'Traditional Tea Ceremony'],
    cuisine: ['Sushi & Sashimi', 'Ramen', 'Tempura', 'Wagyu Beef', 'Matcha & Green Tea']
  },
  'Italy': {
    attractions: ['Colosseum', 'Leaning Tower of Pisa', 'Venice Canals', 'Vatican City', 'Amalfi Coast'],
    activities: ['Gondola Rides', 'Wine Tours in Tuscany', 'Art Museum Visits', 'Cooking Classes', 'Coastal Hiking'],
    cuisine: ['Pizza & Pasta', 'Gelato', 'Italian Wine', 'Espresso', 'Regional Specialties']
  },
  'United States': {
    attractions: ['Statue of Liberty', 'Grand Canyon', 'Golden Gate Bridge', 'Times Square', 'Yellowstone National Park'],
    activities: ['National Park Hiking', 'City Tours', 'Beach Activities', 'Museum Visits', 'Road Trips'],
    cuisine: ['BBQ', 'Burgers & Fries', 'Regional Cuisines', 'Food Trucks', 'Farm-to-Table Dining']
  },
  'United Kingdom': {
    attractions: ['Big Ben', 'Stonehenge', 'Tower of London', 'Edinburgh Castle', 'Lake District'],
    activities: ['Pub Crawls', 'Museum Tours', 'Countryside Walks', 'Theater Shows', 'Historical Tours'],
    cuisine: ['Fish & Chips', 'Afternoon Tea', 'Sunday Roast', 'Scottish Whisky', 'Traditional Pubs']
  },
  'Spain': {
    attractions: ['Sagrada Familia', 'Alhambra', 'Park Güell', 'Prado Museum', 'Ibiza Beaches'],
    activities: ['Flamenco Shows', 'Beach Activities', 'Tapas Tours', 'Architecture Tours', 'Festival Visits'],
    cuisine: ['Tapas', 'Paella', 'Sangria', 'Jamón Ibérico', 'Churros']
  },
  'Australia': {
    attractions: ['Sydney Opera House', 'Great Barrier Reef', 'Uluru', 'Great Ocean Road', 'Bondi Beach'],
    activities: ['Snorkeling & Diving', 'Wildlife Watching', 'Beach Activities', 'Outback Adventures', 'Wine Tasting'],
    cuisine: ['BBQ & Grilled Meats', 'Seafood', 'Australian Wine', 'Vegemite', 'Modern Australian Cuisine']
  },
  'Brazil': {
    attractions: ['Christ the Redeemer', 'Iguazu Falls', 'Amazon Rainforest', 'Copacabana Beach', 'Salvador Historic Center'],
    activities: ['Carnival Experience', 'Jungle Tours', 'Beach Activities', 'Samba Shows', 'Wildlife Watching'],
    cuisine: ['Feijoada', 'Churrasco', 'Caipirinha', 'Açaí', 'Brazilian Coffee']
  }
}

function RecommendationsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [countryData, setCountryData] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTripPlannerMode, setIsTripPlannerMode] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [itinerary, setItinerary] = useState(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [cityImages, setCityImages] = useState([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  useEffect(() => {
    // Get country data from navigation state or fetch it
    const state = location.state
    
    if (state) {
      // We have the country data from search
      fetchFullCountryData(state.countryName, state)
    } else {
      // If no state, redirect back to search
      navigate('/')
    }
  }, [location, navigate])

  const fetchFullCountryData = async (countryName, existingData) => {
    setIsLoading(true)
    
    // Check if this is a city or country
    const isCity = existingData.type === 'city'
    const cityName = existingData.cityName
    
    try {
      // If it's a city, we need to get country data from the country code
      if (isCity && existingData.code) {
        try {
          const countryResponse = await fetch(
            `https://restcountries.com/v3.1/alpha/${existingData.code}`
          )
          
          if (countryResponse.ok) {
            const countryData = await countryResponse.json()
            const country = countryData[0] || countryData
            
            const fullData = {
              name: countryName, // Use country name
              cityName: cityName, // Store city name separately
              capital: country.capital?.[0] || 'N/A',
              flag: existingData.flag || country.flags?.svg || country.flags?.png,
              population: existingData.population || country.population,
              region: country.region || 'Unknown',
              subregion: country.subregion || 'Unknown',
              languages: country.languages ? Object.values(country.languages).join(', ') : 'N/A',
              currencies: country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : 'N/A',
              timezones: country.timezones?.[0] || 'N/A',
              area: country.area,
              borders: country.borders || [],
              latlng: existingData.latlng || country.latlng || null,
              isCity: true
            }
            
            setCountryData(fullData)
            // Generate city-specific recommendations
            setRecommendations(generateCityRecommendations(cityName, fullData))
            fetchCityImages(cityName)
            return
          }
        } catch (err) {
          console.log('Error fetching country for city:', err)
        }
      }
      
      // For countries, use the existing logic
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`
      )
      
      if (response.ok) {
        const data = await response.json()
        const country = data[0]
        
        const fullData = {
          name: country.name.common,
          capital: country.capital?.[0] || 'N/A',
          flag: country.flags?.svg || country.flags?.png,
          population: country.population,
          region: country.region,
          subregion: country.subregion,
          languages: country.languages ? Object.values(country.languages).join(', ') : 'N/A',
          currencies: country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : 'N/A',
          timezones: country.timezones?.[0] || 'N/A',
          area: country.area,
          borders: country.borders || [],
          latlng: existingData.latlng || country.latlng || null,
          isCity: false
        }
        
        setCountryData(fullData)
        
        // Get recommendations (curated or generate based on region)
        const curated = POPULAR_RECOMMENDATIONS[countryName]
        if (curated) {
          setRecommendations(curated)
        } else {
          // Generate recommendations based on region and country data
          setRecommendations(generateRecommendations(fullData))
        }
        
        // Fetch city images
        const locationName = fullData.cityName || fullData.name
        fetchCityImages(locationName)
      } else {
        // Fallback to existing data if API fails
        setCountryData({
          name: existingData.countryName,
          cityName: existingData.cityName,
          capital: existingData.capital,
          flag: existingData.flag,
          region: 'Unknown',
          subregion: 'Unknown',
          latlng: existingData.latlng,
          isCity: existingData.type === 'city'
        })
        if (existingData.type === 'city' && existingData.cityName) {
          setRecommendations(generateCityRecommendations(existingData.cityName, { region: 'Unknown' }))
          fetchCityImages(existingData.cityName)
        } else {
          setRecommendations(generateRecommendations({ region: 'Unknown' }))
          fetchCityImages(existingData.countryName)
        }
      }
    } catch (error) {
      console.error('Error fetching country data:', error)
      // Use existing data as fallback
      if (existingData) {
        setCountryData({
          name: existingData.countryName,
          cityName: existingData.cityName,
          capital: existingData.capital,
          flag: existingData.flag,
          region: 'Unknown',
          latlng: existingData.latlng,
          isCity: existingData.type === 'city'
        })
        if (existingData.type === 'city' && existingData.cityName) {
          setRecommendations(generateCityRecommendations(existingData.cityName, { region: 'Unknown' }))
          fetchCityImages(existingData.cityName)
        } else {
          setRecommendations(generateRecommendations({ region: 'Unknown' }))
          fetchCityImages(existingData.countryName)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch city images from Unsplash API
  const fetchCityImages = async (locationName) => {
    if (!locationName) return
    
    setIsLoadingImages(true)
    try {
      // Using Unsplash Source API (no API key required for basic usage)
      // Alternative: Use Unsplash API with free API key from https://unsplash.com/developers
      const searchQuery = encodeURIComponent(`${locationName} city travel`)
      
      // Method 1: Try Unsplash Source API (no key needed, but limited)
      // Method 2: Use a proxy or direct Unsplash search
      // For demo, we'll use Unsplash Source which provides random images
      // In production, get a free API key from Unsplash
      
      // Using Unsplash Source API - provides random images based on search
      const imageUrls = []
      const imageCount = 6 // Number of images for collage
      
      // Generate image URLs using Unsplash Source
      // Format: https://source.unsplash.com/featured/?{query}
      for (let i = 0; i < imageCount; i++) {
        // Use different sizes and queries for variety
        const width = i % 2 === 0 ? 800 : 600
        const height = i % 2 === 0 ? 600 : 800
        const query = i === 0 ? locationName : `${locationName} ${['landmark', 'architecture', 'street', 'beach', 'culture'][i % 5]}`
        imageUrls.push({
          url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`,
          alt: `${locationName} - Image ${i + 1}`,
          id: i
        })
      }
      
      setCityImages(imageUrls)
      
      // Alternative: If you have an Unsplash API key, uncomment below:
      /*
      const apiKey = 'YOUR_UNSPLASH_ACCESS_KEY' // Get free key from https://unsplash.com/developers
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=6&client_id=${apiKey}`
      )
      
      if (response.ok) {
        const data = await response.json()
        const images = data.results.map((photo, index) => ({
          url: photo.urls.regular,
          alt: photo.alt_description || `${locationName} - Image ${index + 1}`,
          id: photo.id,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html
        }))
        setCityImages(images)
      } else {
        // Fallback to Unsplash Source
        const imageUrls = []
        for (let i = 0; i < 6; i++) {
          const width = i % 2 === 0 ? 800 : 600
          const height = i % 2 === 0 ? 600 : 800
          imageUrls.push({
            url: `https://source.unsplash.com/${width}x${height}/?${searchQuery}`,
            alt: `${locationName} - Image ${i + 1}`,
            id: i
          })
        }
        setCityImages(imageUrls)
      }
      */
    } catch (error) {
      console.error('Error fetching city images:', error)
      // Set empty array on error
      setCityImages([])
    } finally {
      setIsLoadingImages(false)
    }
  }

  // Generate city-specific recommendations
  const generateCityRecommendations = (cityName, countryData) => {
    // Major cities with curated recommendations
    const cityRecommendations = {
      'New York': {
        attractions: ['Statue of Liberty', 'Central Park', 'Times Square', 'Empire State Building', 'Brooklyn Bridge'],
        activities: ['Broadway Shows', 'Museum Visits', 'Food Tours', 'Shopping', 'Skyline Views'],
        cuisine: ['Pizza', 'Bagels', 'Food Trucks', 'Fine Dining', 'International Cuisine']
      },
      'London': {
        attractions: ['Big Ben', 'Tower Bridge', 'British Museum', 'Buckingham Palace', 'London Eye'],
        activities: ['Theater Shows', 'Museum Tours', 'River Cruises', 'Pub Crawls', 'Shopping'],
        cuisine: ['Fish & Chips', 'Afternoon Tea', 'Indian Cuisine', 'Traditional Pubs', 'Street Food']
      },
      'Paris': {
        attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Arc de Triomphe', 'Montmartre'],
        activities: ['Museum Visits', 'Seine Cruises', 'Cafe Culture', 'Shopping', 'Art Galleries'],
        cuisine: ['Croissants', 'French Wine', 'Cheese', 'Fine Dining', 'Patisseries']
      },
      'Tokyo': {
        attractions: ['Tokyo Skytree', 'Senso-ji Temple', 'Shibuya Crossing', 'Meiji Shrine', 'Tsukiji Market'],
        activities: ['Temple Visits', 'Shopping', 'Anime Culture', 'Food Tours', 'Nightlife'],
        cuisine: ['Sushi', 'Ramen', 'Tempura', 'Street Food', 'Kaiseki']
      },
      'Sydney': {
        attractions: ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'Royal Botanic Gardens', 'Taronga Zoo'],
        activities: ['Beach Activities', 'Harbor Cruises', 'Hiking', 'Wildlife Watching', 'Water Sports'],
        cuisine: ['Seafood', 'BBQ', 'Australian Wine', 'Coffee Culture', 'Modern Australian']
      },
      'Tel Aviv': {
        attractions: ['Old Jaffa', 'Tel Aviv Beaches', 'Carmel Market', 'Rothschild Boulevard', 'Tel Aviv Museum of Art'],
        activities: ['Beach Activities', 'Nightlife', 'Food Tours', 'Bike Tours', 'Street Art Tours'],
        cuisine: ['Hummus & Falafel', 'Shakshuka', 'Fresh Seafood', 'Israeli Wine', 'Street Food']
      },
      'Jerusalem': {
        attractions: ['Old City', 'Western Wall', 'Church of the Holy Sepulchre', 'Dome of the Rock', 'Mount of Olives'],
        activities: ['Historical Tours', 'Religious Sites', 'Market Visits', 'Museum Tours', 'Cultural Experiences'],
        cuisine: ['Middle Eastern Cuisine', 'Traditional Dishes', 'Street Food', 'Local Markets', 'Kosher Restaurants']
      }
    }

    // Check if we have curated recommendations for this city
    if (cityRecommendations[cityName]) {
      return cityRecommendations[cityName]
    }

    // Otherwise, generate based on region
    return generateRecommendations(countryData)
  }

  // Calculate number of nights from dates
  const calculateNights = (start, end) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Fetch weather data for the location (city or capital)
  const fetchWeatherData = async (locationName, latlng, startDate, endDate) => {
    setIsLoadingWeather(true)
    
    try {
      // For demo purposes, we'll use mock weather data
      // To use real weather data, you can:
      // 1. Get a free API key from openweathermap.org
      // 2. Replace 'YOUR_API_KEY' below with your key
      // 3. Uncomment the API call code below
      
      // Uncomment below to use real weather API (requires free API key from openweathermap.org):
      /*
      const apiKey = 'YOUR_API_KEY' // Get free key from https://openweathermap.org/api
      let url
      if (latlng && latlng.length === 2) {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latlng[0]}&lon=${latlng[1]}&appid=${apiKey}&units=metric`
      } else {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(capital)}&appid=${apiKey}&units=metric`
      }
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const nights = calculateNights(startDate, endDate)
        const filteredForecast = data.list.slice(0, Math.min(nights * 2, 40))
        // Transform API data to match our format
        const formattedForecast = filteredForecast.map(item => ({
          condition: item.weather[0].main.toLowerCase().includes('rain') ? 'rainy' :
                     item.weather[0].main.toLowerCase().includes('cloud') ? 'cloudy' :
                     item.weather[0].main.toLowerCase().includes('clear') ? 'sunny' : 'partly-cloudy',
          temp: Math.round(item.main.temp),
          description: item.weather[0].description
        }))
        setWeatherData(formattedForecast)
        return formattedForecast
      }
      */
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Use mock weather data (works without API key)
      const mockData = generateMockWeather(startDate, endDate)
      return mockData
    } catch (error) {
      console.error('Error fetching weather:', error)
      // Fallback to mock data
      const mockData = generateMockWeather(startDate, endDate)
      return mockData
    } finally {
      setIsLoadingWeather(false)
    }
  }

  // Generate mock weather data for demo (works without API key)
  // This provides realistic weather variations for the itinerary
  const generateMockWeather = (startDate, endDate) => {
    const nights = calculateNights(startDate, endDate)
    const mockWeather = []
    const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy']
    const temps = [15, 18, 20, 22, 25, 28] // Celsius - varied temperatures
    
    // Use date-based seed for consistent weather per day
    const startDateObj = new Date(startDate)
    
    for (let i = 0; i < nights; i++) {
      // Use day of year as seed for consistent weather
      const dayOfYear = Math.floor((startDateObj.getTime() - new Date(startDateObj.getFullYear(), 0, 0).getTime()) / 86400000) + i
      const seed = dayOfYear % 7 // Vary by day of week
      
      const condition = conditions[seed % conditions.length]
      const temp = temps[seed % temps.length]
      
      let description
      if (condition === 'sunny') description = 'Clear sky'
      else if (condition === 'rainy') description = 'Light rain'
      else if (condition === 'cloudy') description = 'Cloudy'
      else description = 'Partly cloudy'
      
      mockWeather.push({
        condition,
        temp,
        description
      })
    }
    setWeatherData(mockWeather)
    return mockWeather
  }

  // Generate itinerary based on weather and number of nights
  const generateItinerary = (countryData, recommendations, weatherData, nights) => {
    if (!weatherData || weatherData.length === 0) {
      weatherData = Array(nights).fill({ condition: 'sunny', temp: 20 })
    }

    const itinerary = []
    const allAttractions = recommendations.attractions || []
    const allActivities = recommendations.activities || []
    const allCuisine = recommendations.cuisine || []

    // Categorize activities by weather suitability
    const outdoorActivities = allActivities.filter(a => 
      a.toLowerCase().includes('hiking') || 
      a.toLowerCase().includes('beach') || 
      a.toLowerCase().includes('walking') ||
      a.toLowerCase().includes('outdoor') ||
      a.toLowerCase().includes('safari') ||
      a.toLowerCase().includes('water')
    )
    
    const indoorActivities = allActivities.filter(a => 
      a.toLowerCase().includes('museum') || 
      a.toLowerCase().includes('theater') || 
      a.toLowerCase().includes('cooking') ||
      a.toLowerCase().includes('shopping') ||
      a.toLowerCase().includes('temple') ||
      a.toLowerCase().includes('indoor')
    )

    for (let day = 0; day < nights; day++) {
      const weather = weatherData[day] || { condition: 'sunny', temp: 20 }
      const isGoodWeather = weather.condition === 'sunny' || weather.condition === 'partly-cloudy'
      
      const dayPlan = {
        day: day + 1,
        date: new Date(new Date(startDate).getTime() + day * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
        weather: {
          condition: weather.condition || 'sunny',
          temp: weather.temp || 20,
          description: weather.description || 'Clear sky'
        },
        morning: [],
        afternoon: [],
        evening: [],
        dining: []
      }

      // Morning activities (weather-dependent)
      if (isGoodWeather && outdoorActivities.length > 0) {
        dayPlan.morning.push(outdoorActivities[day % outdoorActivities.length] || outdoorActivities[0])
      } else if (indoorActivities.length > 0) {
        dayPlan.morning.push(indoorActivities[day % indoorActivities.length] || indoorActivities[0])
      } else {
        dayPlan.morning.push(allActivities[day % allActivities.length] || 'Explore local area')
      }

      // Afternoon - mix of attractions and activities
      if (allAttractions.length > 0) {
        dayPlan.afternoon.push(allAttractions[day % allAttractions.length] || allAttractions[0])
      }
      if (isGoodWeather && outdoorActivities.length > 0) {
        const activity = outdoorActivities[(day + 1) % outdoorActivities.length]
        if (activity && !dayPlan.morning.includes(activity)) {
          dayPlan.afternoon.push(activity)
        }
      }

      // Evening activities
      if (indoorActivities.length > 0) {
        dayPlan.evening.push(indoorActivities[(day + 2) % indoorActivities.length] || indoorActivities[0])
      } else {
        dayPlan.evening.push('Evening stroll or local entertainment')
      }

      // Dining recommendations
      if (allCuisine.length > 0) {
        dayPlan.dining.push(allCuisine[day % allCuisine.length] || allCuisine[0])
      }

      itinerary.push(dayPlan)
    }

    return itinerary
  }

  // Handle trip planner form submission
  const handleTripPlannerSubmit = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    const nights = calculateNights(startDate, endDate)
    if (nights <= 0) {
      alert('End date must be after start date')
      return
    }

    if (nights > 14) {
      alert('Trip planner currently supports trips up to 14 nights')
      return
    }

    // Fetch weather data (use city name if available, otherwise capital)
    const locationName = countryData.cityName || countryData.capital
    const weather = await fetchWeatherData(
      locationName, 
      countryData.latlng, 
      startDate, 
      endDate
    )

    // Generate itinerary
    const generatedItinerary = generateItinerary(
      countryData, 
      recommendations, 
      weather, 
      nights
    )
    
    setItinerary(generatedItinerary)
  }

  const generateRecommendations = (countryData) => {
    // Generate recommendations based on region
    const regionRecommendations = {
      'Europe': {
        attractions: ['Historic Castles', 'Medieval Towns', 'Art Museums', 'Cathedrals', 'Scenic Countryside'],
        activities: ['City Walking Tours', 'Museum Visits', 'Cultural Festivals', 'Mountain Hiking', 'Beach Activities'],
        cuisine: ['Local Wines', 'Traditional Dishes', 'Street Food', 'Fine Dining', 'Regional Specialties']
      },
      'Asia': {
        attractions: ['Ancient Temples', 'Modern Skyscrapers', 'Historic Sites', 'Natural Landscapes', 'Cultural Districts'],
        activities: ['Temple Visits', 'Street Food Tours', 'Shopping', 'Traditional Performances', 'Nature Excursions'],
        cuisine: ['Local Street Food', 'Traditional Cuisine', 'Tea Culture', 'Spicy Dishes', 'Regional Flavors']
      },
      'Americas': {
        attractions: ['National Parks', 'Historic Cities', 'Natural Wonders', 'Beaches', 'Cultural Sites'],
        activities: ['Outdoor Adventures', 'City Tours', 'Beach Activities', 'Wildlife Watching', 'Cultural Experiences'],
        cuisine: ['Local Specialties', 'Street Food', 'Regional Cuisine', 'Traditional Dishes', 'Local Beverages']
      },
      'Africa': {
        attractions: ['Wildlife Reserves', 'Historic Sites', 'Natural Landscapes', 'Cultural Villages', 'Coastal Areas'],
        activities: ['Safari Tours', 'Wildlife Watching', 'Cultural Tours', 'Beach Activities', 'Adventure Sports'],
        cuisine: ['Traditional Dishes', 'Local Spices', 'Street Food', 'Regional Specialties', 'Local Beverages']
      },
      'Oceania': {
        attractions: ['Natural Landscapes', 'Beaches', 'Islands', 'National Parks', 'Cultural Sites'],
        activities: ['Beach Activities', 'Water Sports', 'Wildlife Watching', 'Hiking', 'Island Hopping'],
        cuisine: ['Seafood', 'Local Specialties', 'Fresh Produce', 'Regional Cuisine', 'Beachside Dining']
      }
    }

    const region = countryData.region || 'Unknown'
    return regionRecommendations[region] || {
      attractions: ['Local Attractions', 'Historic Sites', 'Natural Landscapes', 'Cultural Centers', 'Scenic Views'],
      activities: ['City Tours', 'Cultural Experiences', 'Local Activities', 'Nature Excursions', 'Shopping'],
      cuisine: ['Local Cuisine', 'Traditional Dishes', 'Street Food', 'Regional Specialties', 'Local Beverages']
    }
  }

  if (isLoading) {
    return (
      <div className="recommendations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      </div>
    )
  }

  if (!countryData || !recommendations) {
    return (
      <div className="recommendations-page">
        <div className="error-container">
          <p>Unable to load recommendations. Please try again.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-container">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Search
        </button>

        <header className="recommendations-header">
          {countryData.flag && (
            <img 
              src={countryData.flag} 
              alt={`${countryData.name} flag`} 
              className="country-flag-large"
            />
          )}
          <h1>{countryData.cityName || countryData.name}</h1>
          <p className="country-capital">
            {countryData.cityName 
              ? `📍 ${countryData.cityName}, ${countryData.name}`
              : `Capital: ${countryData.capital}`
            }
          </p>
        </header>

        <div className="country-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Region:</span>
              <span className="info-value">{countryData.region}</span>
            </div>
            {countryData.subregion && (
              <div className="info-item">
                <span className="info-label">Subregion:</span>
                <span className="info-value">{countryData.subregion}</span>
              </div>
            )}
            {countryData.population && (
              <div className="info-item">
                <span className="info-label">Population:</span>
                <span className="info-value">
                  {countryData.population.toLocaleString()}
                </span>
              </div>
            )}
            {countryData.area && (
              <div className="info-item">
                <span className="info-label">Area:</span>
                <span className="info-value">
                  {countryData.area.toLocaleString()} km²
                </span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Languages:</span>
              <span className="info-value">{countryData.languages}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Currencies:</span>
              <span className="info-value">{countryData.currencies}</span>
            </div>
          </div>
        </div>

        {/* City Images Collage */}
        {cityImages.length > 0 && (
          <div className="city-images-section">
            <h2>📸 {countryData.cityName || countryData.name} Gallery</h2>
            {isLoadingImages ? (
              <div className="images-loading">
                <div className="loading-spinner-small"></div>
                <p>Loading images...</p>
              </div>
            ) : (
              <div className="image-collage">
                {cityImages.map((image, index) => (
                  <div key={image.id || index} className="collage-item">
                    <img
                      src={image.url}
                      alt={image.alt}
                      loading="lazy"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trip Planner Toggle */}
        <div className="trip-planner-toggle">
          <button
            onClick={() => setIsTripPlannerMode(!isTripPlannerMode)}
            className={`toggle-button ${isTripPlannerMode ? 'active' : ''}`}
          >
            {isTripPlannerMode ? '📋 Trip Planner Mode' : '📅 Switch to Trip Planner'}
          </button>
        </div>

        {isTripPlannerMode ? (
          <div className="trip-planner-section">
            <h2>🗓️ Plan Your Trip</h2>
            
            <form onSubmit={handleTripPlannerSubmit} className="trip-planner-form">
              <div className="date-inputs">
                <div className="date-input-group">
                  <label htmlFor="start-date">Start Date</label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="end-date">End Date</label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              {startDate && endDate && (
                <div className="trip-summary">
                  <p>
                    <strong>{calculateNights(startDate, endDate)} nights</strong> in {countryData.cityName || countryData.name}
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary generate-itinerary-btn"
                disabled={isLoadingWeather}
              >
                {isLoadingWeather ? 'Loading Weather & Generating Itinerary...' : 'Generate Itinerary'}
              </button>
            </form>

            {itinerary && itinerary.length > 0 && (
              <div className="itinerary-section">
                <h3>📅 Your {calculateNights(startDate, endDate)}-Night Itinerary</h3>
                {itinerary.map((day, index) => (
                  <div key={index} className="itinerary-day">
                    <div className="day-header">
                      <h4>Day {day.day} - {day.date}</h4>
                      <div className="weather-badge">
                        <span className={`weather-icon ${day.weather.condition}`}>
                          {day.weather.condition === 'sunny' ? '☀️' : 
                           day.weather.condition === 'rainy' ? '🌧️' : 
                           day.weather.condition === 'cloudy' ? '☁️' : '⛅'}
                        </span>
                        <span>{day.weather.temp}°C - {day.weather.description}</span>
                      </div>
                    </div>
                    
                    <div className="day-schedule">
                      <div className="schedule-item">
                        <span className="schedule-time">🌅 Morning:</span>
                        <span className="schedule-activity">{day.morning.join(', ')}</span>
                      </div>
                      <div className="schedule-item">
                        <span className="schedule-time">☀️ Afternoon:</span>
                        <span className="schedule-activity">{day.afternoon.join(', ')}</span>
                      </div>
                      <div className="schedule-item">
                        <span className="schedule-time">🌙 Evening:</span>
                        <span className="schedule-activity">{day.evening.join(', ')}</span>
                      </div>
                      <div className="schedule-item">
                        <span className="schedule-time">🍽️ Dining:</span>
                        <span className="schedule-activity">{day.dining.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="recommendations-section">
            <h2>🌟 Travel Recommendations</h2>

            <div className="recommendation-category">
              <h3>🏛️ Must-See Attractions</h3>
              <ul className="recommendation-list">
                {recommendations.attractions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation-category">
              <h3>🎯 Activities & Experiences</h3>
              <ul className="recommendation-list">
                {recommendations.activities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation-category">
              <h3>🍽️ Food & Cuisine</h3>
              <ul className="recommendation-list">
                {recommendations.cuisine.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecommendationsPage


