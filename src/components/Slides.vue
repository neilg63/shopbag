<template>
  <section class="slides-container top-slides" :class="sectionClasses">
    <ul v-if="numImages > 0" class="flex-slides" :class="itemClass">
      <li v-for="(image,i) in images" :key="i" :class="image.imgClasses">
        <figure :class="image.alignment" :style="image.styles">
          <vue-picture :imgset="image" group="wide" className="wide"></vue-picture>
        </figure>
      </li>
    </ul>
    <ol v-if="numImages > 0" class="dot-nav">
      <li v-for="(item, i) in navItems" v-on:click="showIndex(i)" :key="i" :class="{'active': i == index}"></li>
    </ol>
    <ol class="arrow-nav">
      <li class="prev icon-chevron-thin-left" v-on:click="showPrev()"></li>
      <li class="next icon-chevron-thin-right" v-on:click="showNext()"></li>
    </ol>
  </section>
</template>

<script>

import _ from 'lodash'
import VuePicture from './VuePicture'

export default {
  name: 'Slides',
  components: {
    VuePicture
  },
  data () {
    return {
      images: [],
      numImages: 0,
      navItems: [],
      index: 0,
      crossover: false,
      loaded: false,
      sectionClasses: ['loading']
    }
  },
  computed: {
    itemClass () {
      return 'item-' + (this.index + 1)
    }
  },
  watch: {
    loaded (newVal) {
      if (newVal) {
        let ci = this.sectionClasses.indexOf('loading')
        if (ci >= 0) {
          this.sectionClasses.splice(ci, 1)
        }
      }
    }
  },
  created () {
    let comp = this
    this.$bus.$on('load-slides', (images) => {
      comp.readData(images)
    });
  },
  methods: {
    readData (images) {
      if (images instanceof Array) {
        this.numImages = images.length
        let imgs = _.clone(images)
        let lastIndex = this.numImages - 1
        imgs.push(_.clone(images[0]))
        imgs.unshift(_.clone(images[lastIndex]))
        this.images = imgs.map((img, index) => {
          img.imgClasses = ['index-' + (index-1)]
          if (index === 0) {
            img.imgClasses.push('first')
          } else if (index === (this.numImages + 1)) {
            img.imgClasses.push('last')
          }
          if (!img.alignment) {
            img.alignment = 'center'
          }
          if (!img.styles) {
            img.styles = ''
          }
          img.has_styles = img.styles.length > 5
          if (!img.has_styles) {
            img.styles = ''
          }
          return img
        })
        this.navItems = _.clone(images)
        this.loaded = true
      }
    },
    showNext (forward) {
      let offset = forward === false ? -1 : 1
      let nx = this.index + offset
      if (nx < -1) {
        nx = this.numImages
      } else if (nx > this.numImages) {
        nx = -1
      }
      this.showIndex(nx)
    },
    showPrev () {
      this.showNext(false)
    },
    showIndex (index) {
      if (index >= -1 && index <= this.numImages) {
        this.index = index
        if (this.index < 0 || this.index >= this.numImages) {
          this.switchNextPrevMode()
        }
      }
    },
    switchNextPrevMode () {
      this.crossover = true
      let comp = this
      setTimeout(() => {
        setTimeout(() => {
          comp.sectionClasses.push('stable')
          if (comp.index < 0) {
            comp.index = comp.numImages - 1
          } else if (comp.index >= comp.numImages) {
            comp.index = 0
          }
        }, 50)
        setTimeout(() => {
          comp.crossover = false
          comp.sectionClasses = []
        }, 100)
      }, 900)
    }
  }
}
</script>
<style>
 
#app .slides-container {
  position: relative;
  width: 100vw;
  overflow: hidden;
}

#app ul.flex-slides {
  position: relative;
  display: flex;
  margin: 0;
  padding: 0;
  flex-flow: nowrap row;
  width: 30000vw;
  top: 0;
  left: 0;
  transition: left 1s ease-in-out;
}

#app .stable ul.flex-slides {
  transition: none;
}

#app .slides-container li {
  position: relative;
}

#app .top-slides ul.flex-slides {
  display: flex;
  margin-top: 10vh;
}
#app .top-slides ul.flex-slides,
#app .top-slides {
  overflow: hidden;
}

#app .top-slides ul.flex-slides li figure img,
#app .top-slides ul.flex-slides,
#app .top-slides {
  height: 90vh;
}
#app .top-slides ul.flex-slides li figure {
  display: flex;
  flex-flow: nowrap row;
  overflow:  hidden;
  justify-content: center;
  position: relative;
  max-height: 100%;
}
#app .top-slides ul.flex-slides li figure img {
  width:  auto;
}
#app .top-slides ul.flex-slides li figure.left {
  justify-content: flex-start;
}

#app ul.flex-slides.item--1 {
  left: 100vw;
}

#app ul.flex-slides.item-0 {
  left: 0;
}

#app ul.flex-slides.item-1 {
  left: -100vw;
}
#app ul.flex-slides.item-2 {
  left: -200vw;
}
#app ul.flex-slides.item-3 {
  left: -300vw;
}
#app ul.flex-slides.item-4 {
  left: -400vw;
}
#app ul.flex-slides.item-5 {
  left: -500vw;
}
#app ul.flex-slides.item-6 {
  left: -600vw;
}
#app ul.flex-slides.item-7 {
  left: -700vw;
}
#app ul.flex-slides.item-8 {
  left: -800vw;
}
#app ul.flex-slides.item-9 {
  left: -900vw;
}
#app ul.flex-slides.item-10 {
  left: -1000vw;
}
#app ul.flex-slides.item-11 {
  left: -1100vw;
}
#app ul.flex-slides.item-12 {
  left: -1200vw;
}

#app ul.flex-slides > li {
  margin: 0;
  padding: 0 0 1em 0;
  width: 100vw;
}
#app ul.flex-slides li figure {
  width: 100%;
}

</style>
