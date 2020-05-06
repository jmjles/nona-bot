require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT
const botRoute = require('./routes/bot')
app.get('/',(req,res)=>res.send("Welcome to my Bot's page"))
app.use('/nona',botRoute)

app.listen(PORT,()=>console.log(`Server running on port: ${PORT}`))