const BASE_URL = 'assets/data/';
const PRODUCTS_URL = "products.json";
const CATEGORIES_URL = "categories.json";

let productsData = [];
let categoriesData = [];


$(document).ready(function () {
    fetchData(CATEGORIES_URL, renderCategories);
    fetchData(PRODUCTS_URL, renderProducts);
});

// Fetch data from the API
function fetchData(url, renderFunction) {
    $.ajax({
        url: `${BASE_URL}${url}`,
        method: 'GET',
        dataType: 'json',
        success: renderFunction,
        error: function (xhr) {
            console.error(xhr);
        },
    });
}

function renderCategories(data) {
    categoriesData = data;
    renderCategoriesOfMonth();
}

function renderProducts(data) {
    productsData = data;
    renderFeaturedProducts();
}

function renderCategoriesOfMonth() {
    let container = $("#categoriesOfTheMonth");
    let categories = categoriesData.slice(0, 3);
    container.empty();
    categories.forEach(cat => {
        let item = `<div class="col-12 col-md-4 p-5 mt-3">
               <img src="./assets/img/categories/${cat.id}.jpg" class="rounded img-fluid border">
                <h5 class="text-center mt-3 mb-3">${cat.name}</h5>
                <p class="text-center"><a class="btn btn-success" href="shop.html">Go Shop</a></p>
            </div>`;
        container.append(item);
    })
}

function renderFeaturedProducts() {
    let container = $("#featuredProducts");
    let products = productsData.filter(p => p.featured === true);
    container.empty();
    products.forEach(product => {
        let stars = "";
        let rating = Math.round(product.rating);
        for (let i = 0; i < rating; i++) {
            stars += `<i class="text-warning fa fa-star"></i>`;

        }
        if (rating < 5) {
            for (let i = 0; i < 5 - rating; i++) {
                stars += `<i class="text-muted fa fa-star"></i>`;
            }
        }
        const item = `<div class="col-12 col-md-4 mb-4">
                    <div class="card h-100">
                        <a href="shop.html">
                            <img src="${product.image}" class="card-img-top border-bottom" alt="${product.title}">
                        </a>
                        <div class="card-body">
                            <ul class="list-unstyled d-flex justify-content-between">
                                <li>
                                    ${stars}
                                </li>
                                <li class="text-muted text-right">$${getDiscountedPrice(product.price, product.discount)}</li>
                            </ul>
                            <a href="shop.html" class="h2 text-decoration-none text-dark">${product.title}</a>
                            <p class="card-text">
                                ${product.description.length > 100 ? product.description.substring(0, 100) + "..." : product.description}
                            </p>
                        </div>
                    </div>
                </div>`;
        container.append(item);
    })
}

function getDiscountedPrice(price, discount) {
    if (discount) {
        return (price - (price * discount / 100)).toFixed(2);
    }
    return price.toFixed(2);
}