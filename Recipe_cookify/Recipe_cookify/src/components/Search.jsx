import './Search.css';
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Search = () => {

    const [input, setInput] = useState('');
    const navigate = useNavigate();

    const handleInput = (e) => { setInput(e.target.value) }
    const handleSubmit = (e) => { 
        e.preventDefault();
        if (input) {
          navigate('/searched/' + input);
        }
    }

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
                <FaSearch />
                <input 
                    type="text" 
                    className='search-field'
                    value={input}
                    onChange={handleInput}
                    placeholder="Search for recipes..."
                 />
                 <button type="submit" className="search-button">SEARCH</button>
            </form>
        </div>
    )
}

export default Search;