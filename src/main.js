// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import VueLocalStorage from 'vue-localstorage'
 
Vue.use(VueLocalStorage, {
  name: 'ls',
  bind: true //created computed members from your variable declarations
})

const bus = new Vue();

Object.defineProperty(Vue.prototype,'$bus', { get() { return this.$root.bus } });


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
    homeData: {},
  	productsSynced: false,
    hasStore: false,
  	showStore: false,
    readInterval: null
  },
  created () {
    this.updatePath()
    window.addEventListener('hashchange',this.updatePath)
    let comp = this
    let matchedProducts = false
    let storedProductsData = this.$ls.get('products');
    
    if (typeof storedProductsData == 'string') {

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
  },
  methods: {
    readStore () {
      let elems = document.querySelectorAll('.grid-product')
      if (elems.length > 0) {
      	if (!this.productsSynced) {
      		this.updateStoreRefs(elems);	
      	}
      	this.hasStore = true
        this.$bus.$emit('store-loaded', true)
        if (this.readInterval) {
          clearInterval(this.readInterval)
        }
      }
    },
    loadHome () {
      this.fetchData('page-path/home')
    },
    fetchData (subPath) {
      let dataKey = subPath.replace(/\//g,'__')
      let stored = this.$ls.get(dataKey),
        storedData
      if (typeof stored == 'string' && stored.indexOf('{') >= 0) {
        storedData = JSON.parse(stored)
        switch (dataKey) {
          case 'page-path__home':
            this.homeData = storedData
            break;
        }
      }
      let hasData = storedData !== null && typeof storedData == 'object'

      if (hasData) {
        hasData = storedData.valid === true
      }
      if (hasData) {
        this.$bus.$emit(dataKey, storedData)
      } else {
        let comp = this
        axios.get(this.cmsApi + subPath)
        .then( (response) => {
        if (response.data) {
            comp.$bus.$emit(dataKey, response.data)
            this.$ls.set(dataKey, JSON.stringify(response.data)) 
          }
        })
        .catch(e => {
          console.log(e)
        })
      }
    },
    updateStoreRefs (elems) {
    	this.products = []
    	for (let i = 0, elem, cls, prod, img, srcSet, pr, prTxt; i < elems.length; i++) {
    		elem = elems.item(i)
    		cls = elem.classList
    		if (cls.length > 1) {
    			for (let j = 0; j < cls.length; j++) {
    				if (cls.item(j).indexOf('grid-product--id') === 0) {
    					prod = { id: cls.item(j).split('-').pop(), price: 0.00 }
    					img = elem.querySelector('.grid-product__image-wrap img');
    					if (img) {
    						srcSet = img.getAttribute('srcset')
    						if (srcSet) {
    							prod.img = srcSet.split(',').pop().replace(/\s*\dx/,'');		
    						}
    					}
    					pr = elem.querySelector('.grid-product__price-amount');
    					if (pr) {
    						prTxt = pr.textContent
    						if (typeof prTxt == 'string') {
    							prTxt = prTxt.replace(/[^0-9,.]/g,'').replace(/(\d+)\.,(\d\d\d)/,"$1$2").replace(/,(\d\d)\b/g,'.');
    							if (prTxt.length > 0) {
    								prod.price = parseFloat(prTxt)
    							}
    						}
    					}
    					if (img) {
    						this.products.push(prod)
    					}
    				}
    			}
    		}
    	}
    	let seri = JSON.stringify(this.products)
    	this.$ls.set('products',seri)
    	this.productsSynced = true
    	this.$bus.$emit('load-products', this.products)
    },
    updatePath () {
      let hash = window.location.hash
      this.$bus.$emit('hide-menu', true)
      if (hash.length > 1) {
        if (hash.indexOf('#/!/') === 0) {
          this.showStore = true
          if (hash.indexOf('/offset=') < 0) {
            addBodyClass('show-store')
          } else {
            removeBodyClass('show-store')
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
  }
})
