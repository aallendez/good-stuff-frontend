import { useEffect, useState } from 'react';
import { useParams, useLocation } from '@remix-run/react';
import { Card, CardContent } from "../components/ui/card";
import { Loader, ArrowLeft } from 'lucide-react';
import { Link } from '@remix-run/react';

const fetchRestaurantDetails = async (restaurantId) => {
    const endpoint = `http://127.0.0.1:8000/api/get-menus-restaurant/`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ restaurant_id: restaurantId }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching restaurant details:", error);
    }
};

export default function Restaurant() {
    const { restaurantId } = useParams();
    const location = useLocation();
    const initialData = location.state?.restaurantData;
    const [restaurant, setRestaurant] = useState(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [menuLoading, setMenuLoading] = useState(true);

    // Function to determine if the restaurant is open
    const isOpen = (schedule) => {
        const [openTime, closeTime] = schedule.split('-').map(time => {
            const [hours, minutes] = time.split(':').map(Number);
            return new Date().setHours(hours, minutes, 0, 0);
        });
        const now = new Date();
        return now >= openTime && now < closeTime;
    };

    useEffect(() => {
        const getRestaurantDetails = async () => {
            try {
                const details = await fetchRestaurantDetails(restaurantId);
                setRestaurant(prev => ({
                    ...prev,
                    ...details
                }));
                setMenuLoading(false);
            } catch (error) {
                console.error("Error fetching restaurant details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!restaurant?.menu_versions) {
            getRestaurantDetails();
        }
    }, [restaurantId, restaurant?.menu_versions]);

    if (loading || menuLoading) {
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
        return <div>No restaurant found</div>;
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
            <Card className="w-full max-w-6xl rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
                <CardContent className="p-6 w-full">
                    <Link to="/library" className="flex items-center text-green-600 hover:text-green-800 mb-8 group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" /> Back to Library
                    </Link>
                    <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-tight">
                        {restaurant.restaurant_name || restaurant.name}
                    </h1>
                    <h3 className={isOpen(restaurant.schedule) ? "text-green-600" : "text-red-600"}>
                        {isOpen(restaurant.schedule) ? "Currently Open" : "Currently Closed"}
                    </h3> 
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
                    
                    {restaurant.menu_versions && restaurant.menu_versions.length > 0 ? (
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-6">Menu Versions</h2>
                            <div className="space-y-4">
                                {restaurant.menu_versions.slice().map((version, index) => {
                                    const createdAt = new Date(version.created_at);
                                    const formattedDate = isNaN(createdAt) 
                                        ? 'Invalid Date' 
                                        : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(createdAt);
                                    return (
                                        <>
                                            {index === 1 ?
                                                <div>
                                                    <div className="h-[1px] w-full bg-black mb-2"></div>
                                                    <p className="text-gray-600">Latest Version</p>
                                                </div> : 
                                                ''
                                            }
                                            <Card key={version.menu_version_id} className="w-full hover:shadow-md rounded-xl transition-shadow duration-300 cursor-pointer p-2">
                                                <Link 
                                                    to={`/restaurant-menus/${version.menu_version_id}`} 
                                                    key={version.id} 
                                                    className="w-full flex flex-col "
                                                    state={{ restaurantData: restaurant }}>
                                                    <p className="font-medium hover:text-green-600">Version {restaurant.menu_versions.length - index}</p>
                                                    <p className="text-gray-600">Created: {version.creation_date.substring(0, 10)}</p>
                                                </Link>
                                            </Card>
                                        </>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <Card className="mt-8 font-semibold mb-4 w-full hover:shadow-md rounded-xl transition-shadow duration-300 cursor-pointer p-2 py-4">No versions found :(</Card>
                    )}
                </CardContent>
            </Card>
        </main>
    );
} 