// shop-qr.js
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

class ShopQR {
    static baseURL = process.env.SERVER_BASE_URL;

    static async generateQRCode(code) {
        const url = `${this.baseURL}/shop/${code}`;
        const filePath = path.join(__dirname, `../../log/text/qr${code}.png`);

        try {
            await QRCode.toFile(filePath, url);
            return filePath;
        } catch (err) { throw new Error('QR code generation failed'); }
    }

    static deleteQRCode(code) {
        const filePath = path.join(__dirname, `../../log/file/qr${code}.png`);
        try {
            if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
        } catch (err) { console.error('Error deleting QR code file:', err); }
    }
}

module.exports = ShopQR;