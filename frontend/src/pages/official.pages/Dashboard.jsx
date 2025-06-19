import React from 'react'
import {useNavigate} from 'react-router-dom'
const Dashboard = () => {
    const navigate=useNavigate()
    const handleClick = ()=>{
        navigate('/prediction')
    }
    
  return (
    <div>
      <button onClick={handleClick}>Predict the suplies</button>
      
    </div>
  )
}

export default Dashboard
