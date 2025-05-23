/* eslint-disable @typescript-eslint/await-thenable */
(function (window) {
  const locale = window.Shopify?.routes?.root || "/";

  if (window.cnHelper) {
    return;
  }
  window.cnHelper = (function () {
    let setCartAttributeRequest = false;
    async function setCartAttribute(data) {
      if (setCartAttributeRequest !== false) {
        await setCartAttributeRequest;
        setCartAttributeRequest = false;
      }

      setCartAttributeRequest = fetch("/cart/update.js", {
        method: "POST",
        body: JSON.stringify({
          attributes: data,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    async function updateTrackerInCart() {
      const storageTracker = await connectif.getAsync("cn_tracker");
      const tracker = JSON.parse(storageTracker || null);
      if (tracker && tracker.id) {
        setCartAttribute({ connectifTrackerId: tracker.id });
      }
    }

    async function addConnectifStoreIdToCart(connectifStoreId) {
      if (connectifStoreId) {
        setCartAttribute({ connectifStoreId });
      }
    }

    async function addConnectifIsTrackedPurchase(isTrackedPurchase) {
      setCartAttribute({ isTrackedPurchase });
    }

    function updateCartId() {
      const cartId = document.querySelector(
        "div.cn_cart > span.cart_id"
      ).textContent;
      if (cartId) {
        setCartAttribute({ cartId });
      }
    }

    function addTrackerOnChange() {
      document.addEventListener("connectif.managed.tracker_changed", () => {
        setTimeout(updateTrackerInCart, 1);
      });
    }

    function addDomAndTrackerRequest(send, createDom) {
      const requestListenUrls = [
        "/cart/add",
        "/cart/update",
        "/cart/change",
        "/cart/clear",
      ];
      // Fetch request.
      const constantMock = window.fetch;
      window.fetch = function () {
        const [url, params] = arguments;
        if (
          requestListenUrls.some((listenUrl) =>
            url?.toString().includes(listenUrl)
          ) &&
          params.method === "POST"
        ) {
          return constantMock.apply(this, arguments).then((response) => {
            createAndAddTracker();
            return response;
          });
        } else {
          return constantMock.apply(this, arguments);
        }
      };

      XMLHttpRequest.prototype.send = function (data) {
        const _this = this;
        if (
          _this._method === "POST" &&
          requestListenUrls.some((listenUrl) => _this._url.includes(listenUrl))
        ) {
          _this.addEventListener("readystatechange", readyStateChangeHandler);
        }
        send.call(_this, data);

        function readyStateChangeHandler() {
          if (_this.readyState === 4) {
            createAndAddTracker();
            _this.removeEventListener(
              "readystatechange",
              readyStateChangeHandler
            );
          }
        }
      };

      async function createAndAddTracker() {
        const cart = await getCart();
        if (!cart) {
          return;
        }
        createCartDom(cart);
      }

      async function getCart() {
        const response = await fetch(locale + "cart.js");
        if (response.ok) {
          return response.json();
        } else {
          return false;
        }
      }

      function createCartDom(cart) {
        const domCnCart = createDom(cart);
        const existingDomCnCart = document.querySelector(".cn_cart");
        if (existingDomCnCart) {
          existingDomCnCart.parentNode.replaceChild(
            domCnCart,
            existingDomCnCart
          );
        } else {
          document.body.appendChild(domCnCart);
        }
        window.connectif.managed.sendEvents([]);
      }
    }

    setTimeout(() => {
      triggerEvent(window.document, "cnHelper.loaded");
    }, 1);

    function triggerEvent(doc, eventName) {
      if (typeof window.CustomEvent === "function" && doc) {
        doc.dispatchEvent(new window.CustomEvent(eventName, {}));
      }
    }

    return {
      addTrackerOnChange,
      updateTrackerInCart,
      updateCartId,
      addDomAndTrackerRequest,
      addConnectifStoreIdToCart,
      addConnectifIsTrackedPurchase,
    };
  })();
})(window);
