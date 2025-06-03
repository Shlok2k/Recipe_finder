import './App.css'
import { BrowserRouter as Router } from 'react-router-dom';
import Pages from './pages/Pages';
import Header from './components/Header';

function App() {
  return (
    <Router>
    <div className="app-container"> 
        <Header />
      <Pages />
    </div>
    </Router>
  )
}

export default App
