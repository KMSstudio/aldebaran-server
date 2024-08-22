"use strict";

require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.AWS_RETAIL_USER;

const Sequence = require("./Sequence");

// Check if user ID is valid
const isValid = async (id) => {
    const params = {
        TableName: tableName,
        Key: { id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        return data.Item 
            ? { success: true, code: 0, exist: true, message: 'User exists.' } 
            : { success: true, code: 0, exist: false, message: 'User does not exist.' };
    } catch (error) {
        return { success: false, code: 2105, message: 'Error checking retail user table', error };
    }
};

// Get user information by ID (without password)
const getUserById = async (id) => {
    const params = {
        TableName: tableName,
        Key: { id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            return { success: false, code: 2201, message: 'User ID does not exist.' };
        } else {
            delete data.Item.pw;
            return { success: true, code: 0, user: data.Item, message: 'User retrieved successfully.' };
        }
    } catch (error) {
        return { success: false, code: 2105, message: 'Error retrieving user by ID.', error };
    }
};

// Get user information by Code
const getUser = async (code) => {
    const params = {
        TableName: tableName,
        IndexName: "code-index",
        KeyConditionExpression: "code = :code",
        ExpressionAttributeValues: { ":code": code }
    };

    try {
        const data = await dynamoDB.query(params).promise();
        if (data.Items.length === 0) { return { success: false, code: 2201, message: 'User code does not exist.' }; }
        else { 
            const user = data.Items[0];
            delete user.pw; 
            return { success: true, code: 0, user, message: 'User retrieved successfully.' }; 
        }
    } catch (error) { return { success: false, code: 2105, message: 'Error retrieving user by code.', error }; }
};

// Request user information by Id and password
const reqUser = async (id, pw) => {
    const params = {
        TableName: tableName,
        Key: { id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) { return { success: false, code: 2201, message: 'User ID does not exist.' }; }
        else if (data.Item.pw !== pw) { return { success: false, code: 2202, message: 'Password is incorrect.' }; }
        else {
            delete data.Item.pw;
            return { success: true, code: 0, user: data.Item, message: 'Login successful.' };
        }
    } catch (error) { return { success: false, code: 2105, message: 'Error checking retail user table', error }; }
};

// Check whether the password is too easy
const isTooEasyPW = (pw) => pw === "0000";

// Create new user
const createUser = async (id, pw, user) => {
    if (!user.name || !user.address || !user.phoneNumber) return { success: false, code: 2001, message: 'Missing argument.' };
    const existingUserCheck = await isValid(id);
    if (existingUserCheck.exist) return { success: false, code: 2002, message: 'User ID already exists.' };
    if (isTooEasyPW(pw)) return { success: false, code: 2003, message: 'Password cannot be "0000".' };
    const code = Sequence.nextSequence('user', -1);
    const connShop = [];

    const params = {
        TableName: tableName,
        Item: {
            id,
            pw,
            code,
            ...user,
            connShop,
        },
    };

    try {
        await dynamoDB.put(params).promise();
        delete params.Item.pw;
        return { success: true, code: 0, user: params.Item, message: 'User created successfully.' };
    } catch (error) { return { success: false, code: 2105, message: 'Error creating user', error }; }
};

// Add a shop to the user's connected shops
const addShop = async (id, xcode, name) => {
    const userResponse = await getUserById(id);
    if (!userResponse.success) return userResponse;
    const user = userResponse.user;
    const shopExists = user.connShop.some(shop => shop.xcode === xcode);

    if (!shopExists) {
        user.connShop.push({ xcode, name });
        const params = {
            TableName: tableName,
            Key: { id },
            UpdateExpression: "set connShop = :connShop",
            ExpressionAttributeValues: {
                ":connShop": user.connShop
            }
        };

        try {
            await dynamoDB.update(params).promise();
            return { success: true, code: 0, message: 'Shop added successfully.' };
        } catch (error) { return { success: false, code: 2105, message: 'Error adding shop.', error }; }
    } else { return { success: true, code: 2005, message: 'Shop already connected.' }; }
};

// Delete a shop from the user's connected shops
const delShop = async (id, xcode) => {
    const userResponse = await getUserById(id);
    if (!userResponse.success) return userResponse;
    const user = userResponse.user;
    const shopExists = user.connShop.some(shop => shop.xcode === xcode);

    if (shopExists) {
        user.connShop = user.connShop.filter(shop => shop.xcode !== xcode);
        const params = {
            TableName: tableName,
            Key: { id },
            UpdateExpression: "set connShop = :connShop",
            ExpressionAttributeValues: {
                ":connShop": user.connShop
            }
        };

        try {
            await dynamoDB.update(params).promise();
            return { success: true, code: 0, message: 'Shop deleted successfully.' };
        } catch (error) { return { success: false, code: 2105, message: 'Error deleting shop.', error }; }
    } else { return { success: true, code: 2006, message: 'Shop not found.' }; }
};

// Delete retailer information
const deleteUser = async (id) => {
    const params = {
        TableName: tableName,
        Key: { id }
    };

    try {
        await dynamoDB.delete(params).promise();
        return { success: true, code: 0, message: 'User deleted successfully.' };
    } catch (error) {
        return { success: false, code: 2105, message: 'Error deleting user', error };
    }
};

module.exports = {
    isValid,
    getUser,
    reqUser,
    createUser,
    deleteUser,
    addShop,
    delShop,
};