"use strict";

require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.AWS_XCODE_LIST; 

// Create a new Xcode record
const createXcode = async (xcode, code) => {
    const params = {
        TableName: tableName,
        Item: { xcode, code }
    };

    try {
        await dynamoDB.put(params).promise();
        return { success: true, message: 'Xcode record created successfully.' };
    } catch (error) {
        return { success: false, message: 'Error creating Xcode record.', error };
    }
};

// Get Xcode record and return code
const getXcode = async (xcode) => {
    const params = {
        TableName: tableName,
        Key: { xcode }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item) { return { success: true, code: data.Item.code, message: 'Xcode record retrieved successfully.' }; }
        else { return { success: false, message: 'Xcode record not found.' }; }
    } catch (error) { return { success: false, message: 'Error retrieving Xcode record.', error }; }
};

module.exports = {
    createXcode,
    getXcode
};
