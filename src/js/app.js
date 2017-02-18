'use strict';

// history object
let AppHistory;

// global variable to hold query params
const queryParams = (function __queryParams() {
    var _queryParams = {};

    return {
        setParams: function (params = {}) {
            _queryParams = params;
        },

        getParams: function () {
            return _queryParams;
        }
    }
})();

// global variable for endpoints

const endpoints = {
    getProducts: window.products
};

// Util functions
// 1. Ajax wrapper
const Ajax = {};

Ajax.get = function (url, cb) {
    const httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        alert('Cant hit the request');
        return false;
    }

    httpRequest.onreadystatechange = cb;
    httpRequest.open('GET', url);
    httpRequest.send();
};

// 2. create query object from the string

function parseQueryString(queryString) { // starts with ?
    const queryObject = {};

    let tempString = queryString.slice(1, queryString.length);

    tempString = tempString.split('&'); // got individual query

    // looping through them

    tempString.forEach(function (q) {
        const tempArr = q.split('=');
        queryObject[tempArr[0]] = tempArr[1];
    });

    return queryObject;
}

// Page specific code

function ProductPageHandler() {
    const defaultProductsToFetch = 3;
    let clickEventAdded = true;
    let _noOfProducts = defaultProductsToFetch; // by default the number is 3
    let _productDetails = [];

    function tableRowTemplate(product) {
        return (
            `<div class="display-tr product-page__list__item">
                <div class="display-td">
                    ${product.id}
                </div>
                <div class="display-td">
                    ${product.name}
                </div>
                <div class="display-td">
                    ${product.price} Rs
                </div>
                <div class="display-td">
                    <button data-id=${product.id} class="js-product-quick-view">
                        Quick View
                    </button>
                </div>
            </div>`
        );
    }


    function printProductDetails(id) {
        if (!id) {
            console.log(JSON.stringify(_productDetails));
            return;
        }

        _productDetails.some(function (p){
            if (id === p.id) {
                console.log(JSON.stringify(p));
                return true;
            }

            return false;
        });
    }


    function _printSearchedResults(searchQuery) {
        let filteredResultsHtml = '';

        _productDetails.forEach(function (p) {
            if (p.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1) {
                filteredResultsHtml = `${filteredResultsHtml}${tableRowTemplate(p)}`;
            }
        });

        const searchResultsContainer = document.getElementById('js-search-results-container');

        if (filteredResultsHtml && searchQuery) {
            searchResultsContainer.classList.remove('hide');

            // get the mounting element
            // and add the results
            const element = document.getElementById('js-product-search-list');
            element.innerHTML = filteredResultsHtml;
        } else {
            searchResultsContainer.classList.add('hide');
        }

        _bindClickEvents();

    }


    /**
     * For all bind click events
     */
    function _bindClickEvents() {
        // action to get the full result
        const getResultsAction = document.getElementById('js-get-results');

        getResultsAction.addEventListener('click', function () {
            window.location.href = 'index.html?noOfProducts=all';
        });


        // action to console individual product details

        const productQuickView = document.getElementsByClassName('js-product-quick-view');

        for (let i = 0; i < productQuickView.length; ++i) {
            const element = productQuickView[i];

            element.addEventListener('click', function (e) {
                const productId = e.currentTarget.getAttribute('data-id');
                printProductDetails(productId);
            }, false);
        }

        // bind input element

        const productInput = document.getElementById('js-product-input');

        productInput.addEventListener('input', function (e) {
            _printSearchedResults(e.target.value);
        });

    }


    function _setQueryParams() {
        // get query params
        queryParams.setParams(parseQueryString(location.search));
    }


    /**
     * business logic to fetch the products
     * @private
     */
    function _getProductDetails() {
        // set the no of products to be fetched
        _noOfProducts = queryParams.getParams().noOfProducts || defaultProductsToFetch;

        // Tried doing the ajax call, but cross origin issues were coming
        //Ajax.get(endpoints.getProducts, _parseAndRender);

        _productDetails = endpoints.getProducts;

        if (_noOfProducts === 'all') {
            return;
        } else {
            _productDetails = _productDetails.slice(0, _noOfProducts);
        }
    }


    /**
     * logic to render the html based on the state
     * @private
     */
    function _render() {
        // render the html with the data in the state

        let productDetailsHtml = '';

        _productDetails.forEach(function (p) {
            productDetailsHtml = `${productDetailsHtml}${tableRowTemplate(p)}`;
        });


        // get the mounting element
        // and add the results
        const element = document.getElementById('js-product-list');
        element.innerHTML = productDetailsHtml;

        // hide the get results btn if all the results are shown
        const getResultsAction = document.getElementById('js-get-results');

        if (_noOfProducts === 'all') {
            if (!getResultsAction.classList.contains('hide')) {
                getResultsAction.classList.add('hide');
            }
        }
    }


    return {
        init: function () {
            // get the query params and create the request obj
            _setQueryParams();

            // get product details
            _getProductDetails();


            // call render
            _render();

            // bind click events

            _bindClickEvents();
        }
    };
}

// secure window objects


// start rendering the page
const productPage = ProductPageHandler();

productPage.init();

