import { useEffect, useState } from 'react';
import { useParams, useLocation } from '@remix-run/react';
import { Card, CardContent } from "../components/ui/card";
import { Loader, ArrowLeft } from 'lucide-react';
import { Link } from '@remix-run/react';

const fetchMenuDetails = async (menuVersionId) => {
    const endpoint = `http://127.0.0.1:8000/api/get-menu-version/`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ menu_version_id: menuVersionId }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching menu details:", error);
    }
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export default function RestaurantMenu() {
    const { menuVersionId } = useParams();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState(location.state?.restaurantData || null);
    const [loading, setLoading] = useState(true);
    const [menuVersion, setMenuVersion] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch menu version details
                const menuDetails = await fetchMenuDetails(menuVersionId);
                console.log("Fetched Menu Details:", menuDetails);
                setMenuVersion(menuDetails);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [menuVersionId, restaurant]);

    console.log("Current Menu Version:", menuVersion);

    if (loading) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
                <Card className="w-full max-w-6xl rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
                    <CardContent className="p-6 w-full flex justify-center items-center">
                        <Loader className="h-8 w-8 animate-spin text-gray-500" />
                    </CardContent>
                </Card>
            </main>
        );
    }

    if (!restaurant) {
        return <div className="text-red-600 flex items-center justify-center w-full min-h-screen font-bold text-2xl">No restaurant data available</div>;
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
            <Card className="w-full max-w-6xl rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
                <CardContent className="p-6 w-full">
                    <Link 
                        to={`/`} 
                        // state={{ restaurantData: restaurant }} 
                        className="flex items-center text-green-600 hover:text-green-800 mb-8 group"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" /> 
                        Back to Library
                    </Link>
                    <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-tight">
                        {restaurant.restaurant_name || restaurant.name}
                    </h1>
                    <p className="text-lg text-gray-600">{restaurant.location}</p>
                    
                    <p className="text-md text-gray-500">
                    {restaurant.schedule}
                    </p>
                    {restaurant.url && (
                        <a 
                            href={restaurant.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-green-600 hover:text-green-800"
                        >
                            Visit Website
                        </a>
                    )}

                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Menu:</h2>
                        <p className="text-gray-600 mb-4">
                            Last Updated: {formatDate(menuVersion.menu_version.creation_date)}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {
                                menuVersion.food_items && menuVersion.food_items.length > 0 ?
                                [...menuVersion.food_items].reverse().map((item) => (
                                    <Card key={item.food_id} className="hover:shadow-md transition-shadow rounded-xl">
                                        <CardContent className="p-4 flex gap-6 items-center justify-between">
                                            <h3 className="font-medium text-gray-800">{item.food_name}</h3>
                                            <p className="text-green-600 font-semibold">{item.food_price}€</p>
                                        </CardContent>
                                    </Card>
                                )) :
                                <Card className="hover:shadow-md transition-shadow rounded-xl">
                                    <CardContent className="p-4 flex gap-6 items-center justify-between">
                                        <p className="text-gray-600">Sorry - couldn't find data info here :(</p>
                                    </CardContent>
                                </Card>
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}