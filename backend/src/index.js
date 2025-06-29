import dotenv, { config } from "dotenv"
import { startServer } from "./server.js"

dotenv.config({
    path: "./.env"
})
/*
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongDb server faiked to connect!!!");
})*/
startServer()