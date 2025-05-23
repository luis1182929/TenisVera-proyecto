(function (window) {
  const locale = window.Shopify?.routes?.root || "/";
  const readyStates = ["complete", "interactive", "loaded"];
  if (readyStates.indexOf(document.readyState) >= 0) {
    onDocummentLoaded();
  } else {
    document.addEventListener("DOMContentLoaded", onDocummentLoaded);
  }

  function onDocummentLoaded() {
    if (
      window.connectif &&
      window.connectif.managed &&
      window.connectif.managed.isInitialized()
    ) {
      onConnectifStarted();
    } else {
      document.addEventListener(
        "connectif.managed.initialized",
        onConnectifStarted
      );
    }
  }

  async function onConnectifStarted() {
    if (!cartCNContext.cartCNTrackerIsSet) {
      await window.cnHelper.updateTrackerInCart();
    }
    if (!cartCNContext.cartIdSet) {
      await window.cnHelper.updateCartId();
    }
    window.cnHelper.addTrackerOnChange();
    window.cnHelper.addDomAndTrackerRequest(
      XMLHttpRequest.prototype.send,
      createDom
    );
  }

  function createDom(cart) {
    const domCnCart = document.createElement("div");
    domCnCart.className = "cn_cart";
    domCnCart.style.display = "none";
    if (!cart) {
      return domCnCart;
    }
    const cartId = cart.attributes?.cartId || 0;
    let innerHTML =
      `<span class="cart_id">${cartId}</span>` +
      '<span class="total_price">' +
      cart.total_price / 100 +
      "</span>" +
      '<span class="total_quantity">' +
      cart.item_count +
      "</span>";
    if (cart.item_count > 0) {
      innerHTML +=
        '<span class="cart_recovery_url">' +
        document.location.origin +
        locale +
        "cart/";
      cart.items.reverse().forEach(function (item) {
        innerHTML += item.variant_id + ":" + item.quantity + ",";
      });
      innerHTML = innerHTML.slice(0, -1);
      innerHTML += "?storefront=true</span>";
    }
    cart.items.forEach(function (item) {
      var productId = item.variant_id;
      if (cartCNContext.useSku && item.sku) {
        productId = item.sku;
      }
      innerHTML +=
        '<div class="product_basket_item">' +
        '<span class="quantity">' +
        item.quantity +
        "</span>" +
        '<span class="price">' +
        item.final_line_price / 100 +
        "</span>" +
        '<span class="name">' +
        escapeHtml(item.title) +
        "</span>" +
        '<span class="url">' +
        document.location.origin +
        item.url +
        "</span>" +
        '<span class="product_id">' +
        productId +
        "</span>" +
        '<span class="unit_price">' +
        item.final_price / 100 +
        "</span>" +
        '<span class="image_url">' +
        item.image +
        "</span>" +
        '<span class="description">' +
        escapeHtml(item.product_description) +
        "</span>" +
        '<span class="brand">' +
        escapeHtml(item.vendor) +
        "</span>" +
        '<span class="thumbnail_url">' +
        item.image +
        "</span>" +
        "</div>";
    });
    domCnCart.innerHTML = innerHTML;
    return domCnCart;

    function escapeHtml(html) {
      const text = document.createTextNode(html);
      const p = document.createElement("p");
      p.appendChild(text);
      return p.innerHTML;
    }
  }
})(window);
