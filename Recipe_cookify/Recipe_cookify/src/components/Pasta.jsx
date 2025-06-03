import React, { useEffect, useState } from 'react';
import './Pasta.css'; // Import the CSS file
import { Link } from 'react-router-dom';

const Pasta = () => {
    const [pastaRecipes, setPastaRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getPastaRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            const check = localStorage.getItem('pastaRecipes'); // Unique local storage key

            if (check) {
                try {
                     const parsedData = JSON.parse(check);
                      // Assuming the stored data is an array of detailed recipes (like from Popular.jsx)
                     if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].idMeal) {
                         setPastaRecipes(parsedData);
                         setLoading(false);
                         return;
                     }
                } catch (parseError) {
                     console.error('Error parsing stored pasta recipes:', parseError);
                     localStorage.removeItem('pastaRecipes');
                }
            }

            let allBasicRecipes = [];
            const categoriesToFetch = ['Pasta', 'Vegetarian', 'Side']; // Categories to try fetching from

            for (const category of categoriesToFetch) {
                 let listResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);

                 if (listResponse.ok) {
                     let listData = await listResponse.json();
                     if (listData.meals && Array.isArray(listData.meals)) {
                         // For non-'Pasta' categories, filter by keyword
                         const categoryRecipes = category === 'Pasta' ? listData.meals : listData.meals.filter(meal => meal.strMeal.toLowerCase().includes('pasta'));
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
                 console.log('No pasta-like recipes found from any category.');
                 setPastaRecipes([]); // Set to empty array
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
                 throw new Error('Failed to fetch details for any pasta recipes.');
             }

            // Store fetched data in local storage
            localStorage.setItem('pastaRecipes', JSON.stringify(validDetailedRecipes));
            setPastaRecipes(validDetailedRecipes);

        } catch (err) {
            console.error('Error fetching pasta recipes:', err);
            setError(err.message || 'Failed to load pasta recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPastaRecipes();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading pasta recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong loading pasta recipes.</h3>
                    <p>{error}</p>
                    <button onClick={getPastaRecipes} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

     if (pastaRecipes.length === 0) {
        return ( // Render a message if no recipes are found after successful fetch
           <div className="error-container">
             <div className="error-message">
               <p>No pasta recipes available at the moment.</p>
             </div>
           </div>
         );
     }

    return (
        <div className="pasta-section"> {/* Main container class */}
            <h2>Pasta Recipes</h2>
            <div className="pasta-recipe-list"> {/* List container */}
                {pastaRecipes.map(recipe => (
                    <div key={recipe.idMeal} className="pasta-recipe-item"> {/* Individual item */}
                         <Link to={`/recipe/${recipe.idMeal}`}> {/* Link to recipe details */}
                             <div className="image-container"> {/* Image container for styling */}
                                 <img
                                     src={recipe.strMealThumb} // Image source from MealDB detailed object
                                     alt={recipe.strMeal} // Alt text from MealDB detailed object
                                     onError={(e) => {
                                         e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                                         e.target.src = 'https://via.placeholder.com/300x200?text=Pasta+Recipe'; // Placeholder on error
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

export default Pasta; 