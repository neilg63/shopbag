// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
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
  	products: [],
  	productsSynced: false,
    hasStore: false,
  	showStore: false
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
  	setTimeout(() => {
  		comp.readStore()
  	}, 8000)
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

      if (hash.length > 1) {
        if (hash.indexOf('#/!/') === 0) {
          this.showStore = true
          if (hash.indexOf('/offset=') < 0) {
            document.body.classList.add('show-store')
          } else {
            document.body.classList.remove('show-store')
          }
          if (hash.indexOf('/cart') > 0) {
            let lbl = document.querySelector('.ecwid-minicart-link span')
            console.log(lbl)
            if (lbl) {
              lbl.click()
            }
          }
        }
      }
    }
  }
})
