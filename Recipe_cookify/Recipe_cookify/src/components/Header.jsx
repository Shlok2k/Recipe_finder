import './Header.css';
import { GiSpoon } from 'react-icons/gi';
import { BiSolidUserCircle } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
    const [showAuthLinks, setShowAuthLinks] = useState(false);

    const toggleAuthLinks = () => {
        setShowAuthLinks(!showAuthLinks);
    };

    return (
        <div className="header-container">
            <div className="logo-container">
            <Link to={'/'}>
                <h1>
                        RecipeHub
                        <GiSpoon className="spoon-icon" />
                </h1>
            </Link>
            </div>

            <div className="header-right">
                <BiSolidUserCircle className='user-img' onClick={toggleAuthLinks} />
                {showAuthLinks && (
                    <div className="auth-dropdown">
                        <Link to="/login" onClick={() => setShowAuthLinks(false)}>Login</Link>
                        <Link to="/signup" onClick={() => setShowAuthLinks(false)}>Sign Up</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;