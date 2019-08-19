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
        <li v-for="(item,oi) in orderedItems">
          <span class="quantity">{{item.quantity}}</span>
          <em>x</em>
          <span class="title">{{item.name}}</span>
        </li>
      </ul>
      <p class="subtotal">{{subtotal|currency}}</p>
    </div>
    <div class="main">
      <div class="home-pane">
        <slides />
        <sections :sections="sections"></sections>
        <vue-footer :menu="menu" :footer="footer" id="page-footer"></vue-footer>
      </div>
      <div class="detail-pane">
        <keep-alive>
          <router-view />
        </keep-alive>
        <vue-footer :menu="menu" :footer="footer" id="inner-page-footer"></vue-footer>
      </div>
    </div>
  </div>
</template>
<script>
/*import Products from '@/components/Products'*/
import Slides from "@/components/Slides";
import Sections from "@/components/Sections";
import VueFooter from "@/components/VueFooter";
import LangSwitcher from "@/components/LangSwitcher";
import filters from "./mixins/filters";
import u from "./utils/utils";
export default {
  name: "App",
  components: {
    Slides,
    Sections,
    VueFooter,
    LangSwitcher
  },
  mixins: [filters],
  data() {
    return {
      menu: [],
      showMenu: false,
      showDetail: false,
      products: [],
      numSections: 0,
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
      updating: false
    };
  },
  created() {
    this.products = this.$parent.products;
    this.lang = this.$parent.lang;
    let comp = this;
    this.$bus.$on("hide-menu", () => {
      comp.showMenu = false;
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
        comp.loadMenu(data.menu);
      }

      if (data.ecwid_products) {
        comp.ecwidProducts = data.ecwid_products;
      }
      if (data.pages) {
        comp.$parent.pages = data.pages;
      }
      if (data.home) {
        if (data.home.nid) {
          comp.$parent.nid = data.home.nid;
        }
        if (data.home.images instanceof Array) {
          this.$bus.$emit("load-slides", data.home.images);
        }
        if (data.home.body) {
          this.introduction = data.home.body;
        }
        if (data.home.sections instanceof Array) {
          comp.sections = comp.processSections(data.home.sections);
          comp.numSections = comp.sections.length;
        }
      }
      if (data.footer) {
        comp.footer = data.footer;
      }
      if (data.ecwid_store_key) {
        comp.storeKey = data.ecwid_store_key;
        if (comp.storeKey) {
          comp.syncCart();
        }
      }
      setTimeout(() => {
        u.removeBodyClass("show-loading");
        window.scrollTo(0, 0);
      }, 250);
      window.addEventListener("scroll", e => {
        comp.screenY = window.pageYOffset / window.innerHeight;
        comp.scrolledDown = comp.screenY > 0.125;
        comp.pageDown = comp.screenY > 0.95;
      });
      if (comp.updating) {
        comp.$router.push(comp.$route.path + "#" + comp.lang);
        comp.$root.$forceUpdate();

        comp.updating = false;
      }
    });
    window.addEventListener("keyup", e => {
      switch (e.keyCode) {
        case 27:
        case 13:
          comp.hideMenu();
          break;
      }
    });
    this.$bus.$on("show-detail", status => {
      comp.showDetail = status === true;
    });
    this.$bus.$on("add-ecwid-product", variant => {
      if (variant) {
        comp.addEcwidProduct(variant);
      }
    });
    this.$bus.$on("remove-ecwid-product", (variant, sync) => {
      if (variant) {
        comp.removeEcwidProduct(variant, sync);
      }
    });
    this.$bus.$on("back-to-home", status => {
      comp.backToMain();
    });
    setInterval(() => {
      if (comp.$route.params) {
        if (comp.$route.params.sub) {
          comp.syncCart();
        }
      }
    }, 10000);
  },
  mounted() {
    let comp = this;
    this.$bus.$on("store-loaded", data => {
      comp.hasStore = true;
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
        let comp = this;
        setTimeout(() => {
          if (comp.numInCart < 1) {
            comp.orderedItems = [];
            comp.subtotal = 0;
          }
          comp.syncing = false;
        }, 500);
      }
    },
    addEcwidProduct(product) {
      if (Ecwid) {
        if (Ecwid.Cart) {
          let comp = this;
          Ecwid.Cart.addProduct({
            id: product.id,
            quantity: 1,
            callback: function(success, product, cart) {
              if (success) {
                setTimeout(() => {
                  comp.syncCart();
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
          let comp = this;
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
                    comp.syncCart();
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
}

@media screen and (min-width: 70em) {
  .top-header .lang-switcher {
    right: 8em;
  }
  .home-pane aside.site-intro {
    left: 15%;
    right: 15%;
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
}
</style>
