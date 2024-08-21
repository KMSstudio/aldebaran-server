"use strict"

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl.output.home);

// Test
router.get("/test/order", (req, res) => { res.render("test/order"); });

// Session
router.post("/session/check", ctrl.session.checkSession)

// Wholesale
router.get("/wholesale/regist", ctrl.output.wholesale.regist);
router.post("/wholesale/regist", ctrl.wholesale.regist);

router.get("/wholesale/login", ctrl.output.wholesale.login);
router.post("/wholesale/login", ctrl.wholesale.login);

router.get("/wholesale/home", ctrl.process.wholesale.home);

// Order
router.post("/order/push", ctrl.order.push);

// Product


module.exports = router;