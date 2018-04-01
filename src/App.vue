<template>
  <div id="app" :class="{'store-loaded': hasStore}">
    <nav class="store-nav">
      <div class="menu-toggle icon-menu"></div>
      <div class="show-cart">{{numInCart}}</div>
      <div id="main-logo"></div>
      <div class="back-to back-to-main" v-on:click="backToMain()">Back</div>
      <div class="back-to back-to-cart" v-on:click="backToCart()">Back</div>
    </nav>
    <div class="main">
      <router-view/>
      <products/>
    </div>
  </div>
</template>

<script>

import Products from '@/components/Products'

export default {
  name: 'App',
  components: {
    Products
  },
  data () {
    return {
      products: [],
      numInCart: 0,
      hasStore: false
    }
  },
  created () {
    this.products = this.$parent.products
  },
  mounted () {
    let comp = this
    this.$bus.$on('store-loaded', (data) => {
      comp.updateCounter()
      comp.hasStore = true
      document.body.classList.add('store-loaded')
    })
  },
  methods: {
    backToMain () {
      this.updateCounter()
      let el = document.querySelector('#ecwid-store-container .ec-breadcrumbs a')
      if (el) {
        el.click()
        document.body.classList.remove('show-store')
      } else {
        document.body.classList.remove('show-store').add('cart-loaded')
      }
      window.location = '#'
    },
    backToCart () {
      document.body.classList.remove('cart-loaded').add('show-store')
    },
    updateCounter () {
      let sb = document.querySelector('div.ecwid-minicart .ecwid-minicart-counter')
      if (sb) {
        let txt = sb.textContent
        console.log(txt)
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
        document.body.classList.add('show-store')
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

#app ul.flex-slides {
  position: relative;
  display: flex;
  margin: 0;
  flex-flow: nowrap row;
  width: 30000vw;
  top: 0;
  left: 0;
  transition: left 1s ease-in-out;
}

.menu-toggle {
  font-size: 4em;
  opacity: 0.5;
  transition: opacity .5s ease-in-out;
}

.menu-toggle:hover {
  opacity: 0.75;
}

.menu-toggle: before {

}

#app ol.arrow-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  height: 100vh;
  pointer-events: none;
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
  top: 40vh;
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

#app ul.flex-slides > li {
  margin: 0;
  padding: 0 0 1em 0;
  width: 100vw;
}

#app ul.flex-slides li figure,
#app ul.flex-slides li figure img {
  width: 100%;
}

#app figure {
  -webkit-margin-before: 0;
  -webkit-margin-after: 0;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
}

html#ecwid_html #ecwid-store-container {
  position: fixed;
  left: 0;
  right: 0;
  width: 100%;
  opacity: 0;
  z-index: -1;
  pointer-events: none;
  z-index: 2;
  transition: opacity 0.75s ease-in-out;
}

html#ecwid_html body.show-store #ecwid-store-container {
  position: relative;
  opacity: 1;
  pointer-events: all;
  z-index: 20;
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
}

body.show-store #app .main {
  position: fixed;
  z-index: -1;
  opacity: 0;
  height: 0;
  overflow: hidden;
}

html#ecwid_html body#ecwid_body.show-store .ec-size .ec-store .likely__widget,
html#ecwid_html body#ecwid_body.show-store .ec-size .ec-store .likely__widget:hover {
  background: none;
}

html#ecwid_html body#ecwid_body.show-store .ec-size .ec-store .likely__widget .likely__button {
  display: none;
}

html#ecwid_html body#ecwid_body.show-store .ec-size .ec-store .likely__widget {
  transition: transform 0.5s ease-in-out;
}
html#ecwid_html body#ecwid_body.show-store .ec-size .ec-store .likely__widget:hover {
  transform: scale(1.25);
}

html#ecwid_html body#ecwid_body.show-store .ec-size.ec-size--xl .ec-store .form-control--large .form-control__button {
  background:none;
  min-height: 4em;
}

html#ecwid_html body#ecwid_body.show-store .ec-size .ec-store .likely svg {
  height: 3em;
  width: 3em;
  left: 0;
  top: 0;
}

html#ecwid_html body#ecwid_body.show-store .ec-size .ec-store .likely .likely__icon {
  width: 4em;
  height: 5em;
}

html#ecwid_html body#ecwid_body.show-store .ec-size .ec-store .likely__wrapper {
  margin: 0.5em 0;
  overflow: visible;
}

html#ecwid_html body#ecwid_body div.ecwid-minicart {
  z-index: 200;
  opacity: 1;
}

</style>
