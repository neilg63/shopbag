<template>
  <article class="content-container node-page" :class="contClasses">
    <figure v-if="hasMainImage" class="subpanel" :class="mainImageClass">
      <vue-picture :imgset="image" :group="image.group" :className="image.type.replace('/','-')"></vue-picture>
    </figure>
    <div class="subpanel" :class="bodyClass">
      <h2 class="article-title" :class="{'show-title': showTitle,'hide-title': !showTitle}">{{title}}</h2>
      <div class="body" v-html="body"></div>
    </div>
    <div v-if="hasProductImages" class="products">
      <template v-for="(image, index) in images">
        <figure :class="image.prodClasses" :key="image.nid" v-on:click="showActive(image, index)">
          <vue-picture :imgset="image" :group="image.group" :className="image.type.replace('/','-')"></vue-picture>
          <figcaption v-if="image.hasVariant">
            <p class="product-name">{{image.variant.title}}</p> 
            <p class="price">{{image.variant.price_formatted}}</p>
          </figcaption>
        </figure>
      </template>
    </div>
    <product v-if="hasActiveProduct" :product="product"></product>
  </article>
</template>

<script>

import Product from './Product'
import VuePicture from './VuePicture'

export default {
  name: 'Detail',
  components: {
    VuePicture,
    Product
  },
  data () {
    return {
      title: 'Welcome to Lucy of Syracuse',
      body: "",
      image: "",
      images: [],
      showTitle: false,
      numImages: 0,
      hasMainImage: false,
      hasContent: false,
      sections: [],
      numSections: 0,
      cType: 'article',
      hasProducts: false,
      hasActiveProduct: false,
      product: {
        title: ''
      },
      hasProductImages: false,
      numProducts: 0,
      contClasses: [],
      mainImageClass: 'right',
      bodyClass: 'left'
    }
  },
  created () {
    this.$bus.$on('page', (data) => {
      this.contClasses = []
      if (data.valid) {
        this.hasMainImage = false
        if (data.title) {
          this.title = data.title
          this.hasContent = true
          this.showTitle = this.title.length > 1
        } else {
          this.title = ''
          this.showTitle = false
        }
        if (data.body) {
          this.body = data.body
          this.hasContent = true
        } else {
          this.body = ''
        }
        if (data.image) {
          if (data.image.sizes) {
            this.image = data.image
            this.hasMainImage = true 
            this.hasContent = true
          } else {
            this.hasMainImage = false
          }
        } else {
          this.image = {}
        }
        if (data.type) {
          this.cType = data.type
        }
        switch (this.cType) {
          case 'catalog':
            this.preProcessCatalog(data)
            break;
          default:
            this.hasProductImages = false
            break;
        }
        if (this.hasMainImage) {
          this.contClasses.push('flex-row');
          this.mainImageClass = 'left'
          this.bodyClass = 'right'
        }
        this.$parent.showDetail = this.hasContent
      } else {
        this.$parent.showDetail = false
      }
      let comp = this
      window.addEventListener('resize', () => {
        comp.setHeight()
      })
    })
  },
  watch: {
    hasActiveProduct (newVal) {
      let cl = 'show-product'
      let ai = this.contClasses.indexOf(cl)
      if (newVal) {
        if (ai < 0) {
          this.contClasses.push(cl)
        }
        setTimeout(() => {
          this.setHeight()
        }, 500)
      } else {
        if (ai >= 0) {
          this.contClasses.splice(ai, 1) 
        }
      }
    }
  },
  methods: {
    preProcessCatalog (data) {
      if (data.products) {
        if (data.products instanceof Array) {
          this.products = data.products
          this.numProducts = this.products.length
          this.hasProducts = this.numProducts > 0
          this.processProductImages()
        }
      }
    },
    processProductImages () {
      this.numImages = 0
      this.images = []
      for (let i = 0, prod, img, variant; i < this.numProducts; i++) {
        prod = this.products[i]
        if (prod.images) {
          if (prod.images instanceof Array && prod.images.length > 0) {
            img = prod.images[0]
            img.group = 'half'
            img.hasVariant = false
            img.active = false
            img.prodClasses = []
            if (prod.variants) {
              variant = prod.variants.find(vr => vr.ecwid == prod.ecwid)
              if (variant) {
                if (variant.price) {
                  img.hasVariant = true
                  img.variant = variant
                  img.nid = prod.nid
                }
              }
            }
            this.images.push(img)
          }
        }
      }
      this.numImages = this.images.length
      this.hasProductImages = this.numImages > 0
    },
    showActive (image,index) {
      this.hasActiveProduct = false
      if (image.hasVariant) {
        if (image.nid) {
          this.product = this.products.find(p => p.nid == image.nid)
          if (this.product) {
            if (this.product.nid) {
              this.product.intro = this.body
              this.hasActiveProduct = true
            }
          }
        }
      }
    },
    setHeight () {
      let el = document.querySelector('article.content-container')
      if (el) {
        let elInner = document.querySelector('.product-overlay')
        if (elInner) {
          let style = window.getComputedStyle(elInner)
          el.style.minHeight = style.height
        }
      }
    }
  }
}
</script>
<style>



#app .detail-pane .body {
  padding: 2em;
  text-align: left;
  margin: 0 auto;
}

#app .detail-pane .flex-row .body {
  max-width: 100%;
}

#app .detail-pane .products {
  max-width: 100vw;
  display: flex;
  flex-flow: nowrap row;
  padding: 3% 3vw;
  margin: 0 -3%;
  background-color: white;
}

#app .detail-pane .products figure img {
  width: 100%;
  height: auto;
  transition: transform 0.5s ease-in-out;
  transform: scale(1, 1);
}

#app .detail-pane .products figure:hover img {
  transform: scale(-1, 1);
}

#app .detail-pane .products figure figcaption {
  display: absolute;
  bottom: 2%;
  text-align: center;
}

#app .detail-pane .product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  z-index: -2;
  transition: opacity .5s ease-in-out;
  overflow: hidden;
  background-color: white;
  opacity: 0;
}

#app .detail-pane > article {
  min-height: 100vh;
}

#app .detail-pane .show-product .product-overlay {
  z-index: 11;
  opacity: 1;
}

#app .detail-pane .show-product .products {
  opacity: 0;
}

@media screen and (min-width: 650px) {
  
  #app .detail-pane .flex-row  {
    display: flex;
    flex-flow: nowrap row;
  }

  #app .detail-pane .flex-row .subpanel {
    width: 50%;
  }
  #app .detail-pane .body {
    max-width: 80%;
  }
}

@media screen and (min-width: 975px) {
  #app .detail-pane .body {
    font-size: 112.5%;
  }
}

  @media screen and (min-width: 1300px) {
    #app .detail-pane .body {
      font-size: 125%;
    }
  }

  @media screen and (min-width: 1600px) {
    #app .detail-pane .body {
      font-size: 133.33%;
    }
  }

</style>