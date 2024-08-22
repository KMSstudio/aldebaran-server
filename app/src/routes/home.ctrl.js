"use strict"

require("dotenv").config();

const path = require("path");

const db_wholesale = require("../models/db-wholesale");
const db_order = require("../models/db-order");
const db_product = require("../models/db-product");
const userSessions = require("../models/UserSessions");

const output = {
    home: (req, res) => {
        res.render("index");
    },

    // wholesale login and register page
    wholesale: {
        regist: (req, res) => { res.render("wholesale/regist"); },
        login: (req, res) => { res.render("wholesale/login"); },
    },

    // public file output
    file: {
        product: (req, res) => { 
            const filePath = path.join(__dirname, "../public/document/product.xlsx");
            res.download(filePath, 'product.xlsx', (err) => {
                if (err) { console.error('Error sending file:', err); res.status(500).send('Could not download file.'); }
            });
        },
        option: (req, res) => { 
            const filePath = path.join(__dirname, "../public/document/option.xlsx");
            res.download(filePath, 'option.xlsx', (err) => {
                if (err) { console.error('Error sending file:', err); res.status(500).send('Could not download file.'); }
            });
        },
    }
}

const process = {
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
}; // process

const wholesale = {
    // regist user
    regist: async (req, res) => {
        const { id, pw, ...userData } = req.body;
        try { const result = await db_wholesale.createUser(id, pw, { ...userData }); res.json(result); }
        catch (error) { res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error }); }
    },
    // login and get user info
    login : async (req, res) => {
        const { id, pw } = req.body;
        try { 
            const result = await db_wholesale.reqUser(id, pw);
            if (result.code != 0){ res.json(result); return; }
            const reqSession = await userSessions.createSession({ code: result.user.code, id: result.user.id }, 'W');
            if (reqSession.code != 0){ res.json(reqSession); return; }
            // Save the session in a cookie
            res.cookie('session', reqSession.session, {
                httpOnly: true,
                secure: false,
                maxAge: 3600000
            });
            res.json({ ...result, session: reqSession.session });
        } catch (error) { res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error }); }
    },
}

const order = {
    // push order
    push: async (req, res) => {
        const { wholesale, retail, order } = req.body;
        retail.ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        try {
            const result = await db_order.createOrder(wholesale, retail, order);
            res.json(result);
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error });
        }
    }
};

const session = {
    // Create a session with id and type
    createSession: async (req, res) => {
        const { id, type } = req.body;
        try {
            const result = await userSessions.createSession(id, type);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, code: 2100, message: 'Internal server error during session creation', error });
        }
    },

    // Check if a session is valid and return the id if it is
    checkSession: async (req, res) => {
        const { session, type } = req.body;
        console.log(`check session ${session}`)
        try {
            const result = await userSessions.checkSession(session, type);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, code: 2100, message: 'Internal server error during session validation', error });
        }
    },

    // Refresh the session
    refreshSession: async (req, res) => {
        const { session } = req.body;
        if (!session) { res.json({ success: false, code: 2001, message: 'Missing session argument' }); return; }
        // Verify the session
        const sessionVeri = await userSessions.checkSession(session);
        if (sessionVeri.code !== 0) { res.json(sessionVeri); return; }
        const id = sessionVeri.id; 
        // Create a new session
        const newSession = await userSessions.createSession(id);
        if (newSession.code !== 0) { res.json(newSession); return; }
        // Return the new session information
        res.json({ success: true, code: 0, session: newSession.session, message: 'Session refreshed successfully' });
    },

    // Refine the session table by deleting expired sessions
    refineSession: async (req, res) => {
        try {
            const result = await userSessions.refineSession();
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, code: 2100, message: 'Internal server error during session refinement', error });
        }
    }
};

const product = {
    // Push a product. name and price is necessary.
    push: async (req, res) => {
        let { code, name, price, minCnt, unitCnt, opt } = req.body;

        // !Code
        if (!code) {
            const session = req.cookies.session;
            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'W');
                    if (result.success) { code = result.code; }
                } catch (error) {
                    console.error('Session validation error:', error);
                    return res.status(500).json({ success: false, code: 2100, message: 'Internal server error during session validation.', error });
                }
            }
        }

        if (!code || !name || !price) { return res.status(400).json({ success: false, code: 2001, message: 'Name and price are required.' }); }
        try {
            const result = await db_product.createProduct(code, { name, price, minCnt, unitCnt, opt });
            return res.json(result);
        } catch (error) {
            console.error('Error creating product:', error);
            return res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error });
        }
    },

    // Update a product
    update: async (req, res) => {
        const { id } = req.params;
        const { name, price, minCnt, unitCnt, opt } = req.body;
        
        const prod = {};
        if (name) prod.name = name;
        if (price) prod.price = price;
        if (minCnt) prod.minCnt = minCnt;
        if (unitCnt) prod.unitCnt = unitCnt;
        if (opt) prod.opt = opt;

        // Retrieve code from session
        const session = req.cookies.session;
        let code;
        if (session) {
            try {
                const result = await userSessions.checkSession(session, 'W');
                if (result.success) { code = result.code; }
                else { return res.status(401).json(result); }
            } catch (error) {
                console.error('Session validation error:', error);
                return res.status(500).json({ success: false, code: 2100, message: 'Internal server error during session validation.', error });
            }
        }

        // Ensure the id starts with the code
        if (!id.startsWith(code)) { return res.status(400).json({ success: false, code: 2004, message: 'Invalid product ID.' }); }
        // Update product
        try {
            const result = await db_product.updateProduct(code, id, prod);
            if (result.success) { return res.json(result); } 
            else { return res.json(result); }
        } catch (error) {
            console.error('Error updating product:', error);
            return res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error });
        }
    },

    // Reset all products with the given code
    reset: async (req, res) => {
        let { code } = req.body;

        // !Code
        if (!code) {
            const session = req.cookies.session;
            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'W');
                    if (result.success) { code = result.code; }
                } catch (error) {
                    console.error('Session validation error:', error);
                    return res.status(500).json({ success: false, code: 2100, message: 'Internal server error during session validation.', error });
                }
            }
        }

        if (!code) { return res.status(400).json({ success: false, code: 2001, message: 'Code is required.' }); }

        try {
            const result = await db_product.resetProduct(code);
            return res.json(result);
        } catch (error) {
            console.error('Error resetting products:', error);
            return res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error });
        }
    }
};

module.exports = {
    output,
    process,
    wholesale,
    order,
    product,
    session,
};