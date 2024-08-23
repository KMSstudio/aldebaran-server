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
// Needs: wholesale.code, wholesale.name, retail.ip, retail.code, retail.name, order.content, orcer.price
const createOrder = async (wholesale, retail, order) => {
    const id = crypto.randomUUID();
    const date = new Date(Date.now() + (9*60*60*1000)).toISOString().slice(0, 16).replace('T', ' ');
    
    const params = {
        TableName: tableName,
        Item: {
            id,                                 // Partition key
            wholesale: wholesale.code,          // Wholesale code (GSI key)
            retail: retail.code,                // Retail code
            date,                               // Order date
            ip: retail.ip,                      // Retailer IP address
            status: "standby",                  // Order status
            content: order.content,             // Order details
            price: order.price,
            wholesaleName: wholesale.name,      // Wholesale name attribute
            retailName: retail.name             // Retailer name attribute
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
const deleteOrder = async (id) => {
    // First, retrieve the order to check its status
    const getParams = {
        TableName: tableName,
        Key: { id }
    };

    try {
        const data = await dynamoDB.get(getParams).promise();
        if (!data.Item) { return { success: false, code: 2205, message: 'Order ID does not exist.' };  }
        if (data.Item.status !== "standby") { return { success: false, code: 2206, message: 'Order cannot be deleted as it is not in standby status.' }; }

        const deleteParams = {
            TableName: tableName,
            Key: { id }
        };

        await dynamoDB.delete(deleteParams).promise();
        return { success: true, code: 0, message: 'Order deleted successfully.' };
    } catch (error) {
        return { success: false, code: 2103, message: 'Error deleting order', error };
    }
};

// Request all orders by wholesale code using GSI
const WrequestOrder = async (code) => {
    const params = {
        TableName: tableName,
        IndexName: "wholesale-index",  // GSI name
        KeyConditionExpression: "wholesale = :wholesaleCode",
        ExpressionAttributeValues: {
            ":wholesaleCode": code
        }
    };

    try {
        const data = await dynamoDB.query(params).promise();
        return { success: true, code: 0, orders: data.Items, message: 'Orders retrieved successfully.' };
    } catch (error) {
        return { success: false, code: 2103, message: 'Error retrieving orders', error };
    }
};

// Request all orders by retail code using GSI
const RrequestOrder = async (code) => {
    const params = {
        TableName: tableName,
        IndexName: "retail-index",  // GSI name
        KeyConditionExpression: "retail = :retailCode",
        ExpressionAttributeValues: {
            ":retailCode": code
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
    WrequestOrder,
    RrequestOrder,
};
