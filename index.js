const express = require("express");
const app = express();
require('dotenv').config();
const jwt=require("jsonwebtoken")
const cors=require("cors");
app.use(cors());
app.use(express.json());
const mainRouter=require("./routes/index");


const port= process.env.PORT;

app.use("/api/v1", mainRouter)

app.listen(5000);
//module.exports=app;