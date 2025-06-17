import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())


import calculatorRouter from "./routes/calculator.routes.js"
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users", userRouter)
app.use("/api/v1/calculator", calculatorRouter)

export {app}