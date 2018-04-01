<template>
  <section class="slides-container products">
    <ul v-if="products.length > 0" class="flex-slides" :class="itemClass">
      <li v-for="product in products">
        <figure v-on:click="triggerShow(product)">
          <img :src="product.img"/>
          <figcaption>{{product.id}}</figcaption>
        </figure>
      </li>
    </ul>
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
    itemClass () {
      return 'item-' + this.index
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
      if (nx < this.products.length && nx >= 0) {
        this.index = nx
      } else if (nx < 0) {
        this.index = this.products.length - 1
      } else {
        this.index = 0
      }
    },
    showPrev () {
      this.showNext(false)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
