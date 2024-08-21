"use strict"
//dotenv
require('dotenv').config();

//module
const express = require("express");
const ws = require("ws");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

//routing
const home = require("./src/routes");
const urlencoded = require("body-parser/lib/types/urlencoded");

//app setting
app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use(express.static(`${__dirname}/src/public`));

app.use("/", home); //use -> method that regist middle ware

module.exports = app;