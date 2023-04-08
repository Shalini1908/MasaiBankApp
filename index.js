const express = require("express")
const {connection} = require("./db")
const {accountRouter} = require("./routes/account.routes")

const {Auth} = require("./middleware/Auth.middleware")
require("dotenv").config()
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
res.send("Welcome to Masai Bank")    
})


app.use("/account",accountRouter)
app.use(Auth)


app.listen(process.env.port,async(req,res)=>{

try{

await connection
console.log("Connected to DB")

}
catch(err){
console.log(err)

}
console.log("Server is ruuning on port 8080")
})