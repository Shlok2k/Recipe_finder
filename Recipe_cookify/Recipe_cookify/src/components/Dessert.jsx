import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './Dessert.css';

const Dessert = () => {
    const [dessert, setDessert] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getDessert = async () => { 
        try {
            setLoading(true);
            setError(null);

            const check = localStorage.getItem('dessert');
            
            if(check) {
                try {
                    const parsedData = JSON.parse(check);
                    if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].idMeal) {
                        setDessert(parsedData);
                        setLoading(false);
                        return;
                    }
                } catch (parseError) {
                    console.error('Error parsing stored data:', parseError);
                    localStorage.removeItem('dessert');
                }
            }

            const api = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert');

            if (!api.ok) {
                throw new Error(`Failed to fetch dessert recipes: ${api.status}`);
            }

            const data = await api.json();
            
            if (!data.meals || data.meals.length === 0) {
                throw new Error('No recipes found for dessert');
            }

            const detailedMeals = await Promise.all(
                data.meals.slice(0, 12).map(async (meal) => {
                    const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    return detailData.meals ? detailData.meals[0] : null;
                })
            );

            const validDetailedMeals = detailedMeals.filter(meal => meal !== null);

            localStorage.setItem('dessert', JSON.stringify(validDetailedMeals));
            setDessert(validDetailedMeals);

        } catch (err) {
            console.error('Error fetching dessert recipes:', err);
            setError(err.message || 'Failed to load recipes');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getDessert();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading sweet treats...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={getDessert} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dessert-section">
            <h2>Sweet Treats</h2>
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
                {dessert.map((meal) => (
                    <SplideSlide key={meal.idMeal}>
                        <div className="recipe-card">
                            <Link to={`/recipe/${meal.idMeal}`}>
                                <div className="image-container">
                                    <img 
                                        src={meal.strMealThumb} 
                                        alt={meal.strMeal}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Sweet+Treat';
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

export default Dessert; 