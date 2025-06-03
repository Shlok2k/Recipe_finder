import Popular from "../components/Popular";
import Dessert from "../components/Dessert";
import QuickEasy from "../components/QuickEasy";
import Healthy from "../components/Healthy";
import Breakfast from "../components/Breakfast";
import Lunch from "../components/Lunch";
import VeggiesDiced from "../components/VeggiesDiced";
import Drinks from "../components/Drinks";
import Cuisine from "./Cuisine";
import Dinner from "../components/Dinner";
import Soups from "../components/Soups";
import Salads from "../components/Salads";
import Pasta from "../components/Pasta";
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <Popular />
            <Dessert />
            <QuickEasy />
            <Healthy />
            <Breakfast />
            <Lunch />
            <VeggiesDiced />
            <Drinks />
            <Dinner />
            <Soups />
            <Salads />
            <Pasta />
        </div>
    )
}

export default Home;