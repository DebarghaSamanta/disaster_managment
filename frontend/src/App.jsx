import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/authpages/register';
import Login from './pages/authpages/login';
import Calculator from './pages/official.pages/Calculator';
import Dashboard from './pages/official.pages/dashboard';
import ChatbotWidget from './components/CHatbotWidget';
import Newspage from './pages/newspage'; 

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
          <Route path='/news' element={<Newspage />} /> {/* ✅ News page route */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
