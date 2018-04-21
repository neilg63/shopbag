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
        <li class="variant" :class="{'active':variant.active}" v-on:click="setActive(variant)" :data-index="variant.imgIndex">{{variant.title}}</li>
      </template>
    </ul>
      <div class="buy-now" v-if="selectedVariant" v-on:click="showEcwidSelector(selectedVariant)">
        <p>{{selectedVariant.price_formatted}}</p>
      </div>
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
      this.imageSets = []
      this.variants = this.product.variants.map( (v, vi) => {
        v.imgIndex = -1
        v.active = vi === 0
        if (v.active) {
          comp.selectedVariant = v
        }
        if (v.title) {
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
      this.$parent.hasActiveProduct = false
    },
    showEcwidSelector (variant) {
      if (variant.id) {
        this.$bus.$emit('show-ecwid-product', variant.id)
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
  width: 80%;
}

#app .variant-selector {
  position: absolute;
  top: 0;
  right: 0;
  width: 20em;
  padding-top: 2em;
  text-align: left;
}

#app .variant-selector .plain li {
  padding-bottom: 0.5em;
  white-space: nowrap;
  cursor: pointer;
  opacity: 0.8;
}

#app .variant-selector .plain li.active {
  font-style: italic;
  opacity: 1;
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
  position: absolute;
  top: 2%;
  right: 2%;
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

</style>