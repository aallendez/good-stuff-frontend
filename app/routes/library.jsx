import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Upload, File, CheckCircle, Loader } from 'lucide-react'
import { Link, useNavigate } from '@remix-run/react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Card, CardContent } from "../components/ui/card"


const getAllRestaurants = async () => {
    const endpoint = "http://127.0.0.1:8000/api/get-all-restaurants/"

    try {
        const response = await fetch(endpoint)
        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching restaurants:", error)
    }
}

const handleGetAvgPrice = async (restaurant_id) => {
    const endpoint = "http://127.0.0.1:8000/api/get-summarized-avg-prices/"

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "restaurant_id": restaurant_id
            })
        })

        const data = await response.json()
        if (data.error) {
            return null
        }
        return data
    } catch (error) {
        console.error("Error fetching avg price:", error)
        return null
    }
}

export default function Library() {
    const [restaurantsWithPrices, setRestaurantsWithPrices] = useState([])
    const [avgPrices, setAvgPrices] = useState({})

    useEffect(() => {
        const fetchAllRestaurants = async () => {
            try {
                const results = await getAllRestaurants()
                const allRestaurants = results.restaurants
                
                const pricesPromises = allRestaurants.map(restaurant => 
                    handleGetAvgPrice(restaurant.id)
                )
                const pricesResults = await Promise.all(pricesPromises)
                
                const pricesMap = {}
                const validRestaurants = []
                
                allRestaurants.forEach((restaurant, index) => {
                    const price = pricesResults[index]
                    if (price) {
                        pricesMap[restaurant.id] = price
                        validRestaurants.push(restaurant)
                    }
                })
                
                setRestaurantsWithPrices(validRestaurants)
                setAvgPrices(pricesMap)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchAllRestaurants()
    }, [])

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
            <Card className="w-full max-w-6xl rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
                <CardContent className="p-6 w-full">
                    <Link to="/" className="flex items-center text-green-600 hover:text-green-800 mb-8 group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" /> Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-tight">Restaurant Library</h1>
                    {restaurantsWithPrices.length === 0 ? (
                        <div className="flex justify-center items-center min-h-[200px] w-full">
                            <Loader className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto py-2">
                            {restaurantsWithPrices.map((restaurant) => (
                                <Link 
                                    to={`/restaurants/${restaurant.id}`}
                                    key={restaurant.id}
                                    state={{ restaurantData: restaurant }}
                                >
                                    <Card className="w-full hover:shadow-md rounded-xl transition-shadow duration-300 cursor-pointer py-1">
                                        <CardContent className="p-4 flex items-start space-x-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-800">
                                                    <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">
                                                        {restaurant.name}
                                                    </a>
                                                </h2>
                                                <p className="text-sm text-gray-600">{restaurant.location}</p>
                                                <p className="text-sm text-gray-500">{restaurant.schedule}</p>
                                                {avgPrices[restaurant.id] && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        <p>Avg Price: ${parseFloat(avgPrices[restaurant.id].avg_food_price).toFixed(2)}</p>
                                                        <p>Price Range: ${avgPrices[restaurant.id].min_food_price} - ${avgPrices[restaurant.id].max_food_price}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}