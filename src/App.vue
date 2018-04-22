<template>
  <div id="app" :class="{'store-loaded': hasStore,'show-menu': showMenu,'show-detail': showDetail,'show-home': !showDetail}">
    <nav class="store-nav">
      <div class="bg-solid bg-element"></div>
      <div class="bg-transition bg-element"></div>
      <div class="bg-menu bg-element"></div>
      <div class="menu-toggle icon-menu" v-on:click.stop="toggleMenu()"></div>
      <ul class="menu">
        <li v-for="item in menu" :key="item.link"><router-link v-bind:to="item.link">{{item.title}}</router-link></li>
      </ul>
      <div class="show-cart" :class="{'has-items': numInCart > 0}" v-on:click="showCheckout()"><span class="num">{{numInCart}}</span></div>
      <div id="main-logo" @click="logoAction()"></div>
      <div class="back-to back-to-main" v-on:click="backToMain()"><span class="text">Back</span></div>
      <div class="back-to back-to-cart" v-on:click="backToCart()"><span class="text">Back</span></div>
    </nav>
    <div class="main">
      <div class="home-pane">
        <slides/>
        <template v-for="(section,index) in sections">
          <template v-if="section.type == 'image_set'">
             <image-set :key="index" :section="section"></image-set>
          </template>
        </template>
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
import ImageSet from '@/components/ImageSet'
import VueFooter from '@/components/VueFooter'
import utils from './utils/utils'
export default {
  name: 'App',
  components: {
    Slides,
    ImageSet,
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
      numInCart: 0,
      hasStore: false,
      footer: {
        copyright: ''
      }
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
      setTimeout(() => {
        utils.removeBodyClass('show-loading')
        window.scrollTo(0, 0)
      },750)
    })
    this.$bus.$on('show-detail', (status) => {
      comp.showDetail = status === true
    })
    this.$bus.$on('show-ecwid-product', (variant) => {
      if (variant) {
        comp.showEcwidProduct(variant)
      }
    })
    this.$bus.$on('back-to-home', (status) => {
      comp.backToMain()
    })
  },
  mounted () {
    let comp = this
    this.$bus.$on('store-loaded', (data) => {
      comp.updateCounter()
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
      this.updateCounter()
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
    updateCounter () {
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
    },
    showEcwidProduct (product) {
      let tg = '.grid-product--id-' + product.id + ' a.grid-product__title'
      let el = document.querySelector(tg)
      if (!el) {
        let contEl = document.querySelector('button.ecwid-btn--continueShopping')
        let comp = this
        if (contEl) {
          contEl.click()
          setTimeout(() => {
            comp.showEcwidProduct(product)
          }, 500)
        }
      } else {
        el.click()
        utils.addBodyClass('show-store')
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
  bottom: 8%;
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
#app ol.arrow-nav > li {
  pointer-events: all;
  width: 20vw;
  height: 100vh;
  position: absolute;
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: 0;
  transition: all 0.5s ease-in-out;
  cursor: pointer;
  overflow: hidden;
  font-size: 6vw;
  transform: scale(0.8);
}
#app ol.arrow-nav li:before {
  position: absolute;
  top: 40%;
  width: 1.5em;
}
#app ol.arrow-nav li:hover {
  opacity: 0.75;
  transform: scale(1);
}
#app ol.arrow-nav li.next:before,
#app ol.arrow-nav li.next {
  right: 0;
}
#app ol.arrow-nav li.prev:before,
#app ol.arrow-nav li.prev {
  left: 0;
}

#app .top-slides ul.flex-slides li figure.right {
  justify-content: flex-end;
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
  margin-top: -6em;
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
  font-size: 2em;
  opacity: 0;
  pointer-events: none;
  transform: scale(1.5,1);
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
