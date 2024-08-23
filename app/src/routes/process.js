"use struct"

const Hash = require("../models/Hash");
const userSessions = require("../models/UserSessions");

const db_wholesale = require("../models/db-wholesale");
const db_retail = require("../models/db-retail");
const db_xcode = require("../models/db-xcode");
const db_order = require("../models/db-order");
const db_product = require("../models/db-product");
const db_option = require("../models/db-option");

const process = {
    // Wholesale mainpage and product page
    wholesale: {
        // Render the home.ejs file
        home: async (req, res) => {
            // Get session
            const session = req.cookies.session;
            const user = { id: 'none', code: '', name: '' };

            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'W');
                    if (result.success) { user.id = result.id; user.code = result.code; user.name = result.name; }
                } catch (error) { console.error('Session validation error:', error); }
            }
            if (user.id === 'none') { return res.status(401).render("wholesale/login", { message: "Please log in first." }); }

            // Get order
            const order = { orders: [], msg: '', success: true };
            const orderData = await db_order.WrequestOrder(user.code);
            if (orderData.success) {
                order.orders = orderData.orders.map(record => ({
                    retail: record.retailName,
                    product: record.content.map(item => `${item.name} ${item.cnt}`),
                    price: record.price,
                    date: record.date
                }));
            } else { 
                order.msg = `cannot request data: ${orderData.message}`;
                order.success = false;
            }

            // Render home.ejs
            res.render("wholesale/home", {
                user,
                order,
            });
        },
        
        // Render the prod.ejs file
        prod: async (req, res) => {
            // Get session
            const session = req.cookies.session;
            const user = { id: 'none', code: '', name: '' };

            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'W');
                    if (result.success) { user.id = result.id; user.code = result.code; user.name = result.name; }
                } catch (error) { console.error('Session validation error:', error); }
            }
            if (user.id === 'none') { return res.status(401).render("wholesale/login", { message: "Please log in first." }); }

            // Get products
            const productData = await db_product.requestProduct(user.code);
            const prod = { prods: [], msg: '', success: true};
            if (productData.success) {
                // refactoring
                prod.prods = productData.products.map(item => ({
                    code: item.code,
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    minCnt: item.minCnt,
                    unitCnt: item.unitCnt,
                    opt: item.opt
                }));
            } else {
                prod.msg = `cannot request data: ${productData.message}`
                prod.success = false;
            }

            // Render prod.ejs
            res.render("wholesale/prod", {
                user,
                prod,
            });
        },

        // Render the opt.ejs file
        opt: async (req, res) => {
            // Get session
            const session = req.cookies.session;
            const user = { id: 'none', code: '', name: '' };
            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'W');
                    if (result.success) { user.id = result.id; user.code = result.code; user.name = result.name; }
                } catch (error) { console.error('Session validation error:', error); }
            }
            if (user.id === 'none') { return res.status(401).render("wholesale/login", { message: "Please log in first." }); }

            // Get options
            const optionData = await db_option.requestOption(user.code);
            const opt = { opts: [], msg: '', success: true };
            if (optionData.success) {
                opt.opts = optionData.options.map(item => ({
                    id: item.id,
                    name: item.name,
                    minSelect: item.minSelect,
                    maxSelect: item.maxSelect,
                    content: item.content
                }));
            } else {
                opt.msg = `cannot request data: ${optionData.message}`;
                opt.success = false;
            }

            // Render opt.ejs
            res.render("wholesale/opt", {
                user,
                opt,
            });
        },
    }, // wholesale

    // Shop main page
    shop: {
        // Render main.ejs file
        main: async (req, res) => {
            const { xcode } = req.params;

            //Request code by xcode
            const codeData = await db_xcode.getXcode(xcode);
            if (!codeData.success){
                ///////////////////////////////////////// invalid xcode
                return res.redirect("/");
            }
            const code = codeData.code;

            // Request products by Wholesale code
            const prod = { prods: [], success: true, msg: '' }
            const productData = await db_product.requestProduct(code);
            if (!productData.success) {
                prod.success = false;
                prod.msg = `Fail to get product data: ${productData.message}`;
            } else { prod.prods = productData.products; }

            // Make options
            const optionData = await db_option.requestOption(code);
            if(!optionData.success) {
                prod.prods = prod.prods.map(prodItem => { return { ...prodItem, opt: [] }; })
                prod.success = false;
                prod.msg = `Fail to get option data: ${optionData.message}`;
            } else {
                // Create optionMap
                const optionMap = {};
                optionData.options.forEach(option => {
                    optionMap[option.id] = {
                        id: option.id,
                        name: option.name,
                        minSelect: option.minSelect,
                        maxSelect: option.maxSelect,
                        content: option.content
                    };
                });

                // Update prod.prods[].opt with optionMap
                prod.prods = prod.prods.map(prodItem => {
                    let optionDetails;
                    if (!prodItem.opt || (prodItem.opt.length === 0)) { optionDetails = []; }
                    else {
                        optionDetails = prodItem.opt
                            .map(optionId => optionMap[optionId])
                            .filter(opt => opt !== undefined);
                    }

                    return {
                        ...prodItem,
                        opt: optionDetails
                    };
                });
            }

            // Request wholesale data by code
            const wholesaleData = await db_wholesale.getUser(code);
            if (!wholesaleData.success || !wholesaleData.user) { return res.redirect("/"); }
            const wholesale = {
                id: wholesaleData.user.id,
                code: code,
                name: wholesaleData.user.name
            };

            // Retail values
            const session = req.cookies.session;
            let retail = { id: 'none', code: '', name: '' };

            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'R');
                    if (result.success) {
                        retail.id = result.id;
                        retail.code = result.code;
                        retail.name = result.name;
                        await db_retail.addShop(retail.id, Hash.hashString(wholesale.code), wholesale.name);
                    }
                } catch (error) { console.error('Session validation error:', error); }
            }
            
            // Render shop/main.ejs
            res.render("shop/main", {
                wholesale,
                retail,
                prod
            });
        }
    }, // shop

    // Retailer mainpage
    retail: {
        main: async (req, res) => {
            const session = req.cookies.session;
            let retail = { id: 'none', code: '', name: '' };

            // Get session
            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'R');
                    if (result.success) { retail = { code: result.code, id: result.id, name: result.name }; }
                    else { return res.status(401).render("retail/login", { message: "Please log in first." }); }
                } catch (error) {
                    console.error('Session validation error:', error);
                    return res.status(500).render("retail/login", { message: "Internal server error." });
                }
            } else { return res.status(401).render("retail/login", { message: "Please log in first." }); }

            // get retail info by getUser(code)
            const userData = await db_retail.getUser(retail.code);
            const conn = userData.user.connShop || [];

            // WrequestOrder(code)
            const orderData = await db_order.RrequestOrder(retail.code);
            const order = { orders: [], msg: '', success: true }
            if (orderData.success) {
                order.orders = orderData.orders.map(order => ({
                    wholesale: order.wholesaleName,
                    product: order.content.map(item => `${item.name} ${item.cnt}`),
                    price: order.price,
                    date: order.date,
                    status: order.status
                }));
            } else {
                order.msg = `Failed to load order data: ${orderData.message}`;
                order.success = false;
            }

            // Render retail/main
            res.render("retail/main", {
                retail,
                order,
                conn,
            });
        }
    }, //retail
}; // process

module.exports = process;