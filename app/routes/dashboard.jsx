import { useState } from 'react'
import { Search, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Link } from '@remix-run/react'
import { Loader } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedRestaurants, setExpandedRestaurants] = useState({})

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const endpoint = `http://127.0.0.1:8000/api/q/`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "query": query
        })
      })

      const data = await response.json()
      setResults(Array.isArray(data.results) ? data.results : [])
      console.log("Data Received:", data)
    } catch (error) {
      console.error("Error fetching data:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const toggleRestaurant = (index) => {
    setExpandedRestaurants(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  console.log("Current results state:", results)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-6xl rounded-xl shadow-lg min-h-[600px] flex items-start justify-center">
        <CardContent className="p-6 w-full">
            <Link to="/" className="flex items-center text-green-600 hover:text-green-800 mb-8 group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" /> Back to Home
            </Link>
            <h1 className="text-4xl font-semibold mb-12 text-gray-800 tracking-wide">Search The Right Food</h1>
            <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                type="text"
                placeholder="Tell me about your allergies"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow rounded-full h-12"
                />
                <Button type="submit" className="bg-green-500 w-12 h-12 flex items-center justify-center hover:bg-green-600 rounded-full">
                <Search className="h-6 w-6" />
                </Button>
            </form>
            {loading && (
                <div className="mt-8 flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-green-500" />
                </div>
            )}
            {!loading && results.length > 0 && (
                <div className="w-full max-w-6xl mt-8 grid gap-8">
                {results.map((restaurant, index) => (
                    <Card key={index} className="w-full rounded-xl bg-white shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div 
                                className="border-b pb-4 mb-4 cursor-pointer flex justify-between items-center"
                                onClick={() => toggleRestaurant(index)}
                            >
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">{restaurant.name}</h2>
                                    <p className="text-gray-600">{restaurant.location}</p>
                                    <a 
                                        href={restaurant.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-green-600 hover:text-green-800"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Visit Website
                                    </a>
                                </div>
                                {expandedRestaurants[index] ? (
                                    <ChevronUp className="h-6 w-6 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-6 w-6 text-gray-500" />
                                )}
                            </div>
                            
                            {expandedRestaurants[index] && (
                                <div className="space-y-6">
                                    {restaurant.foods.map((food, foodIndex) => (
                                        <div key={foodIndex} className="border-b last:border-b-0 pb-4 last:pb-0">
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                                {food.food_name}
                                            </h3>
                                            {food.food_description && (
                                                <p className="text-gray-600 mb-2">{food.food_description}</p>
                                            )}
                                            {food.food_price > 0 && (
                                                <p className="text-gray-800 font-medium mb-2">
                                                    ${food.food_price.toFixed(2)}
                                                </p>
                                            )}
                                            {food.ingredients.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {food.ingredients.map((ingredient, i) => (
                                                        <span 
                                                            key={i} 
                                                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                                                        >
                                                            {ingredient}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  )
}