"use strict"

const path = require("path");

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

module.exports = output;