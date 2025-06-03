import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './Breakfast.css';

const Breakfast = () => {
    const [breakfast, setBreakfast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getBreakfast = async () => {
        try {
            setLoading(true);
            const check = localStorage.getItem('breakfast');

            if (check) {
                try {
                    const parsedData = JSON.parse(check);
                    if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].idMeal) {
                        setBreakfast(parsedData);
                        setLoading(false);
                        return;
                    }
                } catch (parseError) {
                    console.error('Error parsing stored data:', parseError);
                    localStorage.removeItem('breakfast');
                }
            }

            const api = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Breakfast');

            if (!api.ok) {
                throw new Error(`Failed to fetch breakfast recipes: ${api.status}`);
            }

            const data = await api.json();

            if (!data.meals || data.meals.length === 0) {
                throw new Error('No recipes found for breakfast');
            }

            const detailedMeals = await Promise.all(
                data.meals.slice(0, 20).map(async (meal) => {
                    const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    return detailData.meals ? detailData.meals[0] : null;
                })
            );

            const validDetailedMeals = detailedMeals.filter(meal => meal !== null);
            localStorage.setItem('breakfast', JSON.stringify(validDetailedMeals));
            setBreakfast(validDetailedMeals);

        } catch (err) {
            console.error('Error fetching breakfast recipes:', err);
            setError(err.message || 'Failed to load recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBreakfast();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading breakfast recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button className="retry-button" onClick={getBreakfast}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="breakfast-section">
            <h2>Breakfast Delights</h2>
            <Splide options={{
                perPage: 4,
                pagination: false,
                gap: '2rem',
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
                {breakfast.map((meal) => (
                    <SplideSlide key={meal.idMeal}>
                        <div className="recipe-card">
                            <Link to={`/recipe/${meal.idMeal}`}>
                                <div className="image-container">
                                    <img src={meal.strMealThumb} alt={meal.strMeal} />
                                </div>
                                <h4>{meal.strMeal}</h4>
                            </Link>
                        </div>
                    </SplideSlide>
                ))}
            </Splide>
        </div>
    );
};

export default Breakfast; 