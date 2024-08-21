"use strict";

const fs = require("fs");
const path = require("path");

class Sequence {
    static #getFilePath = () => path.join(__dirname, "sequence.json");
    static #readSequenceFile = () => {
        if (!fs.existsSync(this.#getFilePath())) return {};
        return JSON.parse(fs.readFileSync(this.#getFilePath(), "utf-8"));
    };
    static #writeSequenceFile = (sequenceData) => 
        fs.writeFileSync(this.#getFilePath(), JSON.stringify(sequenceData, null, 2));

    static #formatNumber = (value, length) => value.toString().padStart(length, '0');
    static #formatAlphabet = (value) => {
        let result = '';
        while (value > 0) {
            value--;
            result = String.fromCharCode(65 + (value % 26)) + result;
            value = Math.floor(value / 26);
        }
        return result.padStart(4, 'A');
    };

    // Public method
    static nextSequence(target, format) {
        const sequenceData = this.#readSequenceFile();
        sequenceData[target] = sequenceData[target] !== undefined ? sequenceData[target] + 1 : 1;

        // formating
        let result;
        if (typeof format === "number" && format > 0) {
            result = this.#formatNumber(sequenceData[target], format);
        } else if (format === -1) {
            result = this.#formatAlphabet(sequenceData[target]);
        } else {
            result = sequenceData[target].toString();
        }

        this.#writeSequenceFile(sequenceData);
        return result;
    }
}

module.exports = Sequence;