import { 
    FaPizzaSlice, 
    FaHamburger, 
    FaSeedling, 
    FaFish, 
    FaDrumstickBite
} from 'react-icons/fa';
import { 
    GiNoodles, 
    GiChopsticks, 
    GiSlicedBread,
    GiCakeSlice,
    GiIndianPalace,
    GiTacos
} from 'react-icons/gi';
import { NavLink } from 'react-router-dom';
import './Category.css'

const Category = () => {
    return (
        <div className="category-container">
            <NavLink to={'/cuisine/Italian'}>
                <FaPizzaSlice />
                <span>Italian</span>
            </NavLink>
            <NavLink to={'/cuisine/American'}>
                <FaHamburger />
                <span>American</span>
            </NavLink>
            <NavLink to={'/cuisine/Indian'}>
                <GiIndianPalace />
                <span>Indian</span>
            </NavLink>
            <NavLink to={'/cuisine/Chinese'}>
                <GiChopsticks />
                <span>Chinese</span>
            </NavLink>
            <NavLink to={'/cuisine/Japanese'}>
                <GiNoodles />
                <span>Japanese</span>
            </NavLink>
            <NavLink to={'/cuisine/Mexican'}>
                <GiTacos />
                <span>Mexican</span>
            </NavLink>
            <NavLink to={'/cuisine/Vegetarian'}>
                <FaSeedling />
                <span>Veg</span>
            </NavLink>
            <NavLink to={'/cuisine/Chicken'}>
                <FaDrumstickBite />
                <span>Chicken</span>
            </NavLink>
            <NavLink to={'/cuisine/Seafood'}>
                <FaFish />
                <span>Seafood</span>
            </NavLink>
            <NavLink to={'/cuisine/Dessert'}>
                <GiCakeSlice />
                <span>Dessert</span>
            </NavLink>
            <NavLink to={'/cuisine/Breakfast'}>
                <GiSlicedBread />
                <span>Breakfast</span>
            </NavLink>
        </div>
    )
}

export default Category;