<template>
  <section class="slides-container products">
    <ul v-if="products.length > 0" class="flex-slides" :class="itemClasses">
      <li v-for="product in products">
        <figure v-on:click="triggerShow(product)">
          <img :src="product.img"/>
          <figcaption>{{product.id}}</figcaption>
        </figure>
      </li>
    </ul>
    <ol class="dot-nav">
      <li v-for="(product, i) in products" v-on:click="showIndex(i)" :class="{'active': i == index}"></li>
    </ol>
    <ol class="arrow-nav">
      <li class="prev icon-chevron-thin-left" v-on:click="showPrev()"></li>
      <li class="next icon-chevron-thin-right" v-on:click="showNext()"></li>
    </ol>
  </section>
</template>

<script>
export default {
  name: 'Products',
  data () {
    return {
      products: [],
      index: 0
    }
  },
  computed: {
    itemClasses () {
      let cls = ['item-' + this.index]
      if (this.index === 0) {
        cls.push('first')
      } else if (this.index == (this.products.length - 1)) {
        cls.push('last')
      }
      return cls
    }
  },
  created () {
    this.products = this.$parent.products
    let comp = this
    this.$bus.$on('load-products', (data) => {
      comp.products = data
    })
  },
  methods: {
    triggerShow (product) {
      this.$parent.showEcwidProduct(product)
    },
    showNext (forward) {
      let offset = forward === false? -1 : 1
      let nx = this.index + offset
      if (nx < 0) {
        nx = this.products.length - 1
      } else if (nx >= this.products.length) {
        nx = 0
      }
      this.index = nx
    },
    showPrev () {
      this.showNext(false)
    },
    showIndex (index) {
      if (index >= 0 && index < this.products.length) {
        this.index = index  
      }
    }
  }
}
</script>
