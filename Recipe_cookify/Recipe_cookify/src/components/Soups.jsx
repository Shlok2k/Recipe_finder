import React, { useEffect, useState } from 'react';
import './Soups.css'; // Import the CSS file
import { Link } from 'react-router-dom';

const Soups = () => {
    const [soupRecipes, setSoupRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getSoupRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            const check = localStorage.getItem('soupRecipes'); // Unique local storage key

            if (check) {
                try {
                     const parsedData = JSON.parse(check);
                     if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].idMeal) {
                         setSoupRecipes(parsedData);
                         setLoading(false);
                         return;
                     }
                } catch (parseError) {
                     console.error('Error parsing stored soup recipes:', parseError);
                     localStorage.removeItem('soupRecipes');
                }
            }

            let basicRecipes = [];
            let category = 'Soup'; // Try Soup category first

            // Attempt to fetch from the primary category
            let listResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);

            if (listResponse.ok) {
                let listData = await listResponse.json();
                if (listData.meals && Array.isArray(listData.meals)) {
                    basicRecipes = listData.meals;
                }
            }

            // Fallback mechanism if primary category is empty or fails
            if (basicRecipes.length === 0) {
                console.log(`No recipes found in ${category} category, falling back.`);
                // Fallback: Fetch from a more general category and filter
                let fallbackCategory = 'Vegetarian'; // Example fallback category
                listResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${fallbackCategory}`);

                if (listResponse.ok) {
                    let listData = await listResponse.json();
                    if (listData.meals && Array.isArray(listData.meals)) {
                         // Filter fallback recipes by keyword (e.g., 'Soup')
                         basicRecipes = listData.meals.filter(meal => meal.strMeal.toLowerCase().includes('soup'));
                         // Limit the number of fallback recipes to avoid too many detail fetches
                         basicRecipes = basicRecipes.slice(0, 10); // Limit to 10 fallback recipes
                    }
                }
            }

            if (basicRecipes.length === 0) {
                 // If still no recipes after fallback
                 console.log('No soup recipes found even with fallback.');
                 setSoupRecipes([]); // Set to empty array
                 setLoading(false);
                 return; // Exit if no recipes found
            }

            // Step 2: Fetch full details for each meal ID
            const detailedRecipes = await Promise.all(
                basicRecipes.map(async (recipe) => {
                    const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`);
                     if (!detailResponse.ok) { // Handle failed detail fetches gracefully
                         console.error(`Failed to fetch details for meal ID ${recipe.idMeal}: status ${detailResponse.status}`);
                         return null;
                     }
                    const detailData = await detailResponse.json();
                    return detailData.meals ? detailData.meals[0] : null; // Get the detailed meal object
                })
            );

            // Filter out any failed detail fetches
            const validDetailedRecipes = detailedRecipes.filter(recipe => recipe !== null);

             if (validDetailedRecipes.length === 0 && basicRecipes.length > 0) { // Check if initial list had items but detail fetch failed for all
                 throw new Error('Failed to fetch details for any soup recipes.');
             }

            // Store fetched data in local storage
            localStorage.setItem('soupRecipes', JSON.stringify(validDetailedRecipes));
            setSoupRecipes(validDetailedRecipes);

        } catch (err) {
            console.error('Error fetching soup recipes:', err);
            setError(err.message || 'Failed to load soup recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSoupRecipes();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading soup recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong loading soup recipes.</h3>
                    <p>{error}</p>
                    <button onClick={getSoupRecipes} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

     if (soupRecipes.length === 0) {
        return ( // Render a message if no recipes are found after successful fetch
           <div className="error-container">
             <div className="error-message">
               <p>No soup recipes available at the moment.</p>
             </div>
           </div>
         );
     }

    return (
        <div className="soup-section"> {/* Main container class */}
            <h2>Soup Recipes</h2>
            <div className="soup-recipe-list"> {/* List container */}
                {soupRecipes.map(recipe => (
                    <div key={recipe.idMeal} className="soup-recipe-item"> {/* Individual item */}
                         <Link to={`/recipe/${recipe.idMeal}`}> {/* Link to recipe details */}
                             <div className="image-container"> {/* Image container for styling */}
                                 <img
                                     src={recipe.strMealThumb} // Image source from MealDB detailed object
                                     alt={recipe.strMeal} // Alt text from MealDB detailed object
                                     onError={(e) => {
                                         e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                                         e.target.src = 'https://via.placeholder.com/300x200?text=Soup+Recipe'; // Placeholder on error
                                     }}
                                 />
                             </div>
                             <h3>{recipe.strMeal}</h3> {/* Title from MealDB detailed object */}
                         </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Soups; 