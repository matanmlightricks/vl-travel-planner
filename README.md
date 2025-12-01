# Travel Planner

A modern web application for discovering travel recommendations and planning trips to cities and countries worldwide. Search for any destination, view curated recommendations, and generate personalized itineraries based on weather conditions.

## Features

### 🌍 Global Search
- Search for any country, capital city, or major city worldwide
- Real-time search suggestions with country flags
- Support for 50+ major cities including Tel Aviv, New York, Paris, Tokyo, and more

### 📸 Visual Gallery
- Beautiful image collage showcasing each destination
- 6 high-quality images per location
- Responsive masonry-style grid layout

### 📅 Trip Planner
- Select travel dates for your trip
- Weather-aware itinerary generation
- Day-by-day activity suggestions based on:
  - Number of nights
  - Weather conditions
  - Indoor/outdoor activity recommendations

### 🌟 Travel Recommendations
- Curated recommendations for popular destinations
- Three categories:
  - 🏛️ Must-See Attractions
  - 🎯 Activities & Experiences
  - 🍽️ Food & Cuisine
- Region-based recommendations for all destinations

## Tech Stack

- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **REST Countries API** - Country and city data
- **Unsplash** - City images
- **CSS3** - Modern styling with gradients and animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/matanmlightricks/vl-travel-planner.git
cd vl-travel-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
vl-travel-planner/
├── src/
│   ├── components/
│   │   ├── SearchPage.jsx          # Main search interface
│   │   ├── SearchPage.css
│   │   ├── RecommendationsPage.jsx # Destination details & trip planner
│   │   └── RecommendationsPage.css
│   ├── App.jsx                     # Main app component with routing
│   ├── App.css                     # Global styles
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Base styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Usage

1. **Search for a Destination**
   - Type a country name, capital, or city in the search box
   - Select from the suggestions

2. **View Recommendations**
   - Browse attractions, activities, and cuisine recommendations
   - View the image gallery

3. **Plan Your Trip**
   - Click "Switch to Trip Planner"
   - Select your travel dates
   - Click "Generate Itinerary"
   - View your personalized day-by-day plan with weather-based suggestions

## API Integrations

- **REST Countries API** - Free API for country and capital data
- **Unsplash Source API** - City images (no API key required for basic usage)
- **OpenWeatherMap API** - Weather data (optional, can use mock data)

### Optional: Enhanced Weather Data

To use real weather data instead of mock data:
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Uncomment the weather API code in `RecommendationsPage.jsx`
3. Replace `'YOUR_API_KEY'` with your API key

## Features in Detail

### City Search
- Searches countries, capitals, and major cities
- Curated list of 50+ major cities
- Automatic country flag display
- Population information when available

### Trip Planner
- Calculates number of nights automatically
- Weather-based activity suggestions:
  - Sunny days → Outdoor activities
  - Rainy days → Indoor activities
- Daily schedule with:
  - Morning activities
  - Afternoon attractions
  - Evening experiences
  - Dining recommendations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**Matan Michlin**
- Email: mmichlin@lightricks.com
- GitHub: [@matanmlightricks](https://github.com/matanmlightricks)

## Acknowledgments

- REST Countries API for country data
- Unsplash for city images
- OpenWeatherMap for weather data (optional)

---

Made with ❤️ for travelers worldwide

