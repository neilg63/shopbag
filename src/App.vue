<template>
  <div id="app" :class="{'store-loaded': hasStore,'show-menu': showMenu}">
    <nav class="store-nav">
      <div class="menu-toggle icon-menu" v-on:click.stop="toggleMenu()"></div>
      <ul class="menu">
        <li v-for="item in menu"><a :href="item.link">{{item.label}}</a></li>
      </ul>
      
      <div class="show-cart">{{numInCart}}</div>
      <div id="main-logo"></div>
      <div class="back-to back-to-main" v-on:click="backToMain()">Back</div>
      <div class="back-to back-to-cart" v-on:click="backToCart()">Back</div>
    </nav>
    <div class="main">
      <slides/>
      <router-view/>
      <products/>
    </div>
  </div>
</template>

<script>

import Products from '@/components/Products'
import Slides from '@/components/Slides'

export default {
  name: 'App',
  components: {
    Products,
    Slides
  },
  data () {
    return {
      menu: [],
      showMenu: false,
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
          link: "/",
          label: "Home"
        },
        {
          link: "/about",
          label: "About"
        },
        {
          link: "/terms",
          label: "Terms and conditions"
        },
        {
          link: "/blog",
          label: "Blog"
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
        removeBodyClass('show-store')
      } else {
        swapBodyClass('show-store', 'cart-loaded')
      }
      this.showMenu = false
      window.location = '#'
    },
    backToCart () {
      removeBodyClass('cart-loaded')
      addBodyClass('show-store')
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
        addBodyClass('show-store')
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
  padding: 0;
  flex-flow: nowrap row;
  width: 30000vw;
  top: 0;
  left: 0;
  transition: left 1s ease-in-out;
}

#app nav ul.menu,
#app nav ul.menu li {
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
}

#app nav ul.menu {
  position: absolute;
  top: 6em;
  left: 0;
  opacity: 0;
  z-index: -1;
  pointer-events: none;
  transition: opacity .5s ease-in-out, max-height 1s ease-in-out;
  background-color: white;
  max-height: 1em;
  overflow: hidden;
}

#app.show-menu ul.menu {
  opacity: 1;
  pointer-events: all;
  z-index: 10;
  max-height: 20em;
}

#app.show-menu nav.store-nav {
  background-color: rgba(255,255,255,1)
}

nav ul.menu > li {
  font-size: 1.25em;
}

@media screen and (min-width: 40em) {
  #app nav ul.menu > li {
    font-size: 1.33em;
  }
}

@media screen and (min-width: 50em) {
  #app nav ul.menu > li {
    font-size: 1.5em;
  }
}

@media screen and (min-width: 60em) {
  #app nav ul.menu > li {
    font-size: 1.667em;
  }
}

@media screen and (min-width: 80em) {
  #app nav ul.menu > li {
    font-size: 1.875em;
  }
}

@media screen and (min-width: 90em) {
  #app nav ul.menu > li {
    font-size: 2em;
  }
}

#app nav ul.menu > li a {
  width: 95%;
  display: block;
  padding: 0.5em 2.5%;
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
  height: 100vh;
  pointer-events: none;
}

#app ol.dot-nav {
  top: calc(90vh - 8em);
  right: 2.5vw;
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
  content: "\e601";
}
#app ol.dot-nav li.active {
  transform: scale(1.2);
}

#app ol.dot-nav li.active:before {
  content: "\e602";
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

#app .top-slides ul.flex-slides {
  position: flex;
  max-height: 100vh;
  overflow: hidden;
}

#app .top-slides {
  height: 100vh;
  overflow: hidden;
}

#app .top-slides,
#app .top-slides ul.flex-slides li figure {
  max-height: 100vw;
}

#app .products ul.flex-slides li figure {
  max-height: 100vh;
  max-width: 100vw;
  overflow: hidden;
}

#app .top-slides {
  position: relative;
  margin-top: -4.5em;
}

@media screen and (min-width: 50em) {
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
}

@media screen and (min-width: 40em) and (max-height: 40em) {
  #app .top-slides ul.flex-slides li figure img {
    max-width: 75%;
  }
}


@media screen and (min-width: 50em) and (max-height: 50em){
  #app .top-slides ul.flex-slides li figure img {
    max-width: 72%;
  }
}

@media screen and (min-width: 60em) and (max-height: 60em){
  #app .top-slides ul.flex-slides li figure img {
    max-width: 69%;
  }
}

@media screen and (min-width: 80em) and (max-height: 80em){
  #app .top-slides ul.flex-slides li figure img {
    max-width: 66%;
  }
}

@media screen and (min-width: 100em) (max-height: 100em){
  #app .top-slides ul.flex-slides li figure img {
    max-width: 62%;
  }
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
