import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import './Drinks.css';

const Drinks = () => {
    const [drinks, setDrinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getDrinks();
    }, []);

    const getDrinks = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check localStorage first
            const localStorageKey = 'cocktaildb-drinks-detailed';
            const storedDrinks = localStorage.getItem(localStorageKey);

            if (storedDrinks) {
                setDrinks(JSON.parse(storedDrinks));
                setLoading(false);
                return;
            }

            // First, get the list of drinks
            const listResponse = await fetch('https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail');
            
            if (!listResponse.ok) {
                throw new Error('Failed to fetch drinks list from CocktailDB');
            }

            const listData = await listResponse.json();
            
            if (!listData.drinks || listData.drinks.length === 0) {
                throw new Error('No drinks found in the Cocktail category');
            }

            // Get detailed information for each drink
            const detailedDrinks = await Promise.all(
                listData.drinks.slice(0, 12).map(async (drink) => {
                    const detailResponse = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
                    const detailData = await detailResponse.json();
                    return detailData.drinks[0];
                })
            );

            // Store in localStorage
            localStorage.setItem(localStorageKey, JSON.stringify(detailedDrinks));
            setDrinks(detailedDrinks);

        } catch (err) {
            console.error('Error fetching drinks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading refreshing drinks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={getDrinks} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="drinks-section">
            <h2>Refreshing Drinks</h2>
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
                {drinks.map((drink) => (
                    <SplideSlide key={drink.idDrink}>
                        <div className="drink-card">
                            <Link to={`/recipe/${drink.idDrink}`}>
                                <div className="image-container">
                                    <img 
                                        src={drink.strDrinkThumb} 
                                        alt={drink.strDrink}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Refreshing+Drink';
                                        }}
                                    />
                                </div>
                                <h4>{drink.strDrink}</h4>
                                <p className="drink-category">{drink.strCategory}</p>
                            </Link>
                        </div>
                    </SplideSlide>
                ))}
            </Splide>
        </div>
    );
};

export default Drinks; 