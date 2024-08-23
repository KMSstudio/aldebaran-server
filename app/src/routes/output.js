"use strict"

const path = require("path");

const output = {
    home: (req, res) => {
        res.render("index");
    },

    // Wholesale login and register page
    wholesale: {
        regist: (req, res) => { res.render("wholesale/regist"); },
        login: (req, res) => { res.render("wholesale/login"); },
        logout: (req, res) => {
            res.clearCookie('session');
            res.redirect('/wholesale/login');
        },
    },

    // Retail login and register page
    retail: {
        regist: (req, res) => { res.render("retail/regist"); },
        login: (req, res) => { res.render("retail/login"); },
        logout: (req, res) => {
            res.clearCookie('session');
            res.redirect('/retail/login');
        },
    },

    // Public file output
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

module.exports = output;