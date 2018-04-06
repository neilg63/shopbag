<template>
  <section class="slides-container top-slides" :class="{'loading': !loaded}">
    <ul v-if="numImages > 0" class="flex-slides" :class="itemClass">
      <li v-for="image in images">
        <figure :class="image.align">
          <img :src="image.sizes.max_2600x2600"/>
        </figure>
      </li>
    </ul>
    <ol v-if="numImages > 0" class="dot-nav">
      <li v-for="(image, i) in images" v-on:click="showIndex(i)" :key="i" :class="{'active': i == index}"></li>
    </ol>
    <ol class="arrow-nav">
      <li class="prev icon-chevron-thin-left" v-on:click="showPrev()"></li>
      <li class="next icon-chevron-thin-right" v-on:click="showNext()"></li>
    </ol>
  </section>
</template>

<script>
export default {
  name: 'Slides',
  data () {
    return {
      images: [],
      numImages: 0,
      index: 0,
      loaded: false
    }
  },
  computed: {
    itemClass () {
      return 'item-' + this.index
    }
  },
  created () {
    let comp = this
    let hd = this.$parent.$parent.homeData
    if (hd) {
      if (hd.images) {
        this.readData(hd)
      }
    }
    this.$bus.$on('page-path__home', (data) => {
      comp.readData(data)
    })
  },
  methods: {
    readData (data) {
      let d = data
      if (d.valid && d.images) {
        d.images = d.images.map(img => {
          if (!img.align) {
            img.align = 'center'
          }
          return img
        })
        this.images = d.images
        this.numImages = d.images.length
      }
    },
    showNext (forward) {
      let offset = forward === false ? -1 : 1
      let nx = this.index + offset
      if (nx < this.numImages && nx >= 0) {
        this.index = nx
      } else if (nx < 0) {
        this.index = this.numImages - 1
      } else {
        this.index = 0
      }
    },
    showPrev () {
      this.showNext(false)
    },
    showIndex (index) {
      if (index >= 0 && index < this.numImages) {
        this.index = index
      }
    }
  }
}
</script>
