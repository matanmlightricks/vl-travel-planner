import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchPage.css'

// Curated list of major cities worldwide (fallback when API is unavailable)
const getMajorCities = (searchQuery) => {
  const majorCities = [
    { name: 'New York', country: 'United States' },
    { name: 'Los Angeles', country: 'United States' },
    { name: 'Chicago', country: 'United States' },
    { name: 'San Francisco', country: 'United States' },
    { name: 'Miami', country: 'United States' },
    { name: 'London', country: 'United Kingdom' },
    { name: 'Manchester', country: 'United Kingdom' },
    { name: 'Edinburgh', country: 'United Kingdom' },
    { name: 'Paris', country: 'France' },
    { name: 'Lyon', country: 'France' },
    { name: 'Marseille', country: 'France' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Osaka', country: 'Japan' },
    { name: 'Kyoto', country: 'Japan' },
    { name: 'Sydney', country: 'Australia' },
    { name: 'Melbourne', country: 'Australia' },
    { name: 'Brisbane', country: 'Australia' },
    { name: 'Toronto', country: 'Canada' },
    { name: 'Vancouver', country: 'Canada' },
    { name: 'Montreal', country: 'Canada' },
    { name: 'Berlin', country: 'Germany' },
    { name: 'Munich', country: 'Germany' },
    { name: 'Hamburg', country: 'Germany' },
    { name: 'Rome', country: 'Italy' },
    { name: 'Milan', country: 'Italy' },
    { name: 'Venice', country: 'Italy' },
    { name: 'Barcelona', country: 'Spain' },
    { name: 'Madrid', country: 'Spain' },
    { name: 'Seville', country: 'Spain' },
    { name: 'Amsterdam', country: 'Netherlands' },
    { name: 'Rotterdam', country: 'Netherlands' },
    { name: 'Dubai', country: 'United Arab Emirates' },
    { name: 'Singapore', country: 'Singapore' },
    { name: 'Hong Kong', country: 'Hong Kong' },
    { name: 'Bangkok', country: 'Thailand' },
    { name: 'Seoul', country: 'South Korea' },
    { name: 'Shanghai', country: 'China' },
    { name: 'Beijing', country: 'China' },
    { name: 'Mumbai', country: 'India' },
    { name: 'Delhi', country: 'India' },
    { name: 'Bangalore', country: 'India' },
    { name: 'São Paulo', country: 'Brazil' },
    { name: 'Rio de Janeiro', country: 'Brazil' },
    { name: 'Buenos Aires', country: 'Argentina' },
    { name: 'Mexico City', country: 'Mexico' },
    { name: 'Cairo', country: 'Egypt' },
    { name: 'Cape Town', country: 'South Africa' },
    { name: 'Istanbul', country: 'Turkey' },
    { name: 'Moscow', country: 'Russia' },
    { name: 'Saint Petersburg', country: 'Russia' },
    { name: 'Tel Aviv', country: 'Israel' },
    { name: 'Jerusalem', country: 'Israel' },
    { name: 'Haifa', country: 'Israel' },
    { name: 'Athens', country: 'Greece' },
    { name: 'Prague', country: 'Czech Republic' },
    { name: 'Vienna', country: 'Austria' },
    { name: 'Stockholm', country: 'Sweden' },
    { name: 'Copenhagen', country: 'Denmark' },
    { name: 'Oslo', country: 'Norway' },
    { name: 'Dublin', country: 'Ireland' },
    { name: 'Lisbon', country: 'Portugal' },
    { name: 'Warsaw', country: 'Poland' },
    { name: 'Budapest', country: 'Hungary' },
    { name: 'Zurich', country: 'Switzerland' },
    { name: 'Brussels', country: 'Belgium' },
    { name: 'Jakarta', country: 'Indonesia' },
    { name: 'Manila', country: 'Philippines' },
    { name: 'Ho Chi Minh City', country: 'Vietnam' },
    { name: 'Kuala Lumpur', country: 'Malaysia' }
  ]
  
  const query = searchQuery.toLowerCase()
  return majorCities.filter(city => 
    city.name.toLowerCase().includes(query) || 
    city.country.toLowerCase().includes(query)
  ).slice(0, 10)
}

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const navigate = useNavigate()

  // Fetch countries and cities from APIs
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      const allResults = []

      try {
        // 1. Search by country name
        try {
          const countryResponse = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(searchQuery)}`
          )
          
          if (countryResponse.ok) {
            const countryData = await countryResponse.json()
            const formatted = countryData.map(country => ({
              type: 'country',
              name: country.name.common,
              capital: country.capital?.[0] || 'N/A',
              flag: country.flags?.svg || country.flags?.png,
              code: country.cca2,
              latlng: country.latlng || null
            }))
            allResults.push(...formatted)
          }
        } catch (err) {
          console.log('Country search error:', err)
        }

        // 2. Search by capital city
        try {
          const capitalResponse = await fetch(
            `https://restcountries.com/v3.1/capital/${encodeURIComponent(searchQuery)}`
          )
          if (capitalResponse.ok) {
            const capitalData = await capitalResponse.json()
            const formatted = capitalData.map(country => ({
              type: 'capital',
              name: country.name.common,
              capital: country.capital?.[0] || 'N/A',
              flag: country.flags?.svg || country.flags?.png,
              code: country.cca2,
              latlng: country.latlng || null
            }))
            // Avoid duplicates
            formatted.forEach(item => {
              if (!allResults.find(r => r.name === item.name && r.capital === item.capital)) {
                allResults.push(item)
              }
            })
          }
        } catch (err) {
          console.log('Capital search error:', err)
        }

        // 3. Search for cities worldwide
        // Always check curated list first (works without API key), then try API
        const majorCities = getMajorCities(searchQuery)
        if (majorCities.length > 0) {
          const cityResults = await Promise.all(
            majorCities.map(async (city) => {
              try {
                const countryInfoResponse = await fetch(
                  `https://restcountries.com/v3.1/name/${encodeURIComponent(city.country)}`
                )
                let flag = null
                let countryCode = null
                if (countryInfoResponse.ok) {
                  const countryInfo = await countryInfoResponse.json()
                  const country = countryInfo[0] || countryInfo
                  flag = country?.flags?.svg || country?.flags?.png
                  countryCode = country?.cca2
                }
                
                return {
                  type: 'city',
                  name: city.name,
                  country: city.country,
                  countryCode: countryCode,
                  capital: null,
                  flag: flag,
                  code: countryCode,
                  latlng: null,
                  population: null
                }
              } catch (err) {
                return {
                  type: 'city',
                  name: city.name,
                  country: city.country,
                  countryCode: null,
                  capital: null,
                  flag: null,
                  code: null,
                  latlng: null,
                  population: null
                }
              }
            })
          )
          allResults.push(...cityResults.filter(c => c !== null))
        }

        // Also try API search (optional - requires free API key from api-ninjas.com)
        // This is commented out by default since it requires an API key
        // Uncomment and add your API key if you want to search more cities
        /*
        try {
          const cityResponse = await fetch(
            `https://api.api-ninjas.com/v1/city?name=${encodeURIComponent(searchQuery)}&limit=10`,
            {
              headers: {
                'X-Api-Key': 'YOUR_API_KEY_HERE' // Get free key from https://api-ninjas.com
              }
            }
          )
          
          if (cityResponse.ok) {
            const cityData = await cityResponse.json()
            if (Array.isArray(cityData) && cityData.length > 0) {
              const cityResults = await Promise.all(
                cityData.map(async (city) => {
                  try {
                    const countryName = city.country
                    const countryInfoResponse = await fetch(
                      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
                    )
                    let flag = null
                    let countryCode = null
                    if (countryInfoResponse.ok) {
                      const countryInfo = await countryInfoResponse.json()
                      const country = countryInfo[0] || countryInfo
                      flag = country?.flags?.svg || country?.flags?.png
                      countryCode = country?.cca2
                    }
                    
                    return {
                      type: 'city',
                      name: city.name,
                      country: countryName,
                      countryCode: countryCode,
                      capital: null,
                      flag: flag,
                      code: countryCode,
                      latlng: city.latitude && city.longitude ? [city.latitude, city.longitude] : null,
                      population: city.population || null
                    }
                  } catch (err) {
                    return null
                  }
                })
              )
              // Add API results, avoiding duplicates
              const apiResults = cityResults.filter(c => c !== null)
              apiResults.forEach(result => {
                if (!allResults.find(r => r.name === result.name && r.country === result.country)) {
                  allResults.push(result)
                }
              })
            }
          }
        } catch (err) {
          console.log('API city search error:', err)
        }
        */

        // Remove duplicates and limit results
        const uniqueResults = []
        const seen = new Set()
        for (const result of allResults) {
          const key = `${result.name}-${result.country || result.capital}`
          if (!seen.has(key)) {
            seen.add(key)
            uniqueResults.push(result)
          }
        }

        setSuggestions(uniqueResults.slice(0, 15)) // Show up to 15 results
      } catch (error) {
        console.error('Error fetching results:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchResults()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSelect = (location) => {
    // Navigate to recommendations page with location data
    // For cities, use the city name; for countries, use country name
    const locationName = location.type === 'city' ? location.name : location.name
    const countryName = location.type === 'city' ? location.country : location.name
    
    navigate('/recommendations', { 
      state: { 
        countryName: countryName,
        cityName: location.type === 'city' ? location.name : null,
        capital: location.capital,
        flag: location.flag,
        code: location.code,
        latlng: location.latlng,
        type: location.type || 'country',
        population: location.population
      } 
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (suggestions.length > 0) {
      handleSelect(suggestions[0])
    }
  }

  return (
    <div className="search-page">
      <div className="search-container">
        <header className="search-header">
          <h1>🌍 Travel Recommendations</h1>
          <p className="subtitle">Search for any country, capital, or city worldwide</p>
        </header>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Type a country, capital, or city (e.g., France, Paris, New York, Tokyo)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200)
              }}
            />
            {isLoading && <div className="search-spinner"></div>}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((country, index) => (
                <div
                  key={`${country.code}-${index}`}
                  className="suggestion-item"
                  onClick={() => handleSelect(country)}
                >
                  {country.flag && (
                    <img 
                      src={country.flag} 
                      alt={`${country.name} flag`} 
                      className="suggestion-flag"
                    />
                  )}
                  <div className="suggestion-info">
                    <div className="suggestion-name">
                      {country.type === 'city' ? country.name : country.name}
                      {country.type === 'city' && (
                        <span className="suggestion-type-badge">City</span>
                      )}
                      {country.type === 'capital' && (
                        <span className="suggestion-type-badge">Capital</span>
                      )}
                      {country.type === 'country' && (
                        <span className="suggestion-type-badge">Country</span>
                      )}
                    </div>
                    <div className="suggestion-capital">
                      {country.type === 'city' 
                        ? `📍 ${country.country}${country.population ? ` • ${country.population.toLocaleString()} people` : ''}`
                        : `Capital: ${country.capital}`
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !isLoading && suggestions.length === 0 && (
            <div className="no-results">
              No locations found. Try a different search term.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default SearchPage


