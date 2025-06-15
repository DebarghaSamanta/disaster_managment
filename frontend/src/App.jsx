import './App.css'
import {BrowserRouter,Routes,Route } from "react-router-dom"
import Register from './pages/authpages/register'
import Login from './pages/authpages/login'

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
