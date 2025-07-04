import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/authpages/register';
import Login from './pages/authpages/login';
import Calculator from './pages/official.pages/Calculator';
import Dashboard from './pages/official.pages/Dashboard';
import ChatbotWidget from './components/CHatbotWidget';
import Newspage from './pages/newspage'; 
import WarehouseDashboard from './pages/official.pages/Warehousedashboard';

function App() {
  return (
    <>
      <BrowserRouter>
        {/* Chatbot Widget - always visible */}
        <ChatbotWidget /> 

        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/prediction' element={<Calculator />} />
          <Route path='/warehouse-dashboard' element={<WarehouseDashboard/>} />
          <Route path='/news' element={<Newspage />} /> {/* ✅ News page route */}


          <Route path='/transport' element={<div>Transport Page</div>} />
          <Route path='/routes' element={<div>Routes Page</div>} />
          <Route path='/analytics' element={<div>Analytics Page</div>} />
          <Route path='/alert' element={<div>Alerts Page</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
