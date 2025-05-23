
    (function() {
      var baseURL = "https://cdn.shopify.com/shopifycloud/checkout-web/assets/";
      var scripts = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/polyfills.I3JIKAFZ.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/app.CyDRldQm.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/page-OnePage.CwFXfJX-.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/DeliveryMethodSelectorSection.DNyS0q02.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/useEditorShopPayNavigation.LkBQZFlz.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/VaultedPayment.D1z7LKvr.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/LocalizationExtensionField.D4QzR7rO.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/ShopPayOptInDisclaimer.CI9Yhs9T.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/UnavailableInBuyerLocationBanner.CQE0yjGi.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/ShipmentBreakdown.Hu4afHoH.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/use-show-shipment-breakdown.9fsyzXKp.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/MerchandiseModal.B0yN0b2n.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/PayButtonSection.DYhdUy97.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/component-ShopPayVerificationSwitch.BeX0CNbs.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/useSubscribeMessenger.BBD8iU4E.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/index.O62Cp4uC.js"];
      var styles = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/assets/app.CSP-wVPl.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/assets/OnePage.PMX4OSBO.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/assets/DeliveryMethodSelectorSection.DmqjTkNB.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/assets/useEditorShopPayNavigation.DCOTvxC3.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/assets/VaultedPayment.OxMVm7u-.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/assets/use-show-shipment-breakdown.CKAakmU8.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.es/assets/ShopPayVerificationSwitch.DW7NMDXG.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0763/9577/4257/files/PADEL-PRO-LOGO_BLACK_x320.png?v=1718726047"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [baseURL].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  