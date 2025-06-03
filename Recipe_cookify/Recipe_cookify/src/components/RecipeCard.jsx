import './RecipeCard.css';
import { Link } from 'react-router-dom';

const RecipeCard = ({data, isMealDB}) => {
    const handleImageError = (e) => {
        // Use a placeholder image if the original image fails to load
        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
        console.error('Error loading image for recipe:', isMealDB ? data.strMeal : data.strDrink || data.title);
    };

    // Determine the image source and link based on the API
    const imageUrl = isMealDB ? data.strMealThumb : (data.strDrinkThumb || data.image);
    const recipeId = isMealDB ? data.idMeal : (data.idDrink || data.id);
    const recipeLink = `recipe/${recipeId}`;
    const title = isMealDB ? data.strMeal : (data.strDrink || data.title);

    return (
        <Link to={recipeLink}>
            <div className="recipe-card-container">
                <img
                    src={imageUrl}
                    className='recipe-img'
                    onError={handleImageError}
                    alt={title}
                />
                <h2 className='recipe-p'>{title}</h2>
                <div className="recipe-gradient"></div>
            </div>
        </Link>
    )
}

export default RecipeCard;