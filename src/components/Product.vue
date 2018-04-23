<template>
  <div class="product-overlay">
    <div class="close icon-close" v-on:click="close()"></div>
    <h2>{{product.title}}</h2>
    <div class="image-selector">
      <template v-for="(iset, index) in imageSets">
        <div class="set-container" :class="{'active':iset.active}">
          <image-set :key="index" :section="iset"></image-set>
        </div>
      </template>
    </div>
    <div class="variant-selector" v-if="variants.length > 0">
      <ul class="plain">
      <template v-for="(variant, index) in product.variants">
        <li class="variant" :class="{'active':variant.active}" v-on:click="setActive(variant)" :data-index="variant.imgIndex"><span class="text">{{variant.title}}</span></li>
      </template>
    </ul>
      <div class="buy-now" :class="{'added':selectedVariant.added}" v-if="selectedVariant" v-on:click="showEcwidSelector()">
        <div class="price">{{selectedVariant.price_formatted}}</div>
        <div class="icon icon-add-cart"></div>
        <div class="icon icon-check"></div>
      </div>
      <h3 class="selected-variant">{{selectedVariant.title}}</h3>
      <div class="catalog-body" v-html="product.intro"></div>
    </div>
    <div class="body">
      <div class="product-body" v-html="product.body"></div>
    </div>
  </div>
</template>

<script>

import ImageSet from './ImageSet'
import VuePicture from './VuePicture'

export default {
  name: 'Product',
  components: {
    VuePicture,
    ImageSet
  },
  props: {
    product: {
      type: Object,
      required: true,
      default: null
    }
  },
  data () {
    return {
      imageSets: [],
      variants: [],
      selectedVariant: null
    }
  },
  created () {
    this.assignImageSets()
  },
  watch: {
    product (newVal) {
      this.assignImageSets()
    }
  },
  methods: {
    assignImageSets () {
      let comp = this
      this.$parent.updateAdded(this.product)
      this.imageSets = []
      this.variants = this.product.variants.map( (v, vi) => {
        v.imgIndex = -1
        v.active = vi === 0
        if (v.active) {
          comp.selectedVariant = v
        }
        if (/^[A-Z]+\s*-\s*\w+/.test(v.title)) {
          v.title = v.title.replace(/^\w+\s*-/, '')
        }
        return v
      })
      if (this.product.sections) {
        if (this.product.sections instanceof Array && this.product.sections.length > 0) {
          for (let i = 0, c = 0, sec; i < this.product.sections.length; i++) {
            sec = this.product.sections[i]
            if (sec.type == 'image_set') {
              if (sec.images) {
                if (sec.images instanceof Array) {
                  sec.layout = 'aspect'
                  if (sec.images.length > 0) {
                    sec.active = c === 0
                    this.imageSets.push(sec)
                    if (sec.ecwid) {
                      let vi = this.variants.findIndex(v => v.id === sec.ecwid)
                      if (vi >= 0) {
                        this.variants[vi].title = sec.title
                        this.variants[vi].imgIndex = i
                      }
                    }
                    c++
                  }
                }
              }
            }
          }
        }
        this.$parent.setHeight()
        setTimeout(() => {
          comp.$parent.updateAdded(comp.product)
        }, 2000)
      }
    },
    setActive (variant) {
      this.variants = this.variants.map(v => {
        v.active = false
        return v
      })
      variant.active = true
      this.selectedVariant = variant
      if (variant.imgIndex >= 0) {
        this.imageSets = this.imageSets.map((ims, index) => {
          ims.active = variant.imgIndex === index
          return ims
        })
      }
    },
    close () {
      this.$parent.toggleActiveProduct(false)
    },
    showEcwidSelector () {
      if (this.selectedVariant.id) {
        this.$bus.$emit('show-ecwid-product', this.selectedVariant)
        let comp = this
        setTimeout(() => {
          comp.$parent.updateAdded(comp.product)
        }, 2000)
      }
    }
  }
}
</script>
<style>

#app .image-selector,
#app .image-selector > .set-container {
  height: 33.33vw;
  overflow:hidden;
}

#app .image-selector {
  width: 100%;
}

#app .variant-selector {
  position: relative;
  width: 90%;
  padding: .5em 5% 1em 5%;
  text-align: left;
}

#app .variant-selector li span.text {
  display: none;
}

#app .variant-selector .plain li {
  width: 1.33em;
  height: 1.33em;
  padding: 0.125em 1em 0.125em 0.125em;
  overflow: hidden;
}

#app .variant-selector .plain li:before {
  display: inline-block;
  font-family: icomoon;
  content: "\e601";
  margin-right: .25em;
  transition: all .33s ease-in-out;
}

#app .variant-selector .plain {
  display: flex;
  flex-flow: nowrap row;
}


#app .variant-selector .plain li.active:before {
  content: "\e602";  
  transform: scale(1.2);
}

.buy-now {
  position: absolute;
  top: 0;
  right: 5%;
  display: flex;
  flex-flow: nowrap row;
  cursor: pointer;
}

.buy-now .icon {
  margin-left: 1em;
  transform: scale(1) skew(0deg);
  opacity: 0.75;
  transition: all .33s ease-in-out;
  width: 1em;
  overflow: hidden;
  font-size: 1.25em;
}

.buy-now .icon:before {
  position: absolute;
  top: 0;
  right: 0;
}

.buy-now:hover .icon {
  transform: scale(1.25) skew(-5deg);
  opacity: 1;
}
.buy-now .icon-check:before {
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.buy-now.added .icon-check:before {
  opacity: 1;
}

.buy-now:hover {
  font-style: italic;
}

@media screen and (min-width: 60em) {

  #app .buy-now {
    position: relative;
    margin: 1em 0 1em 1em;
  }

  #app .variant-selector .plain li {
    padding: 0 0 0.5em 0;
    white-space: nowrap;
    cursor: pointer;
    opacity: 0.8;
    width: auto;
    height: auto;
  }

  #app .variant-selector .plain {
    flex-flow: nowrap column;
  }

  #app h3.selected-variant {
    display: none;
  }
  #app .variant-selector {
    position: absolute;
    top: 0;
    right: 0;
    width: 20em;
    padding-top: 2em;
    text-align: left;
  }

  #app .variant-selector li span.text {
    display: inline-block;
  }

  #app .variant-selector .plain li.active {
    font-style: italic;
    opacity: 1;
  }

  #app .image-selector {
    width: 80%;
  }
}

#app .image-selector {
  position: relative;
}

#app .image-selector > .set-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity .5s ease-in-out;
}

#app .image-selector > .set-container figure {
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-flow: nowrap row;
  justify-content: center;
  align-items: center;
}

#app .image-selector > .set-container figure img {
  width: 75%;
}

#app .product-overlay .close {
  position: fixed;
  top: 3em;
  margin-top: 2vh;
  right: 1%;
  font-size: 1.5em;
  z-index: 50;
  cursor: pointer;
  opacity: 0.5;
  transform: scale(1);
  transition: all 0.25s ease-in-out;
}

#app .product-overlay .close:hover {
  opacity: 1;
  transform: scale(1.125);
}

#app .image-selector > .set-container.active {
  opacity: 1;
}


#app .product-body h2 {
  font-size: 1.1em;
}

#app .product-body h2:first-child {
  margin-top: 0;
  padding-top: 0;
}


</style>