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
const Hash = require("./Hash");
const db_xcode = require("./db-xcode");

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
    } catch (error) { return { success: false, code: 2101, message: 'Error retrieving user by code.', error }; }
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
    const code = Sequence.nextSequence('user', -1);
    const xcode = Hash.hashString(code);

    const params = {
        TableName: tableName,
        Item: {
            id,
            pw,
            code,
            xcode,
            ...user
        },
    };

    try {
        // Save the user data in the DynamoDB table
        await dynamoDB.put(params).promise();
        // Create an entry in the xcode table
        const xcodeResult = await db_xcode.createXcode(xcode, code);
        if (!xcodeResult.success) { return { success: false, code: 2106, message: 'User created, but failed to create xcode record.', error: xcodeResult.error }; }
        delete params.Item.pw;
        return { success: true, code: 0, user: params.Item, message: 'User created successfully.' };
    } catch (error) { return { success: false, code: 2101, message: 'Error creating user', error }; }
};

module.exports = {
    isValid,
    getUser,
    reqUser,
    createUser,
};