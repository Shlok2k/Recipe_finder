import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './QuickEasy.css';

const QuickEasy = () => {
    const [quickEasy, setQuickEasy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getQuickEasy = async () => {
        try {
            setLoading(true);
            setError(null);

            const check = localStorage.getItem('quickEasy');

            if (check) {
                try {
                    const parsedData = JSON.parse(check);
                    if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].idMeal) {
                        setQuickEasy(parsedData);
                        setLoading(false);
                        return;
                    }
                } catch (parseError) {
                    console.error('Error parsing stored data:', parseError);
                    localStorage.removeItem('quickEasy');
                }
            }

            const api = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Side');

            if (!api.ok) {
                throw new Error(`Failed to fetch quick easy recipes: ${api.status}`);
            }

            const data = await api.json();

            if (!data.meals || data.meals.length === 0) {
                throw new Error('No recipes found for quick easy');
            }

            const detailedMeals = await Promise.all(
                data.meals.slice(0, 12).map(async (meal) => {
                    const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    return detailData.meals ? detailData.meals[0] : null;
                })
            );

            const validDetailedMeals = detailedMeals.filter(meal => meal !== null);

            localStorage.setItem('quickEasy', JSON.stringify(validDetailedMeals));
            setQuickEasy(validDetailedMeals);

        } catch (err) {
            console.error('Error fetching quick easy recipes:', err);
            setError(err.message || 'Failed to load recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getQuickEasy();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading quick & easy recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={getQuickEasy} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quick-easy-section">
            <h2>Quick & Easy</h2>
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
                {quickEasy.map((meal) => (
                    <SplideSlide key={meal.idMeal}>
                        <div className="recipe-card">
                            <Link to={`/recipe/${meal.idMeal}`}>
                                <div className="image-container">
                                    <img 
                                        src={meal.strMealThumb} 
                                        alt={meal.strMeal}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Quick+Recipe';
                                        }}
                                    />
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

export default QuickEasy; 