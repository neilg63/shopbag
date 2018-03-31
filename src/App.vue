<template>
  <div id="app" :class="{'store-loaded': hasStore}">
    <nav class="store-nav">
      <div class="show-cart">{{numInCart}}</div>
      <div class="back-to-main" v-on:click="backToMain()">Back</div>
    </nav>
    <div class="main">
    <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      products: [],
      numInCart: 0,
      hasStore: false
    }
  },
  created () {
    this.products = this.$parent.products
    this.hasStore = this.$parent.hasStore
  },
  methods: {
    backToMain () {
      let el = document.querySelector('#ecwid-store-container .ec-breadcrumbs a')
      let sb = document.querySelector('div.ecwid-minicart .ecwid-minicart-counter')
      if (sb) {
        let txt = sb.textContent
        console.log(txt)
        if (txt.length > 0) {
          let num = parseInt(txt)
          if (num !== NaN) {
            this.numInCart = num
          }  
        }
        
      }
      if (el) {
        el.click()
        document.body.classList.remove('show-store')
      }
      window.location = '#'
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
}

#app ul.flex-column {
  display: flex;
  margin: 0;
  flex-flow: nowrap column;
}

#app ul.flex-column li {
  margin: 0;
  padding: 0 0 1em 0;
  width: 100%;
}

#app ul.flex-column li figure,
#app ul.flex-column li figure img {
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
  top: 0;
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

body.show-store #app > nav.store-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2em;
  z-index: 100;
}

.back-to-main {
  position: absolute;
  top: 0.25em;
  right: 2.5%;
  font-size: 1.5em;
  opacity: 0;
  pointer-events: none;
}

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
