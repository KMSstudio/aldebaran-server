"use strict"

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl.output.home);

// Test
router.get("/test/order", (req, res) => { res.render("test/order"); });

// Session
router.post("/session/check", ctrl.api.session.checkSession)

//  ========================================  //
//              wholesale utility             //
//  ========================================  //

// Wholesale user login
router.get("/wholesale/regist", ctrl.output.wholesale.regist);
router.post("/wholesale/regist", ctrl.api.wholesale.regist);

router.get("/wholesale/login", ctrl.output.wholesale.login);
router.post("/wholesale/login", ctrl.api.wholesale.login);

// Wholesale webpage
router.get("/wholesale/home", ctrl.process.wholesale.home);
router.get("/wholesale/prod", ctrl.process.wholesale.prod);

// Product
router.post("/product/push", ctrl.api.product.push);
router.post("/product/reset", ctrl.api.product.reset);
router.post("/product/update/:id", ctrl.api.product.update);

// Public, static files
router.get("/file/product", ctrl.output.file.product);
router.get("/file/option", ctrl.output.file.option);
router.get("/file/shopqr", ctrl.api.file.shopqr);

// Order
router.post("/order/push", ctrl.api.order.push);

//  =====================================  //
//              retail utility             //
//  =====================================  //

// Shop webpage
router.get("/shop/:code", ctrl.process.shop.main);

module.exports = router;