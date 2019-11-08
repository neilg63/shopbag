<template>
  <div
    id="app"
    :class="{'store-loaded': hasStore,'show-menu': showMenu,'show-detail': showDetail,'show-home': !showDetail,'scrolled-up': !scrolledDown,'page-up': !pageDown, 'show-microcart': showMicroCart}"
  >
    <header class="top-header">
      <div class="inner">
        <div class="bg-solid bg-element"></div>
        <div class="bg-transition bg-element"></div>
        <div class="bg-menu bg-element"></div>
        <div class="menu-toggle icon-menu top-icon" v-on:click.stop="toggleMenu()"></div>

        <lang-switcher :lang="lang"></lang-switcher>
        <div
          class="show-cart icon-shopping-cart top-icon"
          :class="{'has-items': numInCart > 0}"
          v-on:click="showCheckout()"
          v-on:mouseover="showMicro()"
          v-on:mouseleave="hideMicro()"
        >
          <span class="num">{{numInCart}}</span>
        </div>
        <div id="main-logo" class="main-logo" @click="logoAction()"></div>
        <div class="back-to back-to-main" v-on:click="backToMain()">
          <span class="text">Back</span>
        </div>
      </div>
    </header>
    <nav class="main-nav">
      <div class="menu-toggle icon-menu top-icon" v-on:click.stop="toggleMenu()"></div>
      <ul class="menu">
        <li v-for="item in menu" :key="item.link">
          <router-link v-bind:to="item.link">{{item.title}}</router-link>
        </li>
      </ul>
      <lang-switcher :lang="lang"></lang-switcher>
    </nav>
    <div v-if="numInCart > 0" class="micro-cart">
      <ul class="ordered-items plain">
        <li v-for="(item,oi) in orderedItems" :key="['oi',oi].join('-')">
          <span class="quantity">{{item.quantity}}</span>
          <em>x</em>
          <span class="title">{{item.name}}</span>
        </li>
      </ul>
      <p class="subtotal">{{subtotal|currency}}</p>
    </div>
    <div class="main">
      <div class="home-pane">
        <video-intro :videoSet="videoSet" />
        <sections :sections="sections"></sections>
        <slides />
        <vue-footer :menu="menu" :footer="footer" id="page-footer"></vue-footer>
      </div>
      <div class="detail-pane">
        <keep-alive>
          <router-view />
        </keep-alive>
        <vue-footer :menu="menu" :footer="footer" id="inner-page-footer"></vue-footer>
      </div>
    </div>
    <cookie-overlay :text="cookie.text" :accept="cookie.accept"></cookie-overlay>
  </div>
</template>
<script>
/*import Products from '@/components/Products'*/
import VideoIntro from "@/components/VideoIntro";
import Slides from "@/components/Slides";
import Sections from "@/components/Sections";
import VueFooter from "@/components/VueFooter";
import CookieOverlay from "@/components/CookieOverlay";
import LangSwitcher from "@/components/LangSwitcher";
import filters from "./mixins/filters";
import u from "./utils/utils";
export default {
  name: "App",
  components: {
    VideoIntro,
    Slides,
    Sections,
    VueFooter,
    LangSwitcher,
    CookieOverlay
  },
  mixins: [filters],
  data() {
    return {
      menu: [],
      showMenu: false,
      showDetail: false,
      products: [],
      numSections: 0,
      videoSet: {
        sizes: [],
        formats: [],
        background: {},
        foreground: {}
      },
      sections: [],
      introduction: "",
      showMicroCart: false,
      hasStore: false,
      footer: {
        copyright: ""
      },
      storeKey: "",
      numInCart: 0,
      orderedItems: [],
      subtotal: 0,
      syncing: false,
      screenY: 0,
      scrolledDown: false,
      pageDown: false,
      lang: "en",
      updating: false,
      cookie: {
        text: "",
        accept: "OK"
      }
    };
  },
  created() {
    this.products = this.$parent.products;
    this.lang = this.$parent.lang;
    this.$bus.$on("hide-menu", () => {
      this.showMenu = false;
    });
    let path = this.$route.path.replace(/^\//, "");
    if (path.length < 2) {
      path = "home";
    }
    switch (path) {
      case "home":
        this.showDetail = false;
        break;
      default:
        this.showDetail = true;
        break;
    }
    this.$bus.$on("siteinfo", data => {
      if (data.menu) {
        this.loadMenu(data.menu);
      }

      if (data.ecwid_products) {
        this.ecwidProducts = data.ecwid_products;
      }
      if (data.pages) {
        this.$parent.pages = data.pages;
      }
      if (data.home) {
        if (data.home.nid) {
          this.$parent.nid = data.home.nid;
        }
        if (data.home.images instanceof Array) {
          this.$bus.$emit("load-slides", data.home.images);
        }
        if (data.videos instanceof Object) {
          if (data.videos.sizes instanceof Array) {
            if (data.videos.sizes.length > 0 && data.videos.background instanceof Object) {
              this.videoSet = data.videos;
              setTimeout(() => {
                this.$bus.$emit("video-data-loaded", true);
              }, 375);
            }
          }
        }
        if (data.home.body) {
          this.introduction = data.home.body;
        }
        if (data.home.sections instanceof Array) {
          this.sections = this.processSections(data.home.sections);
          this.numSections = this.sections.length;
        }
      }
      if (data.cookie_policy instanceof Object) {
        this.cookie.text = data.cookie_policy.body;
      }
      if (data.footer) {
        this.footer = data.footer;
      }
      if (data.ecwid_store_key) {
        this.storeKey = data.ecwid_store_key;
        if (this.storeKey) {
          this.syncCart();
        }
      }
      setTimeout(() => {
        u.removeBodyClass("show-loading");
        window.scrollTo(0, 0);
      }, 250);
      window.addEventListener("scroll", e => {
        this.screenY = window.pageYOffset / window.innerHeight;
        this.scrolledDown = this.screenY > 0.125;
        //this.pageDown = this.screenY > 0.95;
        this.pageDown = this.screenY > 1.95;
      });
      if (this.updating) {
        this.$router.push(this.$route.path + "#" + this.lang);
        this.$root.$forceUpdate();

        this.updating = false;
      }
    });
    window.addEventListener("keyup", e => {
      switch (e.keyCode) {
        case 27:
        case 13:
          this.hideMenu();
          break;
      }
    });
    this.$bus.$on("show-detail", status => {
      this.showDetail = status === true;
    });
    this.$bus.$on("add-ecwid-product", variant => {
      if (variant) {
        this.addEcwidProduct(variant);
      }
    });
    this.$bus.$on("remove-ecwid-product", (variant, sync) => {
      if (variant) {
        this.removeEcwidProduct(variant, sync);
      }
    });
    this.$bus.$on("back-to-home", status => {
      this.backToMain();
    });
    setInterval(() => {
      if (this.$route.params) {
        if (this.$route.params.sub) {
          this.syncCart();
        }
      }
    }, 10000);
  },
  mounted() {
    this.$bus.$on("store-loaded", data => {
      this.hasStore = true;
      u.addBodyClass("store-loaded");
    });
  },
  methods: {
    loadMenu(data) {
      if (data instanceof Array) {
        this.menu = data;
      }
    },
    processSections(sections) {
      if (sections instanceof Array) {
        return sections.map(sc => {
          sc.showBlock = false;
          switch (sc.type) {
            case "image_set":
              break;
            case "body":
              if (sc.show_body) {
                sc.title = "";
                sc.text = this.introduction;
                sc.type = "section";
                sc.text_layout = "single";
                if (sc.block) {
                  switch (sc.block) {
                    case 1:
                      sc.block = "instafeed";
                      sc.showBlock = true;
                  }
                }
              }
              break;
            case "section":
              sc.multiple = false;
              switch (sc.text_layout) {
                case "fade":
                  sc.multiple = true;
                  break;
                case "blocks":
                  sc.multiple = true;
                  break;
                default:
                  if (sc.text instanceof Array) {
                    if (sc.text.length > 0) {
                      sc.text = sc.text[0];
                    }
                  }
                  break;
              }
              break;
            case "product_set":
              if (sc.products instanceof Array) {
                this.processProductSet(sc);
              }
              break;
          }
          return sc;
        });
      }
      return [];
    },
    processProductSet(sc) {
      sc.images = [];
      sc.layout = "row-3";
      sc.type = "image_set";
      let pKeys = Object.keys(this.$parent.pages),
        nKeys = pKeys.length,
        i = 0,
        j = 0,
        ct,
        pn,
        k,
        img;
      for (; i < nKeys; i++) {
        k = pKeys[i];
        ct = this.$parent.pages[k];
        if (ct.type == "catalog") {
          for (j = 0; j < ct.products.length; j++) {
            pn = ct.products[j];

            if (pn.images) {
              if (pn.images instanceof Array) {
                if (pn.images.length > 0) {
                  if (sc.products.indexOf(pn.nid) >= 0) {
                    img = pn.images[0];
                    img.link = {
                      url: k + "/" + pn.path.split("/").pop(),
                      title: pn.title
                    };
                    if (
                      pn.variants instanceof Array &&
                      pn.variants.length > 0
                    ) {
                      img.priceInfo = pn.variants[0];
                      pn.variants = pn.variants.map(v => {
                        if (!v.hasOwnProperty("stock")) {
                          v.stock = true;
                        }
                        return v;
                      });
                    }
                    sc.images.push(img);
                  }
                }
              }
            }
          }
        }
        let rSize = sc.images.length;
        if (rSize > 3) {
          rSize = 3;
        }
        sc.layout = "row-" + rSize;
      }
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    hideMenu() {
      this.showMenu = false;
    },
    logoAction() {
      if (u.hasBodyClass("show-store")) {
        u.removeBodyClass("show-store");
      } else if (this.showDetail && !this.$parent.showStore) {
        this.$router.push({ name: "Home" });
      } else if (this.$parent.showStore) {
        this.backToMain();
      } else {
        this.toggleMenu();
      }
    },
    backToMain() {
      this.syncCart();
      this.$router.push(this.$route.path);
      let el = u.clickEl("#ecwid-store-container .ec-breadcrumbs a");
      if (el) {
        u.removeBodyClass("show-store");
      } else {
        u.swapBodyClass("show-store", "cart-loaded");
      }
      this.$parent.showStore = false;
      this.showMenu = false;
      window.location = "#";
    },
    backToCart() {
      u.removeBodyClass("cart-loaded");
      u.addBodyClass("show-store");
    },
    showCheckout() {
      if (this.$parent.enablePurchase) {
        if (Ecwid) {
          if (Ecwid.Cart) {
            Ecwid.openPage("cart");
            if (u.get("#ecwid-store-container > .ecwid")) {
              u.addBodyClass("show-store");
            }
          }
        }
      }
    },
    fetchCart() {
      let ct = this.$ls.get(this.storeKey);
      if (typeof ct == "string") {
        let cart = JSON.parse(ct);
        if (cart instanceof Object && cart !== null) {
          return cart;
        }
      }
    },
    syncCart() {
      if (!this.syncing) {
        this.syncing = true;
        this.numInCart = 0;
        let cart = this.fetchCart();
        if (cart && cart.order) {
          if (cart.order.items instanceof Array) {
            this.numInCart = cart.order.items.length;
            this.orderedItems = cart.order.items;
            this.subtotal = parseFloat(cart.order.subtotal);
          }
        }
        setTimeout(() => {
          if (this.numInCart < 1) {
            this.orderedItems = [];
            this.subtotal = 0;
          }
          this.syncing = false;
        }, 500);
      }
    },
    addEcwidProduct(product) {
      if (Ecwid) {
        if (Ecwid.Cart) {
          Ecwid.Cart.addProduct({
            id: product.id,
            quantity: 1,
            callback: function(success, product, cart) {
              if (success) {
                setTimeout(() => {
                  this.syncCart();
                }, 500);
              }
            }
          });
        }
      }
    },
    removeEcwidProduct(product, sync) {
      if (Ecwid) {
        if (Ecwid.Cart) {
          let cart = this.fetchCart();
          if (cart && cart.order) {
            if (cart.order.items instanceof Array) {
              let pIndex = cart.order.items.findIndex(
                p => (p.productId = product.id)
              );
              if (pIndex >= 0) {
                Ecwid.Cart.removeProduct(pIndex);
                if (sync) {
                  setTimeout(() => {
                    this.syncCart();
                  }, 1000);
                }
              }
            }
          }
        }
      }
    },
    updateSettings(setting, newValue) {
      let stored = this.$ls.get("settings"),
        settings = {};
      if (stored) {
        settings = JSON.parse(stored);
      }
      switch (setting) {
        case "numFormat":
          this.$parent.numFormat = this.numFormat;
          settings.nf = newValue;
          break;
      }
      this.$ls.set("settings", JSON.stringify(settings));
    },
    showMicro() {
      this.showMicroCart = true;
    },
    hideMicro() {
      this.showMicroCart = false;
    }
  }
};
</script>
<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: black;
  z-index: 1;
  overflow-x: hidden;
}
#app ol.dot-nav,
#app ol.arrow-nav {
  position: absolute;
}

#app ol.dot-nav {
  bottom: 12.5%;
  right: 2.5vw;
  z-index: 90;
}
#app ol.dot-nav li {
  cursor: pointer;
  font-size: 1.5em;
  opacity: 0.667;
  width: 1em;
  height: 1.25em;
  overflow: hidden;
  margin-left: 0.5em;
  transition: all 0.5s ease-in-out;
  display: inline-block;
  outline: none;
  user-select: none;
}
#app ol.dot-nav li:hover {
  opacity: 1;
}
#app ol.dot-nav li:before {
  font-family: icomoon;
  content: "\e601";
}
#app ol.dot-nav li.active {
  transform: scale(1.2);
}
#app ol.dot-nav li.active:before {
  content: "\e602";
}

#app .main .sections > section,
#app .main > div > section {
  position: relative;
  overflow: hidden;
}

.scrolled-up.show-intro .home-pane aside.site-intro {
  opacity: 1;
  pointer-events: all;
  z-index: 30;
}

#app .page-section ul.flex-slides li figure {
  max-height: 100vh;
  overflow: hidden;
}
#app .page-section ul.flex-slides > li img {
  max-width: 100%;
}
@media screen and (min-width: 48em) {
  #app .per-row-2 ul.flex-slides li figure,
  #app .per-row-2 ul.flex-slides > li {
    max-width: 50vw;
  }
  #app .per-row-2 .arrow-nav li {
    max-height: 40vw;
    height: 40vw;
  }
  #app .per-row-2 .dot-nav li.extra {
    display: none;
  }
}
#app .top-slides {
  position: relative;
  margin-top: -2em;
}
@media screen and (orientation: portrait) {
  #app .top-slides ul.flex-slides li figure img,
  #app .top-slides ul.flex-slides,
  #app .top-slides {
    height: 75vh;
    max-height: 100vw;
  }
}
.back-to {
  position: absolute;
  top: 0.25em;
  right: 2.5%;
  font-size: 1.5em;
  opacity: 0;
  pointer-events: none;
  transform: scale(1.25, 1);
}
.back-to:before {
  font-family: icomoon;
  content: "\e609";
}
.back-to span.text {
  position: absolute;
  left: -9999em;
}

footer .footer-menu {
  display: flex;
  flex-flow: wrap row;
  justify-content: center;
  align-items: center;
}
footer .footer-menu li {
  margin: 1em;
  padding: 0 1em;
}

.lang-switcher {
  position: absolute;
}

nav.main-nav .lang-switcher {
  margin-top: 1.5em;
  clear: both;
  bottom: 1em;
  left: 2.5vw;
}

nav.main-nav .lang-switcher li {
  text-align: left;
}

.lang-switcher li {
  position: relative;
  display: inline-block;
  margin: 0.5em 0;
  font-size: 1.25em;
  opacity: 0.5;
  line-height: 1em;
  height: 1em;
  width: 1em;
  text-align: center;
  transition: all 0.33s ease-in-out;
  cursor: pointer;
}

.top-header .lang-switcher {
  display: none;
}

.lang-switcher li:hover,
.lang-switcher .selected {
  font-style: italic;
}

.lang-switcher li.selected {
  opacity: 1;
  text-decoration: underline dotted #999999;
}

#cookie-policy {
  position: fixed;
  bottom: -60em;
  opacity: 1;
  z-index: 5000;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6667);
  color: white;
  pointer-events: none;
  transition: bottom 3s ease-in-out;
}

#cookie-policy .inner {
  position: relative;
  max-width: 72em;
  margin: 1em auto;
  text-align: left;
  padding: 0 5%;
  display: flex;
  flex-flow: row nowrap;
}

#cookie-policy .inner .text {
  width: calc(100% - 4em);
}

#cookie-policy .inner .actions {
  width: 4em;
}

#cookie-policy.out {
  opacity: 0;
  z-index: -1;
}

#cookie-policy.show {
  opacity: 1;
  bottom: 0;
  pointer-events: all;
}

#cookie-policy .actions button {
  float: right;
  outline: none;
  background: none;
  border: solid 1px white;
  color: white;
  padding: 0.25em 0.5em;
  border-radius: 1em;
  transition: all 0.5s ease-in-out;
  cursor: pointer;
}

#cookie-policy .actions:hover button.agree {
  transform: scale(1.2);
}

#cookie-policy .actions:hover button.agree:before {
  color: green;
}

@media screen and (min-width: 40em) {
  .top-header .lang-switcher {
    display: block;
    top: 0.5em;
    bottom: auto;
    right: 6em;
    opacity: 1;
    pointer-events: all;
  }
  .top-header .lang-switcher li {
    display: inline-block;
    margin: 0 1em;
  }

  .home-pane aside.site-intro {
    left: 5%;
    right: 5%;
  }
}

@media screen and (min-width: 50em) {
  .top-header .lang-switcher {
    right: 6.5em;
  }
  .home-pane aside.site-intro {
    left: 7.5%;
    right: 7.5%;
  }
}

@media screen and (min-width: 60em) {
  .top-header .lang-switcher {
    right: 7em;
  }
  .back-to {
    font-size: 1.667em;
  }
  .home-pane aside.site-intro {
    left: 10%;
    right: 10%;
  }
  #cookie-policy .actions button {
    font-size: 1.25em;
  }
  #cookie-policy .inner .text {
    width: calc(100% - 6em);
  }

  #cookie-policy .inner .actions {
    width: 6em;
  }
}

@media screen and (min-width: 70em) {
  .top-header .lang-switcher {
    right: 8em;
  }
  .home-pane aside.site-intro {
    left: 15%;
    right: 15%;
  }
  #cookie-policy .actions button {
    font-size: 1.3125em;
  }
}

@media screen and (min-width: 80em) {
  .store-nav .lang-switcher {
    right: 9em;
  }
  .home-pane aside.site-intro {
    left: 20%;
    right: 20%;
  }
  #cookie-policy .actions button {
    font-size: 1.375em;
  }
  #cookie-policy .inner .text {
    width: calc(100% - 8em);
  }

  #cookie-policy .inner .actions {
    width: 8em;
  }
}
</style>
