import { Link } from '@remix-run/react'
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Upload, Search, ChefHat } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-semibold mb-12 text-gray-800 tracking-wide">Good Stuff</h1>
      <div className="flex gap-8">
        <Card className="w-[280px] h-[280px] rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
          <CardContent className="p-0 h-full">
            <Link to="/upload" className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="mb-4 p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-300">
                <Upload className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Upload Menu</h2>
              <p className="text-sm text-gray-600">Add a new menu to your collection</p>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-[280px] h-[280px] rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
          <CardContent className="p-0 h-full">
            <Link to="/dashboard" className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="mb-4 p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-300">
                <Search className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Search Menus</h2>
              <p className="text-sm text-gray-600">Search or analyze existing menus</p>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-[280px] h-[280px] rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
          <CardContent className="p-0 h-full">
            <Link to="/library" className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="mb-4 p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-300">
                <ChefHat className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Restaurant Library</h2>
              <p className="text-sm text-gray-600">Explore a curated collection of menus</p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}