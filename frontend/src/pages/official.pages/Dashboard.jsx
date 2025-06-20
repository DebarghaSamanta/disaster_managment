import React from 'react'
import {useNavigate} from 'react-router-dom'
const Dashboard = () => {
    const navigate=useNavigate()
    const handleClick = ()=>{
        navigate('/prediction')
    }
    const handlelogin= ()=>{
      navigate('/register')
    }
  return (
    <div>
      <button onClick={handleClick}>Predict the suplies</button>
      <button onClick={handlelogin}>Register</button>
    </div>
  )
}

export default Dashboard
