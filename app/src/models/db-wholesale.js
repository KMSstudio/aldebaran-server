"use strict";

require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.AWS_WHOLESALE_USER;

const Sequence = require("./Sequence");

// Check if user ID is valid
const isValid = async (id) => {
    const params = {
        TableName: tableName,
        Key: { id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item) { return { success: true, code:0, exist: true, message: 'User exists.' }; }
        else { return { success: true, code: 0, exist: false, message: 'User does not exist.' }; }
    } catch (error) { return { success: false, code: 2101, message: 'Error checking wholesale user table', error }; }
};

// Get user information by ID
const getUser = async (id) => {
    const params = {
        TableName: tableName,
        Key: { id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) { return { success: false, code: 2201, message: 'User ID does not exist.' }; }
        else { delete data.Item.pw; return { success: true, code: 0, user: data.Item, message: 'Login successful.' }; }
    } catch (error) { return { success: false, code: 2101, message: 'Error checking wholesale user table', error }; }
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
        else { delete data.Item.pw; return { success: true, code: 0, user: data.Item, message: 'Login successful.' }; }
    } catch (error) { return { success: false, code: 2101, message: 'Error checking wholesale user table', error }; }
};

// Check whether the password is too easy
const isTooEasyPW = (pw) => {
    return pw === "0000";
};

// Create new user
const createUser = async (id, pw, user) => {
    if (!user.name || !user.address || !user.phoneNumber) { return { success: false, code: 2001, message: 'Missing argument.' }; }
    const existingUserCheck = await isValid(id);
    if (existingUserCheck.exist) { return { success: false, code: 2002, message: 'User ID already exists.' }; }
    if (isTooEasyPW(pw)) { return { success: false, code: 2003, message: 'Password cannot be "0000".' }; }
    const code = Sequence.nextSequence('wholesale', -1);

    const params = {
        TableName: tableName,
        Item: {
            id,
            pw,
            code,
            ...user
        },
    };

    try {
        await dynamoDB.put(params).promise();
        delete params.Item.pw;
        return { success: true, code: 0, user: params.Item, message: 'User created successfully.' };
    } catch (error) { return { success: false, code: 6024, message: 'Error creating user', error }; }
};

module.exports = {
    isValid,
    getUser,
    reqUser,
    createUser,
};