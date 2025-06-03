import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
// import { API_KEY } from '../assets/API_KEY'; // Not needed for MealDB
import './Popular.css';

const Popular = () => {
    const [popular, setPopular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getPopular = async () => {
        try {
            setLoading(true);
            setError(null);

            const check = localStorage.getItem('popularMealDB'); // Changed local storage key

            if (check) {
                try {
                    const parsedData = JSON.parse(check);
                    // Check if data structure matches expected MealDB format
                    if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].idMeal) {
                         setPopular(parsedData);
                         setLoading(false);
                         return;
                    }
                } catch (parseError) {
                    console.error('Error parsing stored data:', parseError);
                    localStorage.removeItem('popularMealDB'); // Clear invalid data
                }
            }

            // Fetch a list of meals to get IDs (MealDB doesn't have a simple random list with details)
            // Using a common category like 'Dessert' or 'Vegetarian' and then fetching details.
            // Alternatively, fetch a list of all meals and pick random IDs.
            // For simplicity and to get a variety, let's fetch from a few categories and combine/shuffle.
            const categories = ['Dessert', 'Breakfast', 'Seafood', 'Vegetarian', 'Starter'];
            let allMeals = [];

            for (const category of categories) {
                 const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
                 if (response.ok) {
                     const data = await response.json();
                     if (data.meals) {
                         allMeals = [...allMeals, ...data.meals];
                     }
                 }
            }

            // Shuffle and pick a limited number of unique meals
            const shuffledMeals = allMeals.sort(() => 0.5 - Math.random());
            const uniqueMealIds = new Set();
            const mealsToFetchDetails = [];
            const limit = 20; // Number of popular recipes to show

            for (const meal of shuffledMeals) {
                 if (!uniqueMealIds.has(meal.idMeal)) {
                     uniqueMealIds.add(meal.idMeal);
                     mealsToFetchDetails.push(meal);
                     if (mealsToFetchDetails.length >= limit) break;
                 }
            }

            if (mealsToFetchDetails.length === 0) {
                throw new Error('No meals found from selected categories');
            }

             // Get detailed information for the selected meals
             const detailedMeals = await Promise.all(
                 mealsToFetchDetails.map(async (meal) => {
                     const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                     if (!detailResponse.ok) return null; // Handle failed detail fetches
                     const detailData = await detailResponse.json();
                     return detailData.meals ? detailData.meals[0] : null;
                 })
             );

             const validDetailedMeals = detailedMeals.filter(meal => meal !== null);

             if (validDetailedMeals.length === 0) {
                 throw new Error('Failed to fetch details for popular recipes');
             }

            localStorage.setItem('popularMealDB', JSON.stringify(validDetailedMeals));
            setPopular(validDetailedMeals);

        } catch (err) {
            console.error('Error fetching popular recipes from MealDB:', err);
            setError(err.message || 'Failed to load popular recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPopular();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading popular recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={getPopular} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

     // Render nothing or a placeholder if no popular recipes are available
     if (popular.length === 0) {
        return <div className="error-container"><div className="error-message"><p>No popular recipes available at the moment.</p></div></div>;
     }

    return (
        <div className="popular-section">
            <h2>Popular Recipes</h2>
            <Splide options={{
                perPage: 4,
                pagination: false,
                gap: '2rem',
                drag: true,
                snap: true,
                breakpoints: {
                    1024: {
                        perPage: 3,
                    },
                    768: {
                        perPage: 2,
                    },
                    480: {
                        perPage: 1,
                    }
                }
            }}>
                {popular.map((recipe) => (
                    <SplideSlide key={recipe.idMeal}> {/* Use idMeal for MealDB */}
                        <div className="recipe-card">
                            <Link to={`/recipe/${recipe.idMeal}`}> {/* Use idMeal for MealDB link */}
                                <div className="image-container">
                                    <img
                                        src={recipe.strMealThumb} // Use strMealThumb for MealDB
                                        alt={recipe.strMeal} // Use strMeal for MealDB alt text
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Popular+Recipe';
                                        }}
                                    />
                                </div>
                                <h4>{recipe.strMeal}</h4> {/* Use strMeal for MealDB title */}
                            </Link>
                        </div>
                    </SplideSlide>
                ))}
            </Splide>
        </div>
    );
};

export default Popular;