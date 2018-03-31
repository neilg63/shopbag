<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    
    <ul v-if="products.length > 0" class="flex-column">
      <li v-for="product in products">
        <figure v-on:click="triggerShow(product)">
          <img :src="product.img"/>
          <figcaption>{{product.id}}</figcaption>
        </figure>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      products: []
    }
  },
  created () {
    this.products = this.$parent.products
    let comp = this
    setTimeout(() => {
      console.log(comp.products)
    },10000)

  },
  methods: {
    triggerShow (product) {
      let tg = '.grid-product--id-' + product.id + ' a.grid-product__title'
      let el = document.querySelector(tg)
      if (el) {
        el.click()
        document.body.classList.add('show-store')
      }
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
