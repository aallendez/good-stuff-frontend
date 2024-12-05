import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Upload, File, CheckCircle } from 'lucide-react'
import { Link } from '@remix-run/react'
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

const handleCreateNewRestaurant = async(newRestaurant) => {
    const endpoint = "http://127.0.0.1:8000/api/create-restaurant/"

    try {
        console.log("Creating new restaurant", newRestaurant)
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newRestaurant)
        })
        const data = await response.json()
        console.log("New restaurant created", data.restaurant.id)
        return data.restaurant.id
    } catch (error) {
        console.error("Error creating new restaurant:", error)
    }
}

const handleUploadMenu = async(file, restaurantId) => {
    const endpoint = "http://127.0.0.1:8000/api/upload-menu/"

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('restaurant_id', restaurantId); 

        const response = await fetch(endpoint, {
            method: "POST",
            body: formData
        });

        // Optionally handle the response
        if (!response.ok) {
            const errorText = await response.text(); // Get the response body
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
    } catch (error) {
        console.error("Error uploading menu:", error);
    }
}

export default function UploadMenu() {
  const [file, setFile] = useState(null)
  const [restaurantOption, setRestaurantOption] = useState('existing')
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [allRestaurants, setAllRestaurants] = useState([])
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    location: '',
    schedule: '',
    url: '',
    cuisine: ''
  })
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (file, existingRestaurantId, newRestaurant) => {
    try {
        let restaurantId = existingRestaurantId;

        // only create new restaurant if newRestaurant is provided
        try{
            if (newRestaurant && restaurantOption === 'new') {
                restaurantId = await handleCreateNewRestaurant(newRestaurant);
            }
        } catch (error) {
            console.error("Error creating new restaurant:", error);
        }

        if (!restaurantId || typeof restaurantId !== 'number') {
            throw new Error('No valid restaurant ID available');
        }

        await handleUploadMenu(file, restaurantId);
        console.log("Menu uploaded successfully");
    } catch (error) {
        console.error("Error in upload process:", error);
    }
}


  useEffect(() => {
    const fetchAllRestaurants = async () => {
      try {
        const results = await getAllRestaurants()
        setAllRestaurants(results.restaurants)
      } catch (error) {
        console.error('Error fetching all restaurants:', error)
      }
    }

    fetchAllRestaurants()
  }, [])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files?.[0]?.type === "application/pdf") {
      setFile(files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    const files = e.target.files
    if (files?.[0]?.type === "application/pdf") {
      setFile(files[0])
    }
  }

  // Handle restaurant search and suggestions
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim()) {
      const filteredSuggestions = allRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filteredSuggestions)
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion) => {
    console.log("Selected restaurant:", suggestion);
    setSearchQuery(suggestion.name);
    setSuggestions([]);
    setRestaurantOption('existing');
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const selectedRestaurant = allRestaurants.find(r => r.name === searchQuery);
    console.log("Selected restaurant at submit:", selectedRestaurant);
    
    // If it's an existing restaurant, pass the restaurant ID from the selected restaurant
    const existingRestaurantId = restaurantOption === 'existing' 
        ? selectedRestaurant?.id 
        : null;

    console.log("Submitting with restaurant:", searchQuery, "ID:", existingRestaurantId);
    
    // Only pass newRestaurant data if we're creating a new restaurant
    const restaurantData = restaurantOption === 'new' ? newRestaurant : null;
    
    handleUpload(file, existingRestaurantId, restaurantData);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-6xl rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <CardContent className="p-6">
          <Link to="/" className="flex items-center text-green-600 hover:text-green-800 mb-8 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-tight">Upload Menu</h1>
          <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div 
              className={`border-2 border-dashed flex flex-col items-center justify-center rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive ? 'border-blue-400 bg-blue-50 scale-105' : 'border-gray-300 hover:border-gray-400 hover:bg-white'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-lg font-semibold text-gray-700">{file.name}</p>
                  <p className="text-sm text-gray-500">File selected</p>
                </div>
              ) : dragActive ? (
                <div className="flex flex-col items-center">
                  <Upload className="h-16 w-16 text-blue-500 mb-4 animate-bounce" />
                  <p className="text-lg font-semibold text-gray-700">Drop the PDF here</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <File className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Drag & drop a PDF file here, or click to select</p>
                  <p className="text-sm text-gray-500 mt-2">Only PDF files are accepted</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-lg font-semibold">Restaurant Option</Label>
                <RadioGroup 
                  value={restaurantOption} 
                  onValueChange={setRestaurantOption} 
                  className="flex space-x-4 cursor-pointer"
                >
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing" className="cursor-pointer">Select Existing Restaurant</Label>
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="cursor-pointer">Create New Restaurant</Label>
                </RadioGroup>
              </div>

              {restaurantOption === 'existing' && (
                <div className="space-y-2">
                  <Label htmlFor="restaurant-search" className="text-lg font-semibold">Search Restaurants</Label>
                  <div className="relative">
                    <Input
                      id="restaurant-search"
                      type="text"
                      placeholder="Type to search..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full rounded-xl"
                    />
                    {suggestions.length > 0 && (
                      <Card className="absolute rounded-xl w-full mt-2 z-10">
                        <CardContent className="p-0 rounded-xl">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-xl"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion.name}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {restaurantOption === 'new' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="name">Restaurant Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      value={newRestaurant.name} 
                      onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <Input 
                      id="location" 
                      value={newRestaurant.location} 
                      onChange={(e) => setNewRestaurant({...newRestaurant, location: e.target.value})}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule">Schedule <span className="text-red-500">*</span></Label>
                    <Input 
                      id="schedule" 
                      value={newRestaurant.schedule} 
                      onChange={(e) => setNewRestaurant({...newRestaurant, schedule: e.target.value})}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL <span className="text-red-500">*</span></Label>
                    <Input 
                      id="url" 
                      type="url"
                      value={newRestaurant.url} 
                      onChange={(e) => setNewRestaurant({...newRestaurant, url: e.target.value})}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cuisine">Cuisine <span className="text-red-500">*</span></Label>
                    <Input 
                      id="cuisine" 
                      value={newRestaurant.cuisine} 
                      onChange={(e) => setNewRestaurant({...newRestaurant, cuisine: e.target.value})}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit"
                className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white rounded-xl" 
                disabled={!file || (restaurantOption === 'existing' && !searchQuery) || (restaurantOption === 'new' && Object.values(newRestaurant).some(value => !value))}
              >
                Upload Menu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}