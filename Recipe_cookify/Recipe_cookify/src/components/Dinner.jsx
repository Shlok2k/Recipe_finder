import React, { useEffect, useState } from 'react';
import './/Dinner.css'; // Import the CSS file
import { Link } from 'react-router-dom'; // Assuming you'll link to recipe details

const Dinner = () => {
    const [dinnerRecipes, setDinnerRecipes] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state

    const getDinnerRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use a unique local storage key for dinner recipes
            const check = localStorage.getItem('dinnerRecipes');

            if (check) {
                // Assuming the stored data is an array of recipes
                try {
                    const parsedData = JSON.parse(check);
                    if (Array.isArray(parsedData)) {
                        setDinnerRecipes(parsedData);
                        setLoading(false);
                        return;
                    }
                } catch (parseError) {
                    console.error('Error parsing stored dinner recipes:', parseError);
                    localStorage.removeItem('dinnerRecipes'); // Clear invalid data
                }
            }

            // Replace with your actual API call and API key for DINNER recipes
            // Example fetch using a placeholder URL and parameters:
            const api = await fetch(
                `YOUR_API_BASE_URL/YOUR_DINNER_ENDPOINT?apiKey=YOUR_API_KEY&number=9` // Example: Adjust endpoint and parameters as needed
            );

            if (!api.ok) {
                throw new Error(`HTTP error! status: ${api.status}`);
            }

            const data = await api.json();

            // Adjust based on your API response structure. Assuming recipes are in data.results or data.meals
            const recipes = data.results || data.meals; // Try data.results first, then data.meals

            if (!recipes || !Array.isArray(recipes)) {
                throw new Error('API response format is not as expected.');
            }

            // Store fetched data in local storage
            localStorage.setItem('dinnerRecipes', JSON.stringify(recipes));
            setDinnerRecipes(recipes);

        } catch (err) {
            console.error('Error fetching dinner recipes:', err);
            setError(err.message || 'Failed to load dinner recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDinnerRecipes();
    }, []); // Empty dependency array means this effect runs once on mount

    // Conditional rendering based on state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading dinner recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong loading dinner recipes.</h3>
                    <p>{error}</p>
                    <button onClick={getDinnerRecipes} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Render nothing or a placeholder if no recipes are available after loading
    if (dinnerRecipes.length === 0) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <p>No dinner recipes available at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dinner-section">
            <h2>Dinner Recipes</h2>
            <div className="dinner-recipe-list"> {/* Apply CSS class */}
                {dinnerRecipes.map(recipe => (
                    // Assuming recipe objects have id, image/strMealThumb, and title/strMeal properties
                    <div key={recipe.id || recipe.idMeal} className="dinner-recipe-item"> {/* Use id or idMeal for key */}
                        <Link to={`/recipe/${recipe.id || recipe.idMeal}`}> {/* Link to recipe details page */}
                            <div className="image-container"> {/* Add a container for image for consistent styling */}
                                <img
                                    src={recipe.image || recipe.strMealThumb} // Use image or strMealThumb for source
                                    alt={recipe.title || recipe.strMeal} // Use title or strMeal for alt text
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                                        e.target.src = 'https://via.placeholder.com/300x200?text=Dinner+Recipe'; // Placeholder image on error
                                    }}
                                />
                            </div>
                            <h3>{recipe.title || recipe.strMeal}</h3> {/* Use title or strMeal for heading */}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dinner; 