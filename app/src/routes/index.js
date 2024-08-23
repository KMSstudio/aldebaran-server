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
router.get("/wholesale/opt", ctrl.process.wholesale.opt);

// Public, static files
router.get("/file/product", ctrl.output.file.product);
router.get("/file/option", ctrl.output.file.option);
router.get("/file/shopqr", ctrl.api.file.shopqr);

//  =====================================  //
//              retail utility             //
//  =====================================  //

// Retail user login
router.get("/retail/regist", ctrl.output.retail.regist);
router.post("/retail/regist", ctrl.api.retail.regist);

router.get("/retail/login", ctrl.output.retail.login);
router.post("/retail/login", ctrl.api.retail.login);

// Retail webpage
router.get("/retail/main", ctrl.process.retail.main);

//  ===================================  //
//              shop utility             //
//  ===================================  //

// Shop webpage
router.get("/shop/:xcode", ctrl.process.shop.main);

// Order
router.post("/order/push", ctrl.api.order.push);

// Product
router.post("/product/push", ctrl.api.product.push);
router.post("/product/reset", ctrl.api.product.reset);
router.post("/product/update/:id", ctrl.api.product.update);

// Option
router.post("/option/push", ctrl.api.option.push);
router.post("/option/reset", ctrl.api.option.reset);
router.post("/option/update/:id", ctrl.api.option.update);


module.exports = router;