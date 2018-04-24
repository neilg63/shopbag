<template>
  <div id="app" :class="{'store-loaded': hasStore,'show-menu': showMenu,'show-detail': showDetail,'show-home': !showDetail,'scrolled-up': !scrolledDown}">
    <nav class="store-nav">
      <div class="inner">
        <div class="bg-solid bg-element"></div>
        <div class="bg-transition bg-element"></div>
        <div class="bg-menu bg-element"></div>
        <div class="menu-toggle icon-menu" v-on:click.stop="toggleMenu()"></div>
        <ul class="menu">
          <li v-for="item in menu" :key="item.link"><router-link v-bind:to="item.link">{{item.title}}</router-link></li>
        </ul>
        <div class="show-cart" :class="{'has-items': numInCart > 0}" v-on:click="showCheckout()"><span class="num">{{numInCart}}</span>
          <div class="micro-cart">
            <ul v-if="numInCart > 0" class="ordered-items plain">
            <li v-for="(item,oi) in orderedItems">
              <span class="quantity">{{item.quantity}}</span>
              <em>x</em>
              <span class="title">{{item.name}}</span>
            </li>
          </ul>
            <p class="subtotal">{{subtotalFormatted}}</p>
          </div>
        </div>
        <div id="main-logo" @click="logoAction()"></div>
        <div class="back-to back-to-main" v-on:click="backToMain()"><span class="text">Back</span></div>
      </div>
    </nav>
    <div class="main">
      <div class="home-pane">
        <slides/>
        <sections :sections="sections"></sections>
        <vue-footer :menu="menu" :footer="footer" id="page-footer"></vue-footer>        
      </div>
      <div class="detail-pane">
         <keep-alive>
          <router-view/>
        </keep-alive>
        <vue-footer :menu="menu" :footer="footer" id="inner-page-footer"></vue-footer>
      </div>
    </div>
  </div>
</template>
<script>
/*import Products from '@/components/Products'*/
import Slides from '@/components/Slides'
import Sections from '@/components/Sections'
import VueFooter from '@/components/VueFooter'
import utils from './utils/utils'
export default {
  name: 'App',
  components: {
    Slides,
    Sections,
    VueFooter
  },
  data () {
    return {
      menu: [],
      showMenu: false,
      showDetail: false,
      sections: [],
      numSections: 0,
      products: [],
      hasStore: false,
      footer: {
        copyright: ''
      },
      storeKey: '',
      numInCart: 0,
      orderedItems: [],
      subtotal: 0,
      subtotalFormatted: '',
      syncing: false,
      screenY: 0,
      scrolledDown: false
    }
  },
  created () {
    this.products = this.$parent.products
    let comp = this
    this.$bus.$on('hide-menu', () => {
      comp.showMenu = false
    })
    let path = this.$route.path.replace(/^\//, '')
    if (path.length < 2) {
      path = 'home'
    }
    switch (path) {
      case 'home':
        this.showDetail = false
        break
      default:
        this.showDetail = true
        break
    }
    this.$bus.$on('siteinfo', (data) => {
      if (data.home) {
        if (data.home.images instanceof Array) {
          this.$bus.$emit('load-slides', data.home.images)
        }
        if (data.home.sections instanceof Array) {
          comp.sections = data.home.sections
          comp.numSections = comp.sections.length
        }
      }
      if (data.ecwid_products) {
        comp.ecwidProducts = data.ecwid_products
      }
      if (data.pages) {
        comp.$parent.pages = data.pages
      }
      if (data.menu) {
        comp.loadMenu(data.menu)
      }
      if (data.footer) {
        comp.footer = data.footer
      }
      if (data.ecwid_store_key) {
        comp.storeKey = data.ecwid_store_key
        if (comp.storeKey) {
          comp.syncCart()
        }
      }
      setTimeout(() => {
        utils.removeBodyClass('show-loading')
        window.scrollTo(0, 0)
      },750)
      
      window.addEventListener('scroll', (e) => {
        comp.screenY = window.pageYOffset / window.innerHeight
        comp.scrolledDown  = comp.screenY > 0.125;
      })
    })
    this.$bus.$on('show-detail', (status) => {
      comp.showDetail = status === true
    })
    this.$bus.$on('add-ecwid-product', (variant) => {
      if (variant) {
        comp.addEcwidProduct(variant)
      }
    })
    this.$bus.$on('back-to-home', (status) => {
      comp.backToMain()
    })
    setInterval(() => {
      if (comp.$route.params) {
        if (comp.$route.params.sub) {
          comp.syncCart()
        }
      }
    }, 10000)
  },
  mounted () {
    let comp = this
    this.$bus.$on('store-loaded', (data) => {
      comp.hasStore = true
      utils.addBodyClass('store-loaded')
    })
  },
  methods: {
    loadMenu (data) {
      if (data instanceof Array) {
        this.menu = data
      }
    },
    toggleMenu () {
      this.showMenu = !this.showMenu
    },
    logoAction () {
      if (utils.hasBodyClass('show-store')) {
        utils.removeBodyClass('show-store')
      } else if (this.showDetail && !this.$parent.showStore) {
        this.$router.push({ name: "Home"})
      } else if (this.$parent.showStore) {
        this.backToMain()
      } else {
        this.toggleMenu()
      }
    },
    backToMain () {
      this.syncCart()
      this.$router.push(this.$route.path)
      let el = document.querySelector('#ecwid-store-container .ec-breadcrumbs a')
      if (el) {
        el.click()
        utils.removeBodyClass('show-store')

      } else {
        utils.swapBodyClass('show-store', 'cart-loaded')
      }
      this.$parent.showStore = false
      this.showMenu = false
      window.location = '#'
    },
    backToCart () {
      utils.removeBodyClass('cart-loaded')
      utils.addBodyClass('show-store')
    },
    showCheckout () {
      let el = document.querySelector('.footer__link--shopping-cart')
      if (el) {
        el.click()
        utils.addBodyClass('show-store')
      }
    },
    /*updateCounter () {
      let sb = document.querySelector('.footer__link--shopping-cart'),
        matched = false
      if (sb) {
        let txt = sb.textContent
        if (txt.length > 0) {
          let m = txt.match(/\((\d+)\)/)
          if (m) {
            let num = parseInt(m[1])
            if (!isNaN(num)) {
              this.numInCart = num
              matched = true
            }
          }
        }
      }
      let comp = this
      setTimeout(() => {
        if (!matched) {
          comp.numInCart = 0
        }
      },333)
    },*/
    syncCart () {
      if (!this.syncing) {
        this.syncing = true
        let ct = this.$ls.get(this.storeKey)
        this.numInCart = 0
        if (typeof ct == 'string') {
          let cart = JSON.parse(ct)
          if (cart instanceof Object && cart !== null) {
            if (cart.order) {
              if (cart.order.items instanceof Array) {
                this.numInCart = cart.order.items.length
                this.orderedItems = cart.order.items;
                this.subtotal = parseFloat(cart.order.subtotal)
                this.subtotalFormatted = '€ ' + this.subtotal.toFixed(2)
              }
            }
          }
        }
        let comp = this
        setTimeout(() => {
          if (comp.numInCart < 1) {
            comp.orderedItems = []
            comp.subtotal = 0
          }
          comp.syncing = false
        },500)
      }
    },
    addEcwidProduct (product) {
      let tg = '.grid-product--id-' + product.id + ' a.grid-product__title'
      let el = document.querySelector(tg)
      let comp = this
      if (!el) {
        let contEl = document.querySelector('button.ecwid-btn--continueShopping')
        if (!contEl) {
          contEl = document.querySelector('.ec-breadcrumbs a.breadcrumbs__link--last')
        }
        if (contEl) {
          contEl.click()
          setTimeout(() => {
            comp.addEcwidProduct(product)
          }, 500)
        }
      } else {
        el.click()
        setTimeout(()=> {
          let btEl = document.querySelector('.details-product-purchase__add-to-bag button.form-control__button')
          if (btEl) {
            btEl.click()
            setTimeout(()=> {
              comp.syncCart()
            }, 500);
          }
        }, 500)
      }
    }
  }
}
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
#app ol.arrow-nav {
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  height: 100%;
  pointer-events: none;
}
#app .top-slides ol.arrow-nav {
  height: 100vh;
  max-height: 100vw;
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
  transition: all .5s ease-in-out;
  display: inline-block;
}
#app ol.dot-nav li:hover {
  opacity: 1;
}
#app ol.dot-nav li:before {
  font-family: icomoon;
  content: '\e601';
}
#app ol.dot-nav li.active {
  transform: scale(1.2);
}
#app ol.dot-nav li.active:before {
  content: '\e602';
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
  margin-top: -4vh;
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
  top: 0.5em;
  right: 2.5%;
  font-size: 2em;
  opacity: 0;
  pointer-events: none;
  transform: scale(1.6667,1);
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

</style>
