import Home from "./Home";
import { Routes, Route } from 'react-router-dom';
import Cuisine from "./Cuisine";
import Category from "../components/Category";
import Search from "../components/Search";
import Searched from "./Searched";
import Recipe from "./Recipe";
import Login from "./Login";
import Signup from "./Signup";
import Pasta from '../components/Pasta';

const Pages = () => {
    return (
            <div className="pages-container">
                <Routes>
                    <Route path="/" element={[<Search />, <Category />, <Home />]}></Route>
                    <Route path="/recipes" element={<div>Recipes Page Placeholder</div>}></Route>
                    <Route path="/cuisine/:type" element={[<Search />, <Category />, <Cuisine />]}></Route>
                    <Route path="/searched/:search" element={[<Search />, <Category />, <Searched />]}></Route>
                    <Route path="/searched/:search/recipe/:name" element={<Recipe />}></Route>
                    <Route path="/cuisine/:type/recipe/:name" element={<Recipe />}></Route>
                    <Route path="recipe/:name" element={<Recipe />}></Route>
                    <Route path="/pasta" element={<Pasta />} />
                    <Route path="/login" element={<Login />}></Route>
                    <Route path="/signup" element={<Signup />}></Route>
                </Routes>
            </div>
    )
}

export default Pages;