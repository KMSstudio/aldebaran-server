"use strict"

const ShopQR = require("../models/ShopQR");
const userSessions = require("../models/UserSessions");

const db_wholesale = require("../models/db-wholesale");
const db_retail = require("../models/db-retail");
const db_order = require("../models/db-order");
const db_product = require("../models/db-product");
const db_option = require("../models/db-option");

const api = {
    wholesale: {
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
                const reqSession = await userSessions.createSession({ code: result.user.code, id: result.user.id, name: result.user.name }, 'W');
                if (reqSession.code != 0){ res.json(reqSession); return; }
                // Save the session in a cookie
                res.cookie('session', reqSession.session, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 3600000
                });
                res.json({ ...result });
            } catch (error) { res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error }); }
        },
    }, //wholesale

    retail: {
        // regist user
        regist: async (req, res) => {
            const { id, pw, ...userData } = req.body;
            try { const result = await db_retail.createUser(id, pw, { ...userData }); res.json(result); }
            catch (error) { res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error }); }
        },
        // login and get user info
        login : async (req, res) => {
            const { id, pw } = req.body;
            try { 
                const result = await db_retail.reqUser(id, pw);
                if (result.code != 0){ res.json(result); return; }
                const reqSession = await userSessions.createSession({ code: result.user.code, id: result.user.id, name: result.user.name }, 'R');
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
    }, //retail

    order: {
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
    }, // order

    session: {
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
        },

        // Clear session
        deleteSession: (req, res) => { res.clearCookie('session'); },
    }, // session

    product: {
        // Push a option. name and price is necessary.
        push: async (req, res) => {
            let { code, name, price, minCnt, unitCnt } = req.body;
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
            if (!code || !name) { return res.status(400).json({ success: false, code: 2001, message: 'Name and price are required.' }); }
            
            try {
                const result = await db_product.createProduct(code, { name, price, minCnt, unitCnt });
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
    }, // product

    option: {
        // Push a product. name and price is necessary.
        push: async (req, res) => {
            let { code, name, minSelect, maxSelect, content } = req.body;
            
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
            if (!code || !name || !content) { return res.status(400).json({ success: false, code: 2001, message: 'Name is required.' }); }
            
            const opt = {};
            if (name) opt.name = name;
            if (minSelect) opt.minSelect = minSelect;
            if (maxSelect) opt.maxSelect = maxSelect;
            if (content) opt.content = content;
            try {
                const result = await db_option.createOption(code, opt);
                return res.json(result);
            } catch (error) {
                console.error('Error creating option:', error);
                return res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error });
            }
        },

        // Update a product
        update: async (req, res) => {
            const { id } = req.params;
            const { name, minSelect, maxSelect, content } = req.body;
            
            const opt = {};
            if (name) opt.name = name;
            if (minSelect) opt.minSelect = minSelect;
            if (maxSelect) opt.maxSelect = maxSelect;
            if (content) opt.content = content;

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
            if (!id.startsWith(code)) { return res.status(400).json({ success: false, code: 2004, message: 'Invalid option ID.' }); }
            // Update
            try {
                const result = await db_option.updateOption(code, id, opt);
                if (result.success) { return res.json(result); } 
                else { return res.json(result); }
            } catch (error) {
                console.error('Error updating option:', error);
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
                const result = await db_option.resetOption(code);
                return res.json(result);
            } catch (error) {
                console.error('Error resetting option:', error);
                return res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error });
            }
        }
    }, //option

    file: {
        shopqr: async (req, res) => {
            let { code } = req.query;
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
                const qrFilePath = await ShopQR.generateQRCode(code);
                res.download(qrFilePath, `qr${code}.png`);
            } catch (error) {
                console.error('Error creating shop QR:', error);
                return res.status(500).json({ success: false, code: 2100, message: 'Internal server error', error });
            }
        }
    }, // file

    
}; // api

module.exports = api;