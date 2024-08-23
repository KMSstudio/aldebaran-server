"use strict";

require('dotenv').config();
const AWS = require('aws-sdk');
const Sequence = require('./Sequence');

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.AWS_OPTION_LIST;

// Create new option
const createOption = async (code, opt) => {
    if (!opt.name || !Array.isArray(opt.content) || opt.content.length < 1) {
        return { success: false, code: 2004, message: 'Invalid option data.' };
    }

    const id = `${code}${Sequence.nextSequence('prod'+code, 4)}`;
    const params = {
        TableName: tableName,
        Item: {
            code,
            id,
            name: opt.name,
            minSelect: Number(opt.minSelect) || 1,
            maxSelect: Number(opt.maxSelect) || Number(opt.content.length),
            content: opt.content
        }
    };

    try {
        await dynamoDB.put(params).promise();
        return { success: true, code: 0, message: 'Option created successfully.', optionId: id };
    } catch (error) {
        return { success: false, code: 2107, message: 'Error creating option.', error };
    }
};

// Request all options by wholesale code
const requestOption = async (code) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: "code = :code",
        ExpressionAttributeValues: {
            ":code": code
        }
    };

    try {
        const data = await dynamoDB.query(params).promise();
        return { success: true, code: 0, options: data.Items, message: 'Options retrieved successfully.' };
    } catch (error) {
        return { success: false, code: 2107, message: 'Error retrieving options.', error };
    }
};

// Get option by code and id
const getOption = async (code, id) => {
    const params = {
        TableName: tableName,
        Key: { code, id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item) { return { success: true, code: 0, option: data.Item, message: 'Option retrieved successfully.' }; }
        else { return { success: false, code: 2007, message: 'Option not found.' }; }
    } catch (error) { return { success: false, code: 2107, message: 'Error retrieving option.', error }; }
};

// Delete option by code and id
const deleteOption = async (code, id) => {
    const params = {
        TableName: tableName,
        Key: { code, id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) { return { success: false, code:2007, message: 'Option not found.' }; }
        await dynamoDB.delete(params).promise();
        return { success: true, code: 0, message: 'Option deleted successfully.' };
    } catch (error) {
        return { success: false, code: 2107, message: 'Error deleting option.', error };
    }
};

// Update option by code and id
const updateOption = async (code, id, opt) => {
    const updateExpressions = [];
    const expressionAttributeValues = {};

    if (opt.name) {
        updateExpressions.push("name = :name");
        expressionAttributeValues[":name"] = opt.name;
    } if (opt.minSelect) {
        updateExpressions.push("minSelect = :minSelect");
        expressionAttributeValues[":minSelect"] = Number(opt.minSelect);
    } if (opt.maxSelect) {
        updateExpressions.push("maxSelect = :maxSelect");
        expressionAttributeValues[":maxSelect"] = Number(opt.maxSelect);
    } if (opt.content) {
        updateExpressions.push("content = :content");
        expressionAttributeValues[":content"] = opt.content;
    }

    if (updateExpressions.length === 0) {
        return { success: false, code: 2004, message: 'No valid fields to update.' };
    }

    const params = {
        TableName: tableName,
        Key: { code, id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
    };

    try {
        const data = await dynamoDB.update(params).promise();
        return { success: true, code: 0, message: 'Option updated successfully.', updatedOption: data.Attributes };
    } catch (error) {
        return { success: false, code: 2107, message: 'Error updating option.', error };
    }
};

// Reset options by wholesale code
const resetOption = async (code) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: "code = :code",
        ExpressionAttributeValues: {
            ":code": code
        }
    };

    try {
        // Query all items with the given code
        const data = await dynamoDB.query(params).promise();
        const items = data.Items;

        console.log(code);
        console.log(items);

        if (items.length === 0) {
            return { success: true, code: 0, message: 'No options found to delete.' };
        }

        // Delete items in batches
        const deleteRequests = items.map(item => ({
            DeleteRequest: { Key: { code: item.code, id: item.id } }
        }));

        // DynamoDB batchWrite
        while (deleteRequests.length > 0) {
            const batchParams = { RequestItems: { [tableName]: deleteRequests.splice(0, 25) } };
            await dynamoDB.batchWrite(batchParams).promise();
        }

        return { success: true, code: 0, message: 'All options deleted successfully.' };
    } catch (error) {
        console.error('Error resetting options:', error);
        return { success: false, code: 2103, message: 'Error resetting options', error };
    }
};

module.exports = {
    createOption,
    requestOption,
    getOption,
    deleteOption,
    updateOption,
    resetOption,
};