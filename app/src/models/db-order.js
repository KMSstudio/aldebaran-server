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
const tableName = process.env.AWS_ORDER_LIST;

// Create a new order
const createOrder = async (wholesale, retail, order) => {
    const id = crypto.randomUUID();
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
    
    const params = {
        TableName: tableName,
        Item: {
            wholesaleId: wholesale.id,          // Partition key
            id,                                 // Sort key
            wholesaleName: wholesale.name,      // Wholesale name attribute
            retailId: retail.id,                // Retailer ID attribute
            retailIp: retail.ip,                // Retailer IP address
            retailName: retail.name,            // Retailer name attribute
            order: order.content,               // Order details
            price: order.price,
            date,                               // Order date
            status: "standby"                   // Order status
        },
    };

    try {
        await dynamoDB.put(params).promise();
        return { success: true, code: 0, message: 'Order created successfully.', orderId: id };
    } catch (error) {
        return { success: false, code: 2103, message: 'Error creating order', error };
    }
};

// Delete an order
const deleteOrder = async (wholesaleId, id) => {
    // First, retrieve the order to check its status
    const getParams = {
        TableName: tableName,
        Key: {
            wholesaleId,
            id
        }
    };

    try {
        const data = await dynamoDB.get(getParams).promise();
        if (!data.Item) { return { success: false, code: 2205, message: 'Order ID does not exist.' };  }
        if (data.Item.status !== "standby") { return { success: false, code: 2206, message: 'Order cannot be deleted as it is not in standby status.' }; }

        const deleteParams = {
            TableName: tableName,
            Key: { wholesaleId, id }
        };

        await dynamoDB.delete(deleteParams).promise();
        return { success: true, code: 0, message: 'Order deleted successfully.' };
    } catch (error) {
        return { success: false, code: 2103, message: 'Error deleting order', error };
    }
};

// Request all orders by wholesaleId
const requestOrder = async (wholesaleId) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: "wholesaleId = :wholesaleId",
        ExpressionAttributeValues: {
            ":wholesaleId": wholesaleId
        }
    };

    try {
        const data = await dynamoDB.query(params).promise();
        return { success: true, code: 0, orders: data.Items, message: 'Orders retrieved successfully.' };
    } catch (error) {
        return { success: false, code: 2103, message: 'Error retrieving orders', error };
    }
};

module.exports = {
    createOrder,
    deleteOrder,
    requestOrder,
};
