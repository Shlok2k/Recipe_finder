import React, { useEffect, useState } from 'react';
import './Salads.css'; // Import the CSS file
import { Link } from 'react-router-dom';

const Salads = () => {
    const [saladRecipes, setSaladRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getSaladRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            const check = localStorage.getItem('saladRecipes'); // Unique local storage key

            if (check) {
                try {
                     const parsedData = JSON.parse(check);
                      // Assuming the stored data is an array of detailed recipes (like from Popular.jsx)
                     if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].idMeal) {
                         setSaladRecipes(parsedData);
                         setLoading(false);
                         return;
                     }
                } catch (parseError) {
                     console.error('Error parsing stored salad recipes:', parseError);
                     localStorage.removeItem('saladRecipes');
                }
            }

            let allBasicRecipes = [];
            const categoriesToFetch = ['Salad', 'Vegetarian', 'Side']; // Categories to try fetching from

            for (const category of categoriesToFetch) {
                 let listResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);

                 if (listResponse.ok) {
                     let listData = await listResponse.json();
                     if (listData.meals && Array.isArray(listData.meals)) {
                         // For non-'Salad' categories, filter by keyword
                         const categoryRecipes = category === 'Salad' ? listData.meals : listData.meals.filter(meal => meal.strMeal.toLowerCase().includes('salad'));
                         allBasicRecipes = [...allBasicRecipes, ...categoryRecipes];
                     }
                 }
            }

             // Remove duplicates based on meal ID
             const uniqueRecipeIds = new Set();
             const finalBasicRecipes = [];
             for(const recipe of allBasicRecipes) {
                 if(!uniqueRecipeIds.has(recipe.idMeal)) {
                     uniqueRecipeIds.add(recipe.idMeal);
                     finalBasicRecipes.push(recipe);
                 }
             }

            if (finalBasicRecipes.length === 0) {
                 console.log('No salad-like recipes found from any category.');
                 setSaladRecipes([]); // Set to empty array
                 setLoading(false);
                 return; // Exit if no recipes found
            }

             // Limit the total number of recipes to avoid too many detail fetches
             const limitedBasicRecipes = finalBasicRecipes.slice(0, 20); // Limit to a reasonable number (e.g., 20)

            // Step 2: Fetch full details for each meal ID
            const detailedRecipes = await Promise.all(
                limitedBasicRecipes.map(async (recipe) => {
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

             if (validDetailedRecipes.length === 0 && limitedBasicRecipes.length > 0) { // Check if initial list had items but detail fetch failed for all
                 throw new Error('Failed to fetch details for any salad recipes.');
             }

            // Store fetched data in local storage
            localStorage.setItem('saladRecipes', JSON.stringify(validDetailedRecipes));
            setSaladRecipes(validDetailedRecipes);

        } catch (err) {
            console.error('Error fetching salad recipes:', err);
            setError(err.message || 'Failed to load salad recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSaladRecipes();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading salad recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong loading salad recipes.</h3>
                    <p>{error}</p>
                    <button onClick={getSaladRecipes} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

     if (saladRecipes.length === 0) {
        return ( // Render a message if no recipes are found after successful fetch
           <div className="error-container">
             <div className="error-message">
               <p>No salad recipes available at the moment.</p>
             </div>
           </div>
         );
     }

    return (
        <div className="salad-section"> {/* Main container class */}
            <h2>Salad Recipes</h2>
            <div className="salad-recipe-list"> {/* List container */}
                {saladRecipes.map(recipe => (
                    <div key={recipe.idMeal} className="salad-recipe-item"> {/* Individual item */}
                         <Link to={`/recipe/${recipe.idMeal}`}> {/* Link to recipe details */}
                             <div className="image-container"> {/* Image container for styling */}
                                 <img
                                     src={recipe.strMealThumb} // Image source from MealDB detailed object
                                     alt={recipe.strMeal} // Alt text from MealDB detailed object
                                     onError={(e) => {
                                         e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                                         e.target.src = 'https://via.placeholder.com/300x200?text=Salad+Recipe'; // Placeholder on error
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

export default Salads; 