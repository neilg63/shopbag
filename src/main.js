// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import u from './utils/utils'
import VueLocalStorage from 'vue-localstorage'
import VueScrollTo from 'vue-scrollto'
import Vue2TouchEvents from 'vue2-touch-events'

Vue.use(Vue2TouchEvents, {
    disableClick: false,
    touchClass: '',
    tapTolerance: 10,
    swipeTolerance: 30,
    longTapTimeInterval: 400
})

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
    version: 0.30,
    cmsApi: '/jsonstyles/',
    products: [],
    ecwidProducts: [],
    lang: 'en',
    numFormat: '.',
    productsSynced: false,
    hasStore: false,
    showStore: false,
    readInterval: null,
    fetching: false,
    homeLoaded: false,
    pages: {},
    lastUpdated: 0,
    user: {
      id: 0
    },
    nid: 0
  },
  created () {
    this.detectLanguage()
    this.detectTouch()
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
    this.updatePath(true)
    setTimeout(() => {
      this.updateDetail(comp.$route.path)
    }, 1000)
    setTimeout(() => {
      axios.get(this.cmsApi + 'edited')
        .then(response => {
          if (response.data) {
            if (response.data.nodes instanceof Array) {
              let nodes = response.data.nodes
              let num = nodes.length
              let max = 0
              let ts = 0
              for (let i = 0; i < num; i++) {
                ts = parseInt(nodes[i].changed)
                if (ts > max) {
                  max = ts
                }
              }
              if (max > (comp.lastUpdated + 600)) {
                comp.loadHome(true)
              }
            }
          }
        })
        .catch(e => {
          console.log(e)
        })
    },10000)
    let cms = comp.$ls.get('cms')
    if (cms) {
      this.user = JSON.parse(cms);
    }
    setTimeout(() => {
      axios.get(comp.cmsApi + 'user')
        .then((response) => {
          if (response.data) {
            if (response.data.roles) {
              comp.$ls.set('cms', JSON.stringify(response.data))
              comp.user = response.data
            }
          }
        });
    }, 6000);
  },
  watch:{
    $route (to, from){
      if (to.path) {
        this.$bus.$emit('hide-menu', true)
        this.updateDetail(to.path)
      }
    },
    homeLoaded (newVal) {
      if (newVal) {
        let hash = window.location.hash
        if (/^#\/!/.test(hash)) {
          this.$router.push('/')
          this.$bus.$emit('back-to-home', true)
        }
      }
    }
  },
  methods: {
    loadHome (fetchNew) {
      this.fetchData('siteinfo', 'siteinfo', fetchNew)
      let comp = this
      if (!fetchNew) {
        setTimeout(() => {
          if (!comp.homeLoaded) {
            comp.loadHome()
          }
        },500)
      }
    },
    fetchData (subPath, pageKey, fetchNew) {
      let dataKey = subPath.replace(/\//g, '__')
      let comp = this
      if (!this.fetching && dataKey.indexOf('!') < 0) {
        this.fetching = true
        if (!pageKey) {
          pageKey = dataKey
        }
        let hasData = false,
          storedData = {}
        if (fetchNew !== true) {
          let stored = this.$ls.get(dataKey)
          if (typeof stored === 'string' && stored.indexOf('{') >= 0) {
            storedData = JSON.parse(stored)
          }
          hasData = storedData !== null && typeof storedData === 'object'
          if (hasData) {
            hasData = storedData.valid === true && storedData.hasOwnProperty('version')
            if (hasData) {
              hasData = storedData.version === this.version
            }
          }
        }
        if (hasData) {
          if (pageKey == 'page') {
            this.$bus.$emit('show-detail', true)
          }
          setTimeout(() => {
            comp.fetching = false
          },500)
          if (subPath == 'siteinfo') {
            this.handleSiteData(storedData, true)
          } else {
            this.$bus.$emit(pageKey, storedData)
          }
        } else {
          subPath += '?lang=' + this.lang
          axios.get(this.cmsApi + subPath)
            .then(response => {
              if (response.data) {
                response.data.version = comp.version
                this.$ls.set(dataKey, JSON.stringify(response.data))
                if (pageKey == 'page') {
                  this.$bus.$emit('show-detail', true)
                }
                if (subPath == 'siteinfo') {
                  comp.handleSiteData(response.data, false)
                } else {
                  comp.$bus.$emit(pageKey, response.data)
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
    handleSiteData (data, stored) {
      let comp = this
      if (data.last_edited) {
        this.lastUpdated = parseInt(data.last_edited)
      }
      if (data.lang) {
        this.lang = data.lang
      }
      this.homeLoaded = true
      let ts = stored ? 500 : 250
      this.$forceUpdate()
      setTimeout(() => {
        comp.$bus.$emit('siteinfo', data)
        setTimeout(() => {
          u.removeBodyClass('show-loading')
        }, (ts + 250));
      }, (ts + 100))
    },
    updateDetail (path) {
      path = path.replace(/^\//,'')
        switch (path) {
          case '':
          case 'home':
            this.$bus.$emit('show-detail', false)
            break
          default:
            if (/\w+\/\w+/.test(path)) {
              path = path.split('/').shift()
            }
            this.fetchPage(path)
            break
        }
    },
    updatePath (init) {
      let hash = window.location.hash
      this.$bus.$emit('hide-menu', true)
      if (hash.length > 1) {
        if (u.addBodyClass) {
          if (hash.indexOf('#/!/') === 0) {
            this.showStore = true
            if (hash.indexOf('/offset=') < 0) {
              u.addBodyClass('show-store')
            } else {
              u.removeBodyClass('show-store')
            }
            if (hash.indexOf('/cart') > 0) {
              u.clickEl('.ecwid-minicart-link span')
            }
          }
        }
      }
      this.$scrollTo('#top', 500)
      let ts = init === true ? 1500 : 0
      let comp = this
      setTimeout(() => {
        comp.updateDetail(comp.$route.path)
      }, ts)
    },
    detectTouch () {
      u.addBodyClass('touch-disabled')
      window.addEventListener('touchstart', function() {
        if (!u.hasBodyClass('touch-enabled')) {
          u.swapBodyClass('touch-disabled','touch-enabled')
        }
      })
    },
    detectLanguage () {
      let bl = 'en'
      let str = this.$ls.get('settings')
      if (typeof str == 'string') {
        let settings = JSON.parse(str)
        if (settings.lang) {
          bl = settings.lang
        }
      } else {
        if (window.navigator.language) {
          bl = window.navigator.language.toLowerCase().split('-').shift()
        }
      }
      this.localiseSettings(bl)
    },
    localiseSettings (bl) {
      switch (bl) {
        case 'it':
          this.lang = bl
          break
        default:
          this.lang = 'en'
          break;
      }
      switch (bl) {
        case 'it':
        case 'de':
        case 'fr':
        case 'es':
        case 'nl':
        case 'pt':
          this.numFormat = ','
          break
        default:
          this.numFormat = '.'
          break
      }
      this.$ls.set('settings', JSON.stringify({
        lang: this.lang,
        nf: this.numFormat
      }))
    }
  }
})