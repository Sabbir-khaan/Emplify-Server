const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

// MiddleWares
app.use(cors())
app.use(express.json())


app.get("/", (req,res)=>{
    res.send("Emplify Server is Running")
})

app.listen(port, ()=>{
    console.log(`Emplify Server is Running on ${port}`);
})
