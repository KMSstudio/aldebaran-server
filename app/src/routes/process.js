"use struct"

const userSessions = require("../models/UserSessions");

const db_wholesale = require("../models/db-wholesale");
const db_order = require("../models/db-order");
const db_product = require("../models/db-product");

const process = {
    // Wholesale mainpage and product page
    wholesale: {
        // Render the home.ejs file
        home: async (req, res) => {
            // Get session
            const session = req.cookies.session;
            let id = 'none';
            let code = '0000';

            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'W');
                    if (result.success) { id = result.id; code = result.code; }
                } catch (error) { console.error('Session validation error:', error); }
            }
            const user = { id, code };

            // Get order
            const order = { orders: [], msg: '', success: true };
            if (id !== 'none') {
                try {
                    const orderData = await db_order.WrequestOrder(code);
                    if (orderData.success) {
                        order.orders = orderData.orders.map(record => ({
                            customer: record.retailName,
                            product: record.content.map(item => `${item.name} ${item.cnt}`),
                            price: record.price,
                            date: record.date
                        }));
                    } else { 
                        order.msg = `cannot request data: ${orderData.message}`;
                        order.success = false;
                    }
                } catch (error) {
                    console.error('Order retrieval error:', error);
                    order.msg = 'cannot request data: Server error';
                    order.success = false;
                }
            } else { 
                order.msg = 'User session is invalid or expired.';
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
            let id = 'none';
            let code = '';

            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'W');
                    if (result.success) { id = result.id; code = result.code; }
                } catch (error) { console.error('Session validation error:', error); }
            }
            if (id === 'none') { return res.status(401).render("wholesale/login", { message: "Please log in first." }); }
            const user = { id, code };

            // Get products
            const productData = await db_product.requestProduct(code);
            const prod = { prods: [], msg: '', success: true};
            try {
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
            } catch (error) {
                console.error('Product retrieval error:', error);
                prod.msg = 'cannot request data: Server error';
                prod.success = false;
            }
            // Render prod.ejs
            res.render("wholesale/prod", {
                user,
                prod,
            });
        },

    }, // wholesale

    // Shop main page
    shop: {
        // Render main.ejs file
        main: async (req, res) => {
            const { code } = req.params;
            // Request products by Wholesale code
            const prod = { prods: [], success: true, msg: '' }
            const productData = await db_product.requestProduct(code);
            if (!productData.success) {
                prod.success = false;
                prod.msg = `Fail to get product data: ${productData.message}`;
            }

            // Make prod.prods data (item: [])
            prod.prods = productData.products.map(item => ({
                ...item,
                opt: [] // Hardcoding opt values to an empty array
            }));

            // Request wholesale data by code
            const wholesaleData = await db_wholesale.getUser(code);
            if (!wholesaleData.success || !wholesaleData.user) { return res.redirect("/"); }
            const wholesale = {
                id: wholesaleData.user.id,
                code: code,
                name: wholesaleData.user.name
            };

            // Retail values
            const retail = {
                id: "sample",
                code: "BBB",
                name: "sample retailer"
            };
            
            // Render shop/main.ejs
            res.render("shop/main", {
                wholesale,
                retail,
                prod
            });
        }
    } // shop
}; // process

module.exports = process;