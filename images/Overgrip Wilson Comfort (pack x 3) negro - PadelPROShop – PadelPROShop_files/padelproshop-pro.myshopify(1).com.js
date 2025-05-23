window.oct8neIntegration = {};
window.oct8neIntegration.baseUrl = "https://padelproshop-pro.myshopify.com";
window.oct8neIntegration.proxyUrl = "https://oct8neproxy.azurewebsites.net";

window.oct8neIntegration.get = function (options, done) {
    var url = options.url;
    var body = options.body;
    var headers = options.headers;

    // On ready callback
    let onReady = function (xhttp) {
        let status = xhttp.status;
        let data = xhttp.response;
        let ret = { status, data };
        done(ret);
    };

    // Send post
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function (e) {
        if (e.target.readyState === 4) onReady(e.target);
    };

    // Open and send
    xhttp.open("GET", url, true);

    // Set headers
    if (headers !== undefined) {
        for (let key in headers) {
            let value = headers[key];
            xhttp.setRequestHeader(key, value)
        }
    }

    // Send request
    if (body === undefined) xhttp.send();
    else xhttp.send(body);
};

window.oct8neIntegration.getCartInfo = function (onDone) {
    window.oct8neIntegration.getShopifyCart(function (shopifyCart) {
        // Map items
        var items = shopifyCart.items.map(x => {
            let internalId = x.product_id;
            let title = x.title;
            let qty = x.quantity;
            let price = (x.price / 100).toString();

            let ret = { internalId, title, qty, price };
            return ret;
        });

        // Map root
        let price = shopifyCart.total_price;
        let finalPrice = shopifyCart.original_total_price;
        let currency = shopifyCart.currency;
        let totalItems = shopifyCart.item_count;
        let cart = items;

        // Final ojbect
        let ret = { price, finalPrice, currency, totalItems, cart };
        onDone(ret);
    });
}

window.oct8neIntegration.getShopifyCart = function (onDone) {
    let url = `/cart.js`;
    window.oct8neIntegration.get({ url: url }, function (result) {
        if (result.status !== 200) {
            console.error(result);
            onDone(null);
            return;
        }

        // Parse response and return
        var cartInfo = JSON.parse(result.data);
        onDone(cartInfo);
    });
}


window.oct8neIntegration.getCustomerInfo = function (onDone) {
    // 1.- Get cart
    let getCartCallback = function (shopifyCart) {
        window.oct8neIntegration.getShopifyCustomer(function (shopifyCustomer) {
            getCustomerCallback(shopifyCustomer, shopifyCart)
        })
    };

    // 2.- Get customer
    let getCustomerCallback = function (shopifyCustomer, shopifyCart) {

        if (shopifyCustomer === null) shopifyCustomer = {};

        // Map oct8ne object
        let id = shopifyCustomer.id;
        let firstName = shopifyCustomer.first_name;
        let lastName = shopifyCustomer.last_name;
        let email = shopifyCustomer.email;
        let wishList = null;

        // Map cart items
        var items = shopifyCart.items.map(x => {
            let internalId = x.product_id;
            let title = x.title;
            let formattedPrice = (x.price / 100).toString();
            let formattedPrevPrice = (x.original_price / 100).toString();
            let productUrl = x.url;
            let thumbnail = x.image;
            let qty = x.quantity;

            let ret = { internalId, title, formattedPrice, formattedPrevPrice, productUrl, thumbnail, qty };
            return ret;
        });
        let cart = items;

        let ret = { id, firstName, lastName, email, wishList, cart };
        onDone(ret);
    };

    // Execute all requests
    window.oct8neIntegration.getShopifyCart(getCartCallback);
};

window.oct8neIntegration.getShopifyCustomer = function (onDone) {
    // Try get customer id
    let customerId = null;
    try {
        customerId = ShopifyAnalytics.meta.page.customerId;
        if (customerId === undefined) customerId = null;
    } catch (e) { customerId = null; }

    // Do not continue if customer id was not found
    if (customerId === null) {
        onDone(null);
        return;
    }

    // Return customer id
    let url = `${window.oct8neIntegration.proxyUrl}/api/shopify/GetCustomer_FrontEnd?shopDomainWithProtocol=${window.oct8neIntegration.baseUrl}&customerId=${customerId}`;

    window.oct8neIntegration.get({ url }, function (response) {
        if (response.status !== 200) {
            console.error(response);
            onDone(null);
            return;
        }

        // Parse response
        let result = JSON.parse(response.data);
        onDone(result.customer);
    });
};

var oct8ne = null;
window.oct8neIntegration.loadOct8neScript = function () {
    // This will be replaced ==================
    var static = "static-eu.oct8ne.com/"; //CAREFUL CAMBIAR EN PROD
    var license = "EB044ADEABB5454E7A94A7355607AA25";
    var server = "backoffice-eu.oct8ne.com/";
    var locale = Shopify.locale;
    var currency = ShopifyAnalytics.meta.currency;
    var shopUrl = window.oct8neIntegration.baseUrl;
    var srcSuffix = "api/v2/oct8ne.js";
    var protocol = document.location.protocol;
    var seoFriendly = "";
    var shopCountrySettings = "False";
    // ==============================

    // Check everything was ok
    if (!static) throw 'Static was not defined';
    if (!license) throw 'license was not defined';
    if (!server) throw 'server was not defined';
    if (!shopUrl) throw 'shopUrl was not defined';

    //var staticurl = static + "api/v2/oct8ne.js";
    //var staticurl = static + "/api/source/js/api/v2/2.3/debug/oct8ne-api-V2.3.js";
    var staticurl = static + srcSuffix
    oct8ne = document.createElement("script");
    oct8ne.type = "text/javascript";
    oct8ne.src =
        (protocol == "https:" ? "https://" : "http://")
        + staticurl
        + '?' + (Math.round(new Date().getTime() / 86400000));
    oct8ne.async = true;
    oct8ne.license = license;
    oct8ne.server = server;
    oct8ne.baseUrl = shopUrl; // Dominio de la tienda
    oct8ne.checkoutUrl = shopUrl + '/cart'; // DE TIENDA
    oct8ne.loginUrl = shopUrl + '/account/login'; // DE TIENDA
    //oct8ne.checkoutSuccessUrl = shopUrl + '/thankyou'; // DE TIENDA
    oct8ne.locale = locale;
    oct8ne.currencyCode = currency;
    oct8ne.platform = "shopify";
    oct8ne.apiVersion = "2.4";

    oct8ne.urlStaticPixel = static;
    oct8ne.onProductAddedToCart = function (productId) {
        if (typeof ajaxCart != 'undefined') {
            ajaxCart.refresh();
        }
    };

    oct8ne.realUrlLocationHost = document.location.host;

    if (shopCountrySettings == "true") {
        oct8ne.options = { context: { country: Shopify.country } }
    }
    // If it is a product page
    var isShopifyProduct = ShopifyAnalytics.meta.page.pageType === 'product';
    if (isShopifyProduct) {
        var id = ShopifyAnalytics.meta.page.resourceId.toString();
        var image = "";

        var getJSON = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = function () {
                var status = xhr.status;
                if (status === 200) {
                    callback(null, xhr.response);
                } else {
                    callback(status, xhr.response);
                }
            };
            xhr.send();
        };
        try {
            getJSON(window.Shopify.routes.root + 'products/' + window.location.href.substring(window.location.href.lastIndexOf('/') + 1) + '.js',
                function (err, product) {
                    if (err !== null) {
                        oct8ne.currentProduct = { id, thumbnail: image };
                    } else {
                        if (product && product.images) {
                            image = product.images[0];
                        }
                        oct8ne.currentProduct = { id, thumbnail: image };
                    }
                    if (seoFriendly == "true") {
                        if (document.cookie.indexOf("oct8ne-room") == -1) {
                            setTimeout(insertOct8ne, 5000);
                            window.addEventListener('mousemove', insertOct8ne);
                            window.addEventListener('scroll', insertOct8ne);
                            window.addEventListener('click', insertOct8ne);
                            window.addEventListener('keydown', insertOct8ne);
                            window.addEventListener('touchstart', insertOct8ne);
                        } else {
                            insertOct8ne();
                        }
                    } else {
                        insertOct8ne();
                    }
                });
        } catch (e) {
            oct8ne.currentProduct = { id, thumbnail: image };
            if (seoFriendly == "true") {
                if (document.cookie.indexOf("oct8ne-room") == -1) {
                    setTimeout(insertOct8ne, 5000);
                    window.addEventListener('mousemove', insertOct8ne);
                    window.addEventListener('scroll', insertOct8ne);
                    window.addEventListener('click', insertOct8ne);
                    window.addEventListener('keydown', insertOct8ne);
                    window.addEventListener('touchstart', insertOct8ne);
                } else {
                    insertOct8ne();
                }
            } else {
                insertOct8ne();
            }
        }

    }
    else {
        if (seoFriendly == "true") {
            if (document.cookie.indexOf("oct8ne-room") == -1) {
                setTimeout(insertOct8ne, 5000);
                window.addEventListener('mousemove', insertOct8ne);
                window.addEventListener('scroll', insertOct8ne);
                window.addEventListener('click', insertOct8ne);
                window.addEventListener('keydown', insertOct8ne);
                window.addEventListener('touchstart', insertOct8ne);
            } else {
                insertOct8ne();
            }
        } else {
            insertOct8ne();
        }
    }

    // Make sure to init oct8ne when script was loaded
    oct8ne.onload = function () {
        if (!oct8ne.hasStarted) {
            oct8neInit();
            Oct8ne.Helpers.log("Oct8ne started on load event (possible JS error on page)", "warn");
        }
    }

    function insertOct8ne() {
        if (seoFriendly == "true") {
            if (!window.oct8neScriptInserted) {
                var s = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(oct8ne, s);
                window.oct8neScriptInserted = true;
                window.removeEventListener('mousemove', insertOct8ne);
                window.removeEventListener('scroll', insertOct8ne);
                window.removeEventListener('click', insertOct8ne);
                window.removeEventListener('keydown', insertOct8ne);
                window.removeEventListener('touchstart', insertOct8ne);
            }
        } else {
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(oct8ne, s);
        }
    }
}

window.oct8neIntegration.loadOct8neScript();