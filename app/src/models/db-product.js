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
const tableName = process.env.AWS_PRODUCT_LIST;

// Create a new product
const createProduct = async (code, prod) => {
    if (!prod.name || !prod.price) {
        return { success: false, code: 4001, message: 'Product name and price are required.' };
    }

    const id = `${code}${Sequence.nextSequence('prod' + code, 4)}`;

    const params = {
        TableName: tableName,
        Item: {
            code,                               // Partition key
            id,                                 // Sort key
            name: prod.name,                    // Product name
            price: prod.price,                  // Product price
            minCnt: prod.minCnt || 1,           // Minimum order count, default 1
            unitCnt: prod.unitCnt || 1,         // Unit increment count, default 1
            opt: prod.opt || ''                 // Option code, default empty string
        },
    };

    try {
        await dynamoDB.put(params).promise();
        return { success: true, code: 0, message: 'Product created successfully.', productId: id };
    } catch (error) {
        return { success: false, code: 2104, message: 'Error creating product', error };
    }
};

// Request all products by wholesale code
const requestProduct = async (code) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: "code = :code",
        ExpressionAttributeValues: {
            ":code": code
        }
    };

    try {
        const data = await dynamoDB.query(params).promise();
        return { success: true, code: 0, products: data.Items, message: 'Products retrieved successfully.' };
    } catch (error) {
        return { success: false, code: 2104, message: 'Error retrieving products', error };
    }
};

// Get single product by code and id
const getProduct = async (code, id) => {
    const params = {
        TableName: tableName,
        Key: { code, id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            return { success: false, code: 2205, message: 'Product not found.' };
        }
        return { success: true, code: 0, product: data.Item, message: 'Product retrieved successfully.' };
    } catch (error) {
        return { success: false, code: 2104, message: 'Error retrieving product', error };
    }
};

// Delete product by code and id
const deleteProduct = async (code, id) => {
    const params = {
        TableName: tableName,
        Key: { code, id }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            return { success: false, code: 2205, message: 'Product not found.' };
        }

        await dynamoDB.delete(params).promise();
        return { success: true, code: 0, message: 'Product deleted successfully.' };
    } catch (error) {
        return { success: false, code: 2104, message: 'Error deleting product', error };
    }
};

// Update a product by code and id
const updateProduct = async (code, id, prod) => {
    console.log('hello');
    // check if the product exists
    const checkParams = {
        TableName: tableName,
        Key: { code, id }
    };
    try {
        const data = await dynamoDB.get(checkParams).promise();
        if (!data.Item) { return { success: false, code: 2004, message: 'Product not found.' }; }
    } catch (error) { return { success: false, code: 2104, message: 'Error retrieving product', error }; }

    // make expression
    let updateExpression = 'set';
    let ExpressionAttributeValues = {};

    if (prod.name) {
        updateExpression += ' name = :name,';
        ExpressionAttributeValues[':name'] = prod.name;
    } if (prod.price) {
        updateExpression += ' price = :price,';
        ExpressionAttributeValues[':price'] = prod.price;
    } if (prod.minCnt !== undefined) {
        updateExpression += ' minCnt = :minCnt,';
        ExpressionAttributeValues[':minCnt'] = prod.minCnt;
    } if (prod.unitCnt !== undefined) {
        updateExpression += ' unitCnt = :unitCnt,';
        ExpressionAttributeValues[':unitCnt'] = prod.unitCnt;
    } if (prod.opt !== undefined) {
        updateExpression += ' opt = :opt,';
        ExpressionAttributeValues[':opt'] = prod.opt;
    } updateExpression = updateExpression.slice(0, -1);

    const params = {
        TableName: tableName,
        Key: { code, id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues
    };

    // return value
    try {
        await dynamoDB.update(params).promise();
        return { success: true, code: 0, message: 'Product updated successfully.' };
    } catch (error) {
        return { success: false, code: 2104, message: 'Error updating product', error };
    }
};

// Reset products by wholesale code
const resetProduct = async (code) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: "code = :code",
        ExpressionAttributeValues: {
            ":code": code
        }
    };

    try {
        // query all items with the given code
        const data = await dynamoDB.query(params).promise();
        const items = data.Items;

        console.log(code);
        console.log(items);

        if (items.length === 0) { return { success: true, code: 0, message: 'No products found to delete.' }; }
        // Delete items in batches
        const deleteRequests = items.map(item => ({
            DeleteRequest: { Key: { code: item.code, id: item.id } }
        }));

        // DynamoDB batchWrite
        while (deleteRequests.length > 0) {
            const batchParams = { RequestItems: { [tableName]: deleteRequests.splice(0, 25) } };
            await dynamoDB.batchWrite(batchParams).promise();
        }

        return { success: true, code: 0, message: 'All products deleted successfully.' };
    } catch (error) {
        console.error('Error resetting products:', error);
        return { success: false, code: 2103, message: 'Error resetting products', error };
    }
};

module.exports = {
    createProduct,
    requestProduct,
    getProduct,
    deleteProduct,
    updateProduct,
    resetProduct,
};
