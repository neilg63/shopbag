// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import utils from './utils/utils'
import VueLocalStorage from 'vue-localstorage'

var VueScrollTo = require('vue-scrollto');

// You can also pass in the default options
Vue.use(VueScrollTo, {
  container: "body",
  duration: 500,
  easing: "ease",
  offset: 0,
  cancelable: true,
  onStart: false,
  onDone: false,
  onCancel: false,
  x: false,
  y: true
})


Vue.use(VueLocalStorage, {
  name: 'ls',
  bind: true //created computed members from your variable declarations
})
const bus = new Vue()
Object.defineProperty(Vue.prototype,'$bus', { get () { return this.$root.bus } })
Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  data: {
    bus,
    cmsApi: '/jsonstyles/',
    products: [],
    ecwidProducts: [],
    lang: 'en',
    productsSynced: false,
    hasStore: false,
    showStore: false,
    readInterval: null,
    fetching: false,
    homeLoaded: false,
    pages: {}
  },
  created () {
    this.detectLanguage()
    this.updatePath()
    let comp = this

    let matchedProducts = false
    let storedProductsData = this.$ls.get('products')
    if (typeof storedProductsData === 'string') {
      let storedProducts = JSON.parse(storedProductsData)
      if (storedProducts instanceof Array) {
        if (storedProducts.length > 0) {
          this.products = storedProducts
          this.productsSynced = true
          this.$bus.$emit('load-products', this.products)
        }
      }
    }

    this.loadHome()
    
    this.readInterval = setInterval(() => {
      if (!comp.hasStore) {
        comp.readStore()
      }
    }, 3000)
    setTimeout(() => {
      this.updateDetail(comp.$route.path)
    }, 1000)
  },
  watch:{
    $route (to, from){
      if (to.path) {
        this.$bus.$emit('hide-menu', true)
        this.updateDetail(to.path)
      }
    }
  },
  methods: {
    readStore () {
      let elems = document.querySelectorAll('.grid-product')
      if (elems.length > 0) {
        if (!this.productsSynced) {
          this.updateStoreRefs(elems)
        }
        this.hasStore = true
        this.$bus.$emit('store-loaded', true)
        if (this.readInterval) {
          clearInterval(this.readInterval)
        }
      }
    },
    loadHome () {
      this.fetchData('siteinfo')
      let comp = this
      setTimeout(() => {
        if (!comp.homeLoaded) {
          comp.loadHome()
        }
      },500)
    },
    fetchData (subPath, pageKey) {
      let dataKey = subPath.replace(/\//g, '__')
      //subPath = subPath.replace('page-path/','')
      let comp = this
      if (!this.fetching) {
        this.fetching = true
        if (!pageKey) {
          pageKey = dataKey
        }
        let stored = this.$ls.get(dataKey),
          storedData
        if (typeof stored === 'string' && stored.indexOf('{') >= 0) {
          storedData = JSON.parse(stored)
        }
        let hasData = storedData !== null && typeof storedData === 'object'
        if (hasData) {
          hasData = storedData.valid === true
        }

        if (hasData) {
          this.$bus.$emit(pageKey, storedData)
          if (pageKey == 'page') {
              this.$bus.$emit('show-detail', true)
              setTimeout(() => {
                comp.fetching = false
              },250)
          }
          if (subPath == 'siteinfo') {
            comp.homeLoaded = true
          }
        } else {
          if (this.lang !== 'en') {
            subPath += '?lang=' + this.lang
          }
          axios.get(this.cmsApi + subPath)
            .then(response => {
              if (response.data) {
                comp.$bus.$emit(pageKey, response.data)
                this.$ls.set(dataKey, JSON.stringify(response.data))
                if (pageKey == 'page') {
                  this.$bus.$emit('show-detail', true)
                }
                if (subPath == 'siteinfo') {
                  comp.homeLoaded = true
                }
                setTimeout(() => {
                  comp.fetching = false
                },125)
              }
            })
            .catch(e => {
              console.log(e)
            })
        }
      }
      setTimeout(() => {
        comp.fetching = false
      },1000)
    },
    fetchPage (path) {
      let pk = '/' + path, matched = false
      if (this.pages.hasOwnProperty(pk)) {
        if (this.pages[pk].valid) {
          matched = true 
          this.$bus.$emit('show-detail', true)
          this.$bus.$emit('page', this.pages[pk])
        }
      }
      if (!matched) {
        this.fetchData('page-path/' + path,'page')
      }
    },
    updateStoreRefs (elems) {
      this.products = []
      for (let i = 0, elem, cls, prod, img, srcSet,ep; i < elems.length; i++) {
        elem = elems.item(i)
        cls = elem.classList
        if (cls.length > 1) {
          for (let j = 0; j < cls.length; j++) {
            if (cls.item(j).indexOf('grid-product--id') === 0) {
              prod = { id: cls.item(j).split('-').pop(), price: 0.00 }
              img = elem.querySelector('.grid-product__image-wrap img')
              if (img) {
                srcSet = img.getAttribute('srcset')
                if (srcSet) {
                  prod.img = srcSet.split(',').pop().replace(/\s*\dx/, '')
                  ep = this.ecwidProducts.find(p => p.id === prod.id)
                  if (ep) {
                    prod.title = ep.title
                    prod.price = ep.price
                    prod.price_formatted = ep.price_formatted
                  }
                  this.products.push(prod)
                }
              }
            }
          }
        }
      }
      let seri = JSON.stringify(this.products)
      this.$ls.set('products', seri)
      this.productsSynced = true
      this.$bus.$emit('load-products', this.products)
    },
    updateDetail (path) {
      path = path.replace(/^\//,'')
        switch (path) {
          case '':
          case 'home':
            this.$bus.$emit('show-detail', false)
            break
          default:
            this.fetchPage(path)
            break
        }
    },
    updatePath () {
      let hash = window.location.hash
      this.$bus.$emit('hide-menu', true)
      if (hash.length > 1) {
        if (utils.addBodyClass) {
          if (hash.indexOf('#/!/') === 0) {
            this.showStore = true
            if (hash.indexOf('/offset=') < 0) {
              utils.addBodyClass('show-store')
            } else {
              utils.removeBodyClass('show-store')
            }
            if (hash.indexOf('/cart') > 0) {
              let lbl = document.querySelector('.ecwid-minicart-link span')
              if (lbl) {
                lbl.click()
              }
            }
          }
        }
      }
      this.$scrollTo('#top', 500)
      this.updateDetail(this.$route.path)
    },
    detectLanguage () {
      if (window.navigator.language) {
        let bl = window.navigator.language.toLowerCase().split('-').shift()
        switch (bl) {
          case 'it':
            this.lang = bl
            break
        }
      }
    }
  }
})
