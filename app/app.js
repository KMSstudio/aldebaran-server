"use strict"
//dotenv
require('dotenv').config();

//module
const express = require("express");
const logger = require('./logger');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// app
const app = express();

// route to
const home = require("./src/routes");

// app setting
app.set("views", "./src/views");
app.set("view engine", "ejs");

// use middle ware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(`${__dirname}/src/public`));
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
app.use("/", home);

module.exports = app;