document.addEventListener("DOMContentLoaded", () => {
    const cartItems = [];

    // Function to update the cart UI
    function updateCartUI() {
        const cartSection = document.querySelector(".cart-items");
        cartSection.innerHTML = "";

        if (cartItems.length === 0) {
            cartSection.innerHTML = "<p>장바구니가 비어 있습니다.</p>";
        } else {
            cartItems.forEach((item, index) => {
                const itemElement = document.createElement("div");
                itemElement.classList.add("cart-item");
                itemElement.innerHTML = `
                    <p>${item.name} (${item.quantity}개) - ${(item.price * item.quantity).toLocaleString()}원</p>
                    <button class="remove-btn" data-index="${index}">제거</button>
                `;
                cartSection.appendChild(itemElement);
            });

            const removeButtons = document.querySelectorAll(".remove-btn");
            removeButtons.forEach(button => {
                button.addEventListener("click", removeItemFromCart);
            });
        }
    }

    // Function to add an item to the cart
    function addItemToCart(name, price, quantity) {
        const existingItem = cartItems.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({ name, price, quantity });
        }
        updateCartUI();
    }

    // Function to remove an item from the cart
    function removeItemFromCart(event) {
        const index = event.target.getAttribute("data-index");
        cartItems.splice(index, 1);
        updateCartUI();
    }

    // Function to send order to server
    function sendOrder() {
        const orderContent = cartItems.map(item => ({
            code: item.code,
            name: item.name,
            cnt: item.quantity
        }));

        const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

        const orderData = {
            wholesale,
            retail,
            order: {
                content: orderContent,
                price: totalPrice
            }
        };

        fetch('/order/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('주문이 성공적으로 접수되었습니다.');
                cartItems.length = 0;
                updateCartUI();
            } else {
                alert('주문에 실패했습니다: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('주문 중 오류가 발생했습니다.');
        });
    }

    // Event listeners for "Add to Cart" buttons
    const cartButtons = document.querySelectorAll(".cart-btn");
    cartButtons.forEach(button => {
        button.addEventListener("click", function() {
            const row = this.closest("tr").previousElementSibling;
            const productName = row.querySelector("td:nth-child(2)").innerText;
            const productPrice = parseInt(row.querySelector("td:nth-child(3)").innerText.replace(/[^0-9]/g, ""));
            const quantityInput = row.nextElementSibling.querySelector("input[name='quantity']");
            const quantity = parseInt(quantityInput.value);

            addItemToCart(productName, productPrice, quantity);
        });
    });

    // Event listener for "Order" button
    const orderButton = document.getElementById("orderButton");
    orderButton.addEventListener("click", sendOrder);

    // Initialize the cart UI
    updateCartUI();
});