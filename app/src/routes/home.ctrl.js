"use strict"

require("dotenv").config();

const db_wholesale = require("../models/db-wholesale");
const db_order = require("../models/db-order");
const userSessions = require("../models/UserSessions");

const output = {
    home: (req, res) => {
        res.render("index");
    },
    wholesale: {
        regist: (req, res) => { res.render("wholesale/regist"); },
        login: (req, res) => { res.render("wholesale/login"); },
        main: async (req, res) => {
            const session = req.cookies.session;  // Assuming session is stored in cookies
            if (!session) { return res.render("wholesale/main", { loggedIn: false }); }
            try {
                const result = await userSessions.checkSession(session, 'W');
                if (result.success) { return res.render("wholesale/main", { loggedIn: true, userId: result.id }); }
                else { return res.render("wholesale/main", { loggedIn: false }); }
            } catch (error) { return res.status(500).render("wholesale/main", { loggedIn: false }); }
        },
    },
}

const process = {
    wholesale: {
        // Render the home.ejs file
        home: async (req, res) => {
            // Get session
            const session = req.cookies.session;
            let user = 'none';

            if (session) {
                try {
                    const result = await userSessions.checkSession(session, 'W');
                    if (result.success) {
                        user = result.id;
                    }
                } catch (error) {
                    console.error('Session validation error:', error);
                }
            }

            // Get order
            const order = { orders: [], msg: '', success: true };
            if (user !== 'none') {
                try {
                    const orderData = await db_order.requestOrder(user);
                    if (orderData.success) {
                        order.orders = orderData.orders.map(record => ({
                            customer: record.retailName,
                            product: record.order.map(item => `${item.name} ${item.cnt}`),
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
            console.log(order);

            // Render home.ejs
            res.render("wholesale/home", {
                id: user,
                order: order,
            });
        },
    },
};

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
            const reqSession = await userSessions.createSession(id, 'W');
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

module.exports = {
    output,
    process,
    wholesale,
    order,
    session,
};