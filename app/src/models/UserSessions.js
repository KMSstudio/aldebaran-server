"use strict";

require('dotenv').config();
const AWS = require('aws-sdk');
const crypto = require('crypto');

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.AWS_USER_SESSION_TABLE;
const sessionExpireIn = process.env.USER_SESSION_EXPIRE_IN

// Create a new session
const createSession = async (id, type) => {
    const session = crypto.randomUUID(); // Generate unique session ID
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expireTime = now + sessionExpireIn; // Add 1 hour (3600 seconds)

    const params = {
        TableName: tableName,
        Item: {
            session,
            id,
            type,
            datetime: Number(expireTime)
        },
    };

    try {
        await dynamoDB.put(params).promise();
        return { success: true, code: 0, session, message: 'Session created successfully.' };
    } catch (error) { return { success: false, code: 2102, message: 'Error creating session', error }; }
};

// Check if the session is valid
const checkSession = async (session, type) => {
    const params = {
        TableName: tableName,
        Key: { session }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) { return { success: false, code: 2203, message: 'Session does not exist.' }; }
        else if (data.Item.type !== type) { return { success: false, code: 2203, message: 'Session does not exist.' }; }
        else if (Math.floor(Date.now() / 1000) > data.Item.datetime) { return { success: false, code: 2204, message: 'Session has expired.' }; }
        else { return { success: true, code: 0, id: data.Item.id, message: 'Session is valid.' }; }
    } catch (error) { return { success: false, code: 2102, message: 'Error checking session', error }; }
};

// Refine sessions by deleting expired ones
const refineSession = async () => {
    const now = Math.floor(Date.now() / 1000);
    const scanParams = {
        TableName: tableName,
    };

    try {
        const data = await dynamoDB.scan(scanParams).promise();
        const deletePromises = data.Items.map(item => {
            if (now > item.datetime + 300) {
                const deleteParams = {
                    TableName: tableName,
                    Key: { session: item.session }
                };
                return dynamoDB.delete(deleteParams).promise();
            }
        });

        await Promise.all(deletePromises);
        return { success: true, code: 0, message: 'Expired sessions refined successfully.' };
    } catch (error) {
        return { success: false, code: 2102, message: 'Error refining sessions', error };
    }
};

module.exports = {
    createSession,
    checkSession,
    refineSession,
};