import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Problems from './pages/Problems';

const App = () =>{
    return (
        <>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/problems' element={<Problems />} />
            </Routes>
        </>
    )
    
}

export default App;