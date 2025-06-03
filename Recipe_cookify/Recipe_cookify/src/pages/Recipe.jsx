import { useEffect, useState } from 'react';
import './Recipe.css';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';

const Recipe = () => {
    const [details, setDetails] = useState(null);
    const [active, setActive] = useState('summary');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();

    const fetchDetails = async (id) => {
        setLoading(true);
        setError(null);
        setDetails(null);

        // Try fetching from TheMealDB first
        try {
            const mealdbApi = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            if (mealdbApi.ok) {
                const mealdbData = await mealdbApi.json();
                if (mealdbData.meals && mealdbData.meals.length > 0) {
                    const meal = mealdbData.meals[0];
                    const mappedDetails = {
                        title: meal.strMeal,
                        image: meal.strMealThumb,
                        summary: `<p>Category: ${meal.strCategory}</p><p>Area: ${meal.strArea}</p><p>Tags: ${meal.strTags || 'None'}</p>`,
                        instructions: meal.strInstructions,
                        extendedIngredients: Object.keys(meal)
                            .filter(key => key.startsWith('strIngredient') && meal[key])
                            .map((key, index) => ({
                                id: index,
                                name: meal[key],
                                amount: meal[`strMeasure${key.slice(13)}`] || ''
                            })),
                        isMealDB: true
                    };
                    setDetails(mappedDetails);
                    setLoading(false);
                    return;
                }
            }
        } catch (mealdbError) {
            console.error('Error fetching from TheMealDB:', mealdbError);
        }

        // If MealDB fails, try TheCocktailDB
        try {
            const cocktailApi = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
            if (cocktailApi.ok) {
                const cocktailData = await cocktailApi.json();
                if (cocktailData.drinks && cocktailData.drinks.length > 0) {
                    const drink = cocktailData.drinks[0];
                    const mappedDetails = {
                        title: drink.strDrink,
                        image: drink.strDrinkThumb,
                        summary: `<p>Category: ${drink.strCategory}</p><p>Alcoholic: ${drink.strAlcoholic}</p><p>Glass: ${drink.strGlass}</p>`,
                        instructions: drink.strInstructions,
                        extendedIngredients: Object.keys(drink)
                            .filter(key => key.startsWith('strIngredient') && drink[key])
                            .map((key, index) => ({
                                id: index,
                                name: drink[key],
                                amount: drink[`strMeasure${key.slice(13)}`] || ''
                            })),
                        isMealDB: false
                    };
                    setDetails(mappedDetails);
                    setLoading(false);
                    return;
                }
            }
        } catch (cocktailError) {
            console.error('Error fetching from TheCocktailDB:', cocktailError);
            setError('Failed to load recipe details from both TheMealDB and TheCocktailDB');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.name) {
            fetchDetails(params.name);
        }
    }, [params.name]);

    const handleClick = (status) => {
        setActive(status);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading recipe details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={() => fetchDetails(params.name)} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!details) {
        return null;
    }

    return (
        <div className="recipe-container-main">
            <h1>{details.title}</h1>
            <div className="recipe-container">
                <div className="recipe-container-left">
                    <img src={details.image} className='recipe-imgs' alt={details.title}/>
                </div>
                <div className="recipe-container-right">
                    <div className="btn-container">
                        <Button
                            variant='contained'
                            onClick={() => handleClick('summary')}
                            disabled={active === 'summary'}
                        >
                            Summary
                        </Button>
                        <Button
                            variant='contained'
                            onClick={() => handleClick('ingredients')}
                            disabled={active === 'ingredients'}
                        >
                            Ingredients
                        </Button>
                        {details.instructions && (
                            <Button
                                variant='contained'
                                onClick={() => handleClick('steps')}
                                disabled={active === 'steps'}
                            >
                                Steps
                            </Button>
                        )}
                    </div>

                    <div className="recipe-right-main">
                        {active === 'summary' && (
                            <div className="summary">
                                <h2>Summary</h2>
                                <div dangerouslySetInnerHTML={{__html: details.summary}}></div>
                            </div>
                        )}

                        {active === 'ingredients' && (
                            <div className="ingredients-list">
                                <h2>Ingredients</h2>
                                {details.extendedIngredients && details.extendedIngredients.length > 0 ? (
                                    <ul>
                                        {details.extendedIngredients.map((ingredient) => (
                                            <li key={ingredient.id}>
                                                {ingredient.amount ? `${ingredient.amount} ${ingredient.name}` : ingredient.name}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Ingredients not available.</p>
                                )}
                            </div>
                        )}

                        {active === 'steps' && details.instructions && (
                            <div className="instructions">
                                <h2>Instructions</h2>
                                <p>{details.instructions}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recipe;