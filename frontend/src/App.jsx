import './App.css'
import {BrowserRouter,Routes,Route } from "react-router-dom"
import Register from './pages/authpages/register'
import Login from './pages/authpages/login'
import Calculator from './pages/official.pages/Calculator'

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/prediction' element={<Calculator/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
