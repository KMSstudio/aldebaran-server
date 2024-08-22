"use strict"

const crypto = require('crypto');

class Hash {
    // Get string and make hashed hex string
    static hashString(inputStr) {
        const hash = crypto.createHash('sha256');
        hash.update(inputStr);
        return hash.digest('hex');
    }
}

module.exports = Hash;