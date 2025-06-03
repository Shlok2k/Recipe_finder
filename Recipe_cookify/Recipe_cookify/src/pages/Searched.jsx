import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import './Searched.css';
import { Skeleton } from "@mui/material";

const Searched = () => {

    const [searchedRecipes, setSearchedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();

    const getSearched = async (name) => {
        try {
            setLoading(true);
            setError(null);
            setSearchedRecipes([]);

            // Fetch from TheMealDB using the search term
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
            
            if (!response.ok) {
                const errorBody = await response.text(); // Attempt to read the response body
                console.error('MealDB search fetch failed response:', response);
                console.error('MealDB search fetch failed body:', errorBody);
                throw new Error(`Failed to fetch recipes from MealDB: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.meals || data.meals.length === 0) {
                // No recipes found, but the fetch was successful
                setSearchedRecipes([]); // Ensure the list is empty
                setLoading(false);
                return;
            }
            
            // TheMealDB search endpoint returns meal objects directly
            setSearchedRecipes(data.meals);

        } catch (err) {
            console.error(`Error fetching searched recipes for \'${name}\':`, err);
            setError(err.message || 'Failed to load search results');
            setSearchedRecipes([]); // Clear recipes on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.search) {
            getSearched(params.search);
        }
    },[params.search]);

    if (loading) {
        const number = [1,2,3,4,5,6,7,8,9,10]; // Use placeholders while loading
        return (
        <div className="cuisine-skeleton">
        {
            number.map((data) => (
                <Skeleton 
                    variant="rounded"
                    width={300}
                    height={200}
                    animation='wave'
                    key={data}
                />))
        }
        </div> 
    )}

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={() => getSearched(params.search)} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (searchedRecipes.length === 0) {
        // Display a message when no recipes are found after loading
        return (
            <div className="error-container">
                <div className="error-message">
                    <p>No recipes found for "{params.search}".</p>
                </div>
            </div>
        );
    }

    return (
        <div className="searched-container">
            {searchedRecipes.map((data) => (
                <RecipeCard data={data} key={data.idMeal} isMealDB={true} />
            ))}
        </div>
    )
}

export default Searched;