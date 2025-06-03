import './Cuisine.css';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
// import { API_KEY } from '../assets/API_KEY'; // Not needed for MealDB
import { Skeleton } from '@mui/material';

const Cuisine = () => {

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();

    const getRecipes = async (type) => {
        try {
            setLoading(true);
            setError(null);

            // Special handling for Drinks
            if (type === 'Drinks') {
                const localStorageKey = 'cocktaildb_drinks';
                const check = localStorage.getItem(localStorageKey);

                if (check) {
                    try {
                        const parsedData = JSON.parse(check);
                        if (Array.isArray(parsedData) && parsedData.length > 0) {
                            setRecipes(parsedData);
                            setLoading(false);
                            return;
                        }
                    } catch (parseError) {
                        console.error('Error parsing stored drinks data:', parseError);
                        localStorage.removeItem(localStorageKey);
                    }
                }

                // Fetch from TheCocktailDB
                const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail');
                
                if (!response.ok) {
                    const errorBody = await response.text(); // Attempt to read the response body
                    console.error('CocktailDB fetch failed response:', response);
                    console.error('CocktailDB fetch failed body:', errorBody);
                    throw new Error(`Failed to fetch drinks from CocktailDB: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                if (!data.drinks || data.drinks.length === 0) {
                    throw new Error('No drinks found in the Cocktail category');
                }

                // Get detailed information for each drink
                const detailedDrinks = await Promise.all(
                    data.drinks.map(async (drink) => {
                        const detailResponse = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
                        if (!detailResponse.ok) return null;
                        const detailData = await detailResponse.json();
                        return detailData.drinks ? detailData.drinks[0] : null;
                    })
                );

                const validDetailedDrinks = detailedDrinks.filter(drink => drink !== null);

                if (validDetailedDrinks.length === 0) {
                    throw new Error('Failed to fetch drink details');
                }

                localStorage.setItem(localStorageKey, JSON.stringify(validDetailedDrinks));
                setRecipes(validDetailedDrinks);
                setLoading(false);
                return;
            }

            // Handle regular food recipes from TheMealDB
            const localStorageKey = `cuisine_${type}`;
            const check = localStorage.getItem(localStorageKey);

            if (check) {
                try {
                    const parsedData = JSON.parse(check);
                    if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].idMeal) {
                        setRecipes(parsedData);
                        setLoading(false);
                        return;
                    }
                } catch (parseError) {
                    console.error('Error parsing stored data:', parseError);
                    localStorage.removeItem(localStorageKey);
                }
            }

            let apiUrl;
            const mealdbAreas = ['Italian', 'American', 'Thai', 'Chinese', 'Canadian', 'British', 'French', 'Japanese', 'Mexican', 'Indian'];
            const isArea = mealdbAreas.includes(type);

            if (isArea) {
                apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${type}`;
            } else {
                apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${type}`;
            }

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch ${type} recipes from MealDB: ${response.status}`);
            }

            const data = await response.json();

            if (!data.meals || data.meals.length === 0) {
                throw new Error(`No recipes found for ${isArea ? 'area' : 'category'}: ${type}`);
            }

            const detailedMeals = await Promise.all(
                data.meals.map(async (meal) => {
                    const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                    if (!detailResponse.ok) return null;
                    const detailData = await detailResponse.json();
                    return detailData.meals ? detailData.meals[0] : null;
                })
            );

            const validDetailedMeals = detailedMeals.filter(meal => meal !== null);

            if (validDetailedMeals.length === 0) {
                throw new Error(`Failed to fetch details for ${type} recipes`);
            }

            localStorage.setItem(localStorageKey, JSON.stringify(validDetailedMeals));
            setRecipes(validDetailedMeals);

        } catch (err) {
            console.error(`Error fetching ${type} recipes:`, err);
            setError(err.message || 'Failed to load recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.type) {
            getRecipes(params.type);
        }
    }, [params.type]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading {params.type} recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={() => getRecipes(params.type)} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (recipes.length === 0) {
        return <div className="error-container"><div className="error-message"><p>No {params.type} recipes available at the moment.</p></div></div>;
    }

    return (
        <div className="cuisine-container">
            {/* Optional: Add a heading for the category */}
            {/* <h2>{params.type} Recipes</h2> */}
            {recipes.map((recipe) => (
                <RecipeCard 
                    data={recipe} 
                    key={params.type === 'Drinks' ? recipe.idDrink : recipe.idMeal} 
                    isMealDB={params.type !== 'Drinks'} 
                />
            ))}
        </div>
    );
};

export default Cuisine;