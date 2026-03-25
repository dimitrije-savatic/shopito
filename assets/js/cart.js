const DATA_URL = "assets/data/products.json";
const CART_KEY = "cart";
const MIN_QTY = 1;
const MAX_QTY = 5;

let allProducts = [];

$(document).ready(function () {
    loadProducts();
    bindCartEvents();
});

function loadProducts() {
    $.ajax({
        url: DATA_URL,
        method: "get",
        dataType: "json",
        success: function (data) {
            allProducts = data;
            renderCart();
        },
        error: function (xhr) {
            console.error("Error loading products:", xhr);
        }
    });
}

function bindCartEvents() {
    $("#checkoutButton").click(function () {
        clearCart();
        showToast("Thank you for your purchase!", "success");
    });

    $("#cancelButton").click(function () {

        if (confirm("Are you sure you want to cancel the purchase?")) {
            if (getCart().length === 0) {
                showToast("Your cart is already empty.", "info");
                return;
            }
            clearCart();
            showToast("Purchase cancelled.", "danger");
        }
    });
}

function getCart() {
    let data = localStorage.getItem(CART_KEY);
    if (!data) {
        return [];
    }
    return JSON.parse(data);
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCart() {
    let cart = getCart();
    let html = "";
    let container = document.querySelector("#cartContainer");
    if (cart.length === 0) {
        html += `<div class="card p-2 d-flex align-items-center">
                    <div class="row align-items-center justify-content-around g-2">
                        <p class='text-center text-secondary mb-0'>Your cart is empty.</p>
                    </div>
                </div>`;
    } else {
        html += `<div class="card mb-3 p-2">
                    <div class="row align-items-center justify-content-around g-2">
                        <div class="col-2 text-center">
                        </div>
                        <div class="col-2">
                            <h6 class="text-center mb-0">Title</h6>
                        </div>
                        <div class="col-2 d-flex align-items-center justify-content-center">
                            <h6 class="text-center mb-0 mx-1">Quantity</h6>
                        </div>
                        <div class="col-2">
                            <h6 class="text-center mb-0">Discount</h6>
                        </div>
                        <div class="col-2">
                            <h6 class="text-center mb-0">Price</h6>
                        </div>
                        <div class="col-2 text-center">
                            <h6 class="text-center mb-0"><i class="fas fa-trash-alt"></i></h6>
                        </div>
                    </div>
                </div>`;
        for (let i = 0; i < cart.length; i++) {
            let item = cart[i];
            let product = allProducts.find(p => p.id === item.productId);
            let minusDisabled = '';
            let plusDisabled = '';
            if (item.quantity <= MIN_QTY) {
                minusDisabled = `disabled`;
            }

            if (item.quantity >= MAX_QTY) {
                plusDisabled = `disabled`;
            }
            if (product) {
                html += `
            <div class="card mb-3 p-2">
                <div class="row align-items-center justify-content-around g-2">

                    <!-- Image -->
                    <div class="col-2 text-center">
                        <img src="${product.image}" class="img-fluid rounded" alt="${product.title}">
                    </div>

                    <!-- Title -->
                    <div class="col-2">
                        <h6 class="text-center mb-0">${product.title}</h6>
                    </div>

                    <!-- Quantity -->
                    <div class="col-2 d-flex align-items-center justify-content-center">
                        <button class="btn btn-success" onclick="changeQuantity(${item.productId}, -1)" ${minusDisabled}>-</button>
                        <h6 class="text-center mb-0 mx-1">${item.quantity}</h6>
                        <button class="btn btn-success" onclick="changeQuantity(${item.productId}, 1)" ${plusDisabled}>+</button>
                    </div>

                    <!-- Price -->
                    <div class="col-2">
                        <h6 class="text-center mb-0 mx-5 py-2 text-white bg-danger rounded">-${product.discount}%</h6>
                    </div>

                    <!--Full Price-->
                    <div class="col-2">
                        <h6 class="text-center mb-0">$${(product.price * item.quantity).toFixed(2)}</h6>
                    </div>

                    <!-- Delete button -->
                    <div class="col-2 text-center">
                        <button class="btn btn-danger" onclick="removeFromCart(${item.productId})">X</button>
                    </div>

                </div>
            </div>`;
            }
        }
    }
    if (container) {
        container.innerHTML = html;
    }
    showTotalPrice();
    showTotalDiscount();
    showCartQuantity();
}

function showTotalPrice() {
    let cart = getCart();
    let total = cart.reduce((sum, item) => {
        let product = allProducts.find(p => p.id === item.productId);
        return sum + (product.price * item.quantity);
    }, 0).toFixed(2);
    let container = document.querySelector("#totalPrice");
    if (container) {
        container.textContent = `$${total}`;
    }
}

function showTotalDiscount() {
    let container = document.querySelector("#discountPrice");
    let totalDiscount = 0;
    let cart = getCart();
    for (let item of cart) {
        let product = allProducts.find(p => p.id === item.productId);
        if (product.discount) {
            totalDiscount += product.discount;
        }
    }
    totalDiscount = totalDiscount / cart.length || 0;
    if (container) {
        container.textContent = `-${totalDiscount.toFixed(0)}%`;
    }
}

function addToCart(productId) {
    let cart = getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        if (item.quantity < MAX_QTY) {
            item.quantity++;
            showToast("Item quantity increased.", "success");
        } else {
            showToast("Maximum quantity reached.", "warn");
        }
    } else {
        cart.push({ productId: productId, quantity: 1 });
        showToast("Item added to cart.", "success");
    }
    saveCart(cart);
    renderCart();
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(i => i.productId !== productId);
    saveCart(cart);
    renderCart();
    showToast("Item removed from cart.", "success");
}

function changeQuantity(productId, delta) {
    let cart = getCart();
    let item = cart.find(i => i.productId === productId);
    if (item) {
        let newQty = item.quantity + delta;
        if (newQty >= MIN_QTY && newQty <= MAX_QTY) {
            item.quantity = newQty;
            saveCart(cart);
            renderCart();
        }
    }
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    renderCart();
    showToast("Cart cleared.", "success");
}

function showToast(message, type) {
    let toast = document.createElement("div");
    toast.className = "shop-toast bg-" + type;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.add("show");
    });

    setTimeout(function () {
        toast.classList.remove("show");
        setTimeout(function () {
            toast.remove();
        }, 220);
    }, 1800);
}