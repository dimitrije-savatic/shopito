// constants
const BASE_URL = 'assets/data/';
const FAVOURITES_KEY = 'favourite_products';

// Global variables to store fetched data
let productsData = [];
let categoriesData = [];
let brandsData = [];
let favouriteIds = [];
let currentPage = 1;

//Global variables to store url parameters
let productUrl = "products.json";
let categoryUrl = "categories.json";
let brandsUrl = "brands.json";


$(document).ajaxStart(function () {
    $("#loader").show();
});

$(document).ajaxStop(function () {
    $("#loader").hide();
});
// Load data
$(document).ready(function () {
    bindShopEvents();
    loadFavourites();
    fetchData(brandsUrl, renderBrands);
    fetchData(categoryUrl, renderCategories);
    fetchData(productUrl, renderProducts);
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

function renderBrands(data) {
    brandsData = data;
    showBrands();
}

function renderCategories(data) {
    categoriesData = data;
    showCategories();
}

function renderProducts(data) {
    productsData = data;
    showProducts();
}



//bind events
function bindShopEvents() {
    $("#categories").on("change", function () {
        showProducts();
    });

    $("#sortProducts").on("change", function () {
        showProducts();
    });

    $("#brands").on("change", function () {
        showProducts();
    });

    $("#minPrice").on("keyup", function () {
        showProducts();
    });

    $("#maxPrice").on("keyup", function () {
        showProducts();
    });

    $("#rating").on("change", function () {
        showProducts();
    });

    $("#discountedOnly").on("change", function () {
        showProducts();
    });

    $("#products").on("click", ".favourite-btn", function () {
        const productId = Number($(this).data("id"));
        toggleFavourite(productId);
        showProducts();
    });

    $("#pagination").on("click", ".page-item", function () {
        currentPage = Number($(this).data("id"));
        showProducts();
    })

    $("#showFavourites").on("change", function () {
        showProducts();
    })

    $("#productsPerPage").on("change", function () {
        showProducts();
    })

    $("#search").on("keyup", function () {
        showProducts();
    })
}

// render products on the page

function showProducts() {
    const container = $('#products');
    const noResults = $("#noResults");
    container.empty();

    let filteredProducts = getfilteredProducts();
    filteredProducts = sortProducts(filteredProducts);
    setupPagination(filteredProducts);
    let paginatedProducts = paginateProducts(filteredProducts, currentPage);


    if (filteredProducts.length === 0) {
        noResults.removeClass("hidden");
        return;
    }

    noResults.addClass("hidden");


    paginatedProducts.forEach(product => {
        const isFavourite = favouriteIds.includes(product.id)

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
        const card = `<div class="col-md-4">
                        <div class="card mb-4 product-wap rounded-0">
                            <div class="card rounded-0">
                                <img class="card-img rounded-0 img-fluid" src="${product.image}">
                                <div
                                    class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                                    <ul class="list-unstyled">
                                        <li><button class="btn btn-success text-white favourite-btn" data-id="${product.id}"><i
                                                    class="${isFavourite ? "fas" : "far"} fa-heart" id="favourite-${product.id}"></i></button></li>
                                        <li><button class="btn btn-success text-white mt-2" onclick="addToCart(${product.id})"><i
                                                    class="fas fa-cart-plus"></i></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="card-body">
                                <a href="shop-single.html" class="h3 text-decoration-none">${product.title}</a>
                                <ul class="list-unstyled d-flex justify-content-center">
                                <li id="stars-${product.id}">
                                    ${stars}  
                                </li>
                                </ul>
                                <div class="d-flex ${product.discount ? 'justify-content-around' : 'justify-content-center'} mb-3">
                                <p class="text-center mb-0 text-decoration-line-through text-danger">${product.discount ? `$${product.price.toFixed(2)}` : ''}</p>
                                <p class="text-center mb-0">$${getDiscountedPrice(product.price, product.discount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>`;
        container.append(card);
    });
}

function getDiscountedPrice(price, discount) {
    if (discount) {
        return (price - (price * discount / 100)).toFixed(2);
    }
    return price.toFixed(2);
}

function showCategories() {
    const container = $('#categories');
    container.empty();
    var item = `<option value="all">All Categories</option>`;
    container.append(item);
    categoriesData.forEach(category => {
        item = `<option value="${category.id}">${category.name}</option>`;
        container.append(item);
    });
}

function showBrands() {
    const container = $('#brands');
    container.empty();
    var item = `<option value="all">All Brands</option>`;
    container.append(item);
    brandsData.forEach(brand => {
        item = `<option value="${brand.id}">${brand.name}</option>`;
        container.append(item);
    });
}

function sortProducts(products) {

    const sortValue = $("#sortProducts").val();
    const sortedProducts = [...products];

    sortedProducts.sort(function (a, b) {
        if (sortValue === "title-asc") {
            return a.title.localeCompare(b.title);
        }

        if (sortValue === "title-desc") {
            return b.title.localeCompare(a.title);
        }

        if (sortValue === "price-asc") {
            return getDiscountedPrice(a.price, a.discount) - getDiscountedPrice(b.price, b.discount);
        }

        if (sortValue === "price-desc") {
            return getDiscountedPrice(b.price, b.discount) - getDiscountedPrice(a.price, a.discount);
        }

        if (sortValue === "rating-desc") {
            return b.rating - a.rating;
        }

        return a.id - b.id;
    });

    return sortedProducts;
}

function getfilteredProducts() {
    let Selectedcategory = $("#categories").val();
    let SelectedBrand = $("#brands").val();
    let priceMin = Number($("#minPrice").val());
    let priceMax = Number($("#maxPrice").val());
    let SelectedRating = $("#rating").val();
    let OnSale = $("#discountedOnly").is(":checked");
    let favourites = $("#showFavourites").is(":checked");
    let searchTerm = $("#search").val().trim().toLowerCase();

    return productsData.filter(function (p) {
        const matchesCategory = Selectedcategory === "all" || Number(Selectedcategory) === p.categoryId
        const matchesBrand = SelectedBrand === "all" || Number(SelectedBrand) === p.brandId
        const matchesPriceMin = p.price >= priceMin
        const matchesPriceMax = priceMax == 0 || p.price <= priceMax
        const matchesRating = Number(SelectedRating) <= Math.round(p.rating);
        const matchesOnSale = !OnSale || p.discount > 0
        const matchesFavourites = !favourites || favouriteIds.includes(p.id);
        const matchesSearchTerm = p.title.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm)
        return matchesCategory && matchesBrand && matchesPriceMin && matchesPriceMax && matchesRating && matchesOnSale && matchesFavourites && matchesSearchTerm;
    })
}

function loadFavourites() {
    const savedFavourites = localStorage.getItem(FAVOURITES_KEY);
    if (savedFavourites) {
        try {
            favouriteIds = JSON.parse(savedFavourites);
        } catch (error) {
            favouriteIds = [];
        }
    }
}

function toggleFavourite(productId) {

    if (favouriteIds.includes(productId)) {
        favouriteIds = favouriteIds.filter(id => id !== productId);
    } else {
        favouriteIds.push(productId);
    }

    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favouriteIds));
}

function paginateProducts(products, page) {
    const paginatedProducts = [...products];
    let perPage = Number($("#productsPerPage").val());

    const start = (page - 1) * perPage;
    const end = start + perPage;
    let sliced = paginatedProducts.slice(start, end);
    return sliced;
}

function setupPagination(data) {
    let perPage = Number($("#productsPerPage").val());
    const totalPages = Math.ceil(data.length / perPage);
    const pagination = document.querySelector('#pagination');

    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<li class="page-item" data-id="${i}">
                                    <a id="page-${i}" class="page-link ${currentPage == i ? 'active text-white' : ''} text-dark rounded-0 mr-3 shadow-sm border-top-0 border-left-0"
                                        href="#">${i}</a>
                                </li>`;
    }
}