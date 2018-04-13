<template>
  <div id="app" :class="{'store-loaded': hasStore,'show-menu': showMenu,'show-detail': showDetail,'show-home': !showDetail}">
    <nav class="store-nav">
      <div class="bg-solid bg-element"></div>
      <div class="bg-transition bg-element"></div>
      <div class="bg-menu bg-element"></div>
      <div class="menu-toggle icon-menu" v-on:click.stop="toggleMenu()"></div>
      <ul class="menu">
        <li v-for="item in menu" :key="item.link"><a :href="item.link">{{item.label}}</a></li>
      </ul>
      <div class="show-cart" :class="{'has-items': numInCart > 0}" v-on:click="showCheckout()"><span class="num">{{numInCart}}</span></div>
      <div id="main-logo" @click="backToMain()"></div>
      <div class="back-to back-to-main" v-on:click="backToMain()">Back</div>
      <div class="back-to back-to-cart" v-on:click="backToCart()">Back</div>
    </nav>
    <div class="main">
      <div class="home-pane">
        <slides/>
        <twin-images v-if="sections.length > 0" :section="sections[0]"></twin-images>
        <products/>
      </div>
      <div class="detail-pane">
        <router-view/>
      </div>
    </div>

  </div>
</template>

<script>

import Products from '@/components/Products'
import Slides from '@/components/Slides'
import TwinImages from '@/components/TwinImages'
import utils from './utils/utils'

export default {
  name: 'App',
  components: {
    Products,
    Slides,
    TwinImages
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
      hasStore: false
    }
  },
  created () {
    this.products = this.$parent.products
    let comp = this
    this.$bus.$on('hide-menu', () => {
      comp.showMenu = false
    })
    if (this.$parent.homeData) {
      if (this.$parent.homeData.sections instanceof Array) {
        this.sections = this.$parent.homeData.sections
        this.numSections = this.sections.length 
      }
    }
  },
  mounted () {
    let comp = this
    this.loadMenu()
    this.$bus.$on('store-loaded', (data) => {
      comp.updateCounter()
      comp.hasStore = true
      document.body.classList.add('store-loaded')
    })
  },
  methods: {
    loadMenu () {
      this.menu = [
        {
          link: '/',
          label: 'Home'
        },
        {
          link: '/about',
          label: 'About'
        },
        {
          link: '/terms',
          label: 'Terms and conditions'
        },
        {
          link: '/blog',
          label: 'Blog'
        }
      ]
    },
    toggleMenu () {
      this.showMenu = !this.showMenu
    },
    backToMain () {
      this.updateCounter()
      let el = document.querySelector('#ecwid-store-container .ec-breadcrumbs a')
      if (el) {
        el.click()
        utils.removeBodyClass('show-store')
      } else {
        utils.swapBodyClass('show-store', 'cart-loaded')
      }
      this.showMenu = false
      window.location = '#'
    },
    backToCart () {
      utils.removeBodyClass('cart-loaded')
      utils.addBodyClass('show-store')
    },
    showCheckout () {
      let el = document.querySelector('.ecwid-minicart .gwt-InlineLabel')
      if (el) {
        el.click()
        utils.addBodyClass('show-store')
      }
    },
    updateCounter () {
      let sb = document.querySelector('div.ecwid-minicart .ecwid-minicart-counter')
      if (sb) {
        let txt = sb.textContent
        if (txt.length > 0) {
          let num = parseInt(txt)
          if (!isNaN(num)) {
            this.numInCart = num
          }
        }
      }
    },
    showEcwidProduct (product) {
      let tg = '.grid-product--id-' + product.id + ' a.grid-product__title'
      let el = document.querySelector(tg)
      if (el) {
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

#app .slides-container {
  position: relative;
  width: 100vw;
  overflow: hidden;
}

#app .twin-images {
  display:  flex;
  flex-flow: nowrap row;
}

#app .twin-images figure {
  max-width:  100%;
}

#app .twin-images figure img {
  width:  100%;
  height:  auto;
}

@media screen and (min-width: 650px) {
  #app .twin-images figure {
    width:  50%;
  }
}

#app ul.flex-slides {
  position: relative;
  display: flex;
  margin: 0;
  padding: 0;
  flex-flow: nowrap row;
  width: 30000vw;
  top: 0;
  left: 0;
  transition: left 1s ease-in-out;
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
  width: 10vw;
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

#app .top-slides ul.flex-slides {
  display: flex;
  margin-top: 10vh;
}

#app .top-slides ul.flex-slides,
#app .top-slides {
  overflow: hidden;
}

#app .top-slides ul.flex-slides li figure img,
#app .top-slides ul.flex-slides,
#app .top-slides {
  height: 90vh;
}

#app .top-slides ul.flex-slides li figure {
  display: flex;
  flex-flow: nowrap row;
  overflow:  hidden;
  justify-content: center;
  position: relative;
  max-height: 100%;
}

#app .top-slides ul.flex-slides li figure img {
  width:  auto;
}

#app .top-slides ul.flex-slides li figure.left {
  justify-content: flex-start;
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

/*@media screen and (min-width: 50em) {
  #app .top-slides,
  #app .top-slides ul.flex-slides li figure {
    max-height: 90vw;
  }
}

@media screen and (min-width: 60em) {
  #app .top-slides,
  #app .top-slides ul.flex-slides li figure {
    max-height: 80vw;
  }
}

@media screen and (min-width: 70em) {
  #app .top-slides,
  #app .top-slides ul.flex-slides li figure {
    max-height: 75vw;
  }
}

@media screen and (min-width: 75em) {
  #app .top-slides,
  #app .top-slides ul.flex-slides li figure {
    max-height: 70vw;
  }
}

@media screen and (min-width: 80em) {
  #app .top-slides,
  #app .top-slides ul.flex-slides li figure {
    max-height: 66vw;
  }
}*/

#app ul.flex-slides.item-1 {
  left: -100vw;
}

#app ul.flex-slides.item-2 {
  left: -200vw;
}

#app ul.flex-slides.item-3 {
  left: -300vw;
}
#app ul.flex-slides.item-4 {
  left: -400vw;
}
#app ul.flex-slides.item-5 {
  left: -500vw;
}
#app ul.flex-slides.item-6 {
  left: -600vw;
}
#app ul.flex-slides.item-7 {
  left: -700vw;
}
#app ul.flex-slides.item-8 {
  left: -800vw;
}

#app ul.flex-slides.item-9 {
  left: -900vw;
}
#app ul.flex-slides.item-10 {
  left: -1000vw;
}
#app ul.flex-slides.item-11 {
  left: -1100vw;
}
#app ul.flex-slides.item-12 {
  left: -1200vw;
}

#app ul.flex-slides.item-13 {
  left: -1300vw;
}

#app ul.flex-slides.item-14 {
  left: -1400vw;
}

#app ul.flex-slides.item-15 {
  left: -1500vw;
}

#app ul.flex-slides.item-16 {
  left: -1600vw;
}

#app ul.flex-slides.item-17 {
  left: -1700vw;
}

#app ul.flex-slides.item-18 {
  left: -1800vw;
}

#app ul.flex-slides.item-19 {
  left: -1900vw;
}

#app ul.flex-slides.item-20 {
  left: -2000vw;
}

#app ul.flex-slides.item-21 {
  left: -2100vw;
}

#app ul.flex-slides.item-22 {
  left: -2200vw;
}

#app ul.flex-slides.item-23 {
  left: -2300vw;
}

#app ul.flex-slides.item-24 {
  left: -2400vw;
}

#app ul.flex-slides > li {
  margin: 0;
  padding: 0 0 1em 0;
  width: 100vw;
}

#app ul.flex-slides li figure {
  width: 100%;
}

.back-to {
  position: absolute;
  top: 0.25em;
  right: 2.5%;
  font-size: 1.5em;
  opacity: 0;
  pointer-events: none;
}

.cart-loaded .back-to-cart,
.show-store .back-to-main {
  opacity: 1;
  pointer-events: all;
  cursor: pointer;
}

#app .main {
  transition: opacity 0.5s ease-in-out;
  margin-top: 5em;
}

body.show-store #app .main {
  position: fixed;
  z-index: -1;
  opacity: 0;
  height: 0;
  overflow: hidden;
}

</style>
