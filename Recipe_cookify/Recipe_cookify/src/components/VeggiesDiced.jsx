import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './VeggiesDiced.css';

const VeggiesDiced = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getRecipes();
    }, []);

    const getRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check localStorage first
            const storedRecipes = localStorage.getItem('veggieRecipes');

            if (storedRecipes) {
                setRecipes(JSON.parse(storedRecipes));
                setLoading(false);
                return;
            }

            // Fetch vegetable recipes from TheMealDB
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Vegetarian');
            
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const data = await response.json();
            
            if (!data.meals) {
                throw new Error('No recipes found');
            }

            // Get detailed information for each meal
            const detailedMeals = await Promise.all(
                data.meals.slice(0, 12).map(async (meal) => {
                    const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    return detailData.meals ? detailData.meals[0] : null;
                })
            );

            // Filter out null results
            const validMeals = detailedMeals.filter(meal => meal !== null);

            // Store in localStorage
            localStorage.setItem('veggieRecipes', JSON.stringify(validMeals));
            setRecipes(validMeals);

        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading delicious recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={getRecipes} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="veggies-section">
            <h2>Vegetable Recipes</h2>
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
                {recipes.map((recipe) => (
                    <SplideSlide key={recipe.idMeal}>
                        <div className="recipe-card">
                            <Link to={`/recipe/${recipe.idMeal}`}>
                                <div className="image-container">
                                    <img 
                                        src={recipe.strMealThumb} 
                                        alt={recipe.strMeal}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image+Available';
                                        }}
                                    />
                                </div>
                                <h4>{recipe.strMeal}</h4>
                            </Link>
                        </div>
                    </SplideSlide>
                ))}
            </Splide>
        </div>
    );
};

export default VeggiesDiced; 