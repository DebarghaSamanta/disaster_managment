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
    const handlewarehouse= ()=>{
      navigate('/warehouse-dashboard')
    }
    const handlenews= ()=>{
      navigate('/news')
    }
  return (
    <div>
      <button onClick={handleClick}>Predict the suplies</button>
      <button onClick={handlelogin}>Register</button>
      <button onClick={handlewarehouse}>Warehouse Dashboard</button>
      <button onClick={handlenews}>News</button>
    </div>
  )
}

export default Dashboard
