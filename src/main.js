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


Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  data: {
  	products: []
  },
  created () {
    let comp = this
    let matchedProducts = false
    let storedProductsData = this.$ls.get('products');
    if (typeof storedProductsData == 'string') {
    	let storedProducts = JSON.parse(storedProductsData)
    	if (storedProducts instanceof Array) {
	    	if (storedProducts.length > 0) {
	    		this.products = storedProducts;
	    		matchedProducts = true
	    		console.log(this.products[0])
	    	}
	    }
    }
    if (!matchedProducts) {
    	setTimeout(() => {
	      comp.readStore()
	    }, 8000)
    }
  },
  methods: {
    readStore () {
      let elems = document.querySelectorAll('.grid-product')
      if (elems.length > 0) {
      	for (let i = 0, elem, cls, prod, img, srcSet; i < elems.length; i++) {
      		elem = elems.item(i)
      		cls = elem.classList
      		if (cls.length > 1) {
      			for (let j = 0; j < cls.length; j++) {
      				if (cls.item(j).indexOf('grid-product--id') === 0) {
      					prod = { id: cls.item(j).split('-').pop()}
      					img = elem.querySelector('.grid-product__image-wrap img');
      					if (img) {
      						srcSet = img.getAttribute('srcset')
      						if (srcSet) {
      							prod.img = srcSet.split(',').pop().replace(/\s*\dx/,'');
      							this.products.push(prod)		
      						}
      					}
      				}
      			}
      		}
      	}
      	let seri = JSON.stringify(this.products)
      	this.$ls.set('products',seri)
      }
    }
  }
})
