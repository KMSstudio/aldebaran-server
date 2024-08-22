"use strict"

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl.output.home);

// Test
router.get("/test/order", (req, res) => { res.render("test/order"); });

// Session
router.post("/session/check", ctrl.session.checkSession)

// Wholesale user login
router.get("/wholesale/regist", ctrl.output.wholesale.regist);
router.post("/wholesale/regist", ctrl.wholesale.regist);

router.get("/wholesale/login", ctrl.output.wholesale.login);
router.post("/wholesale/login", ctrl.wholesale.login);

// Wholesale webpage
router.get("/wholesale/home", ctrl.process.wholesale.home);
router.get("/wholesale/prod", ctrl.process.wholesale.prod);

// Order
router.post("/order/push", ctrl.order.push);

// Product
router.post("/product/push", ctrl.product.push);
router.post("/product/reset", ctrl.product.reset);
router.post("/product/update/:id", ctrl.product.update);

// Public, static files
router.get("/file/product", ctrl.output.file.product);
router.get("/file/option", ctrl.output.file.option);

module.exports = router;