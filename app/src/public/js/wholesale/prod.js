document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('updateButton').addEventListener('click', updateProduct);
    document.getElementById('createButton').addEventListener('click', createProduct);
});

function createProduct() {
    const productName = document.getElementById('prodName').value;
    const productPrice = document.getElementById('prodPrice').value;
    const productMinCnt = document.getElementById('minCnt').value;
    const productUnitCnt = document.getElementById('unitCnt').value;
    const productOpt = document.getElementById('opt').value;

    const data = {};
    if (productName) data.name = productName;
    if (productPrice) data.price = productPrice;
    if (productMinCnt) data.minCnt = productMinCnt;
    if (productUnitCnt) data.unitCnt = productUnitCnt;
    if (productOpt) data.opt = productOpt.split(',').map(opt => opt.trim());

    console.log(data);

    fetch('/product/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const resultMessage = document.getElementById('resultMessage');
        if (result.success) {
            resultMessage.textContent = 'Product created successfully';
            resultMessage.style.color = 'green';
        } else {
            resultMessage.textContent = `Product creation failed: ${result.message}`;
            resultMessage.style.color = 'red';
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateProduct() {
    const productId = document.getElementById('prodCode').value;
    const productName = document.getElementById('prodName').value;
    const productPrice = document.getElementById('prodPrice').value;
    const productMinCnt = document.getElementById('minCnt').value;
    const productUnitCnt = document.getElementById('unitCnt').value;
    const productOpt = document.getElementById('opt').value;

    if (!productId) {
        alert("Product ID is required for updating");
        return;
    }

    const data = {};
    if (productName) data.name = productName;
    if (productPrice) data.price = productPrice;
    if (productMinCnt) data.minCnt = productMinCnt;
    if (productUnitCnt) data.unitCnt = productUnitCnt;
    if (productOpt) data.opt = productOpt.split(',').map(opt => opt.trim());

    fetch(`/product/update/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        const resultMessage = document.getElementById('resultMessage');
        if (result.success) {
            resultMessage.textContent = 'Product updated successfully';
            resultMessage.style.color = 'green';
        } else {
            resultMessage.textContent = `Product update failed: ${result.message}`;
            resultMessage.style.color = 'red';
        }
    })
    .catch(error => console.error('Error:', error));
}