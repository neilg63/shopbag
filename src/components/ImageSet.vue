 <template>
 <section class="image-set" :class="sectionClasses">
  <div :class="contClasses">
    <figure v-for="(image,index) in images" class="image" v-on:click.stop="handleSelect(image,index)" :draggable="draggable">
      <vue-picture :imgset="image" :group="image.groupName" :className="image.classNames.join(' ')"></vue-picture>
    </figure>
  </div>
  <template v-if="showNav">
    <div class="slide-nav left-nav" v-on:click.stop="prev()"></div>
    <div class="slide-nav right-nav" v-on:click.stop="next()"></div>
  </template>
</section>
</template>
<script>
import VuePicture from './VuePicture'
export default {
  name: 'ImageSet',
  components: {
    VuePicture
  },
  props: {
    section: {
      type: Object,
      required: true,
      default: null
    }
  },
  data () {
    return {
      images: [],
      numImages: 0,
      contClasses: [],
      sectionClasses: [],
      showNav: false,
      currIndex: 0,
      draggable: false
    }
  },
  created () {
    if (this.section.images) {
      if (this.section.images instanceof Array) {
        this.images = this.section.images.map((img,index) => {
          let oddClass = index % 2 === 0 ? 'odd' : 'even'
          img.classNames = ['num-' + index, oddClass]
          img.groupName = 'half'
          return img
        })
        this.numImages = this.images.length
        switch (this.section.layout) {
          case 'column':
            break
          case 'slides-2':
            this.contClasses.push('flex-row')
            this.sectionClasses.push('anim')
            this.contClasses.push('draggable')
            this.showNav = true
            this.draggable = true
            break
          default:
            this.contClasses.push('flex-row')
            break
        }
        this.contClasses.push(this.section.layout.replace(/_/g,'-'))
      }
    }
  },
  methods: {
    handleSelect (image, index) {
      switch (this.section.layout) {
        case 'slides-2':
          this.pause()
          break
      }
    },
    pause () {
      if (this.sectionClasses.indexOf('pause') < 0) {
        let index = this.sectionClasses.indexOf('anim')
        if (index >= 0) {
          this.sectionClasses.splice(index,1)
        }
        this.sectionClasses.push('pause')
      }
    },
    next () {
      this.nextPrev()
    },
    prev () {
      this.nextPrev('prev')
    },
    nextPrev (mode) {
      this.pause()
      let ni = this.currIndex
      if (mode == 'prev') {
        ni--
      } else {
        ni++
      }
      if (ni < 0) {
        ni = this.numImages - 1
      } else if (ni >= this.numImages) {
        ni = 0
      }
      let offInd = this.contClasses.findIndex(c => /offset-\d/.test(c))
      if (offInd >= 0) {
        this.contClasses.splice(offInd, 1)
      }
      this.contClasses.push('offset-' + ni)
      this.currIndex = ni
    }
  },
}
</script>
<style>
#app .image-set .flex-row {
  display:  flex;
  flex-flow: wrap row;
}
#app section.image-set .slide-nav {
  position: absolute;
  top: 0;
  width:  9vw;
  bottom: 0;
  z-index:  20;
}
#app section.image-set .left-nav {
  left:  0;
}
#app section.image-set .right-nav {
  left: 90vw;
}
#app .image-set {
  max-width:  100%;
}
#app section.image-set .slides-2 {
  position: relative;
  flex-flow: nowrap row;
  width: 1000%;
  overflow: hidden;
  background-color: white;
}
#app section.image-set.anim .slides-2 {
  animation: twinslides 10s infinite;
}
#app section.image-set.pause .slides-2 {
  animation: none;
}
#app section.image-set .slides-2,
#app section.image-set .slides-2 figure {
  height: 20vw;
  transition: height .5s ease-in-out;
}
#app section.image-set .slides-2 figure {
  display: flex;
  flex-flow: nowrap row;
  justify-content: center;
  align-items: center;
}
#app section.image-set .slides-2 figure img {
  max-width: 38vw;
  max-height: 20vw;
  width: auto;
  height: auto;
  transition: max-height .5s ease-in-out;
}
#app section.image-set:hover .slides-2,
#app section.image-set:hover .slides-2 figure {
  height: 30vw;
}
#app section.image-set:hover .slides-2 figure img {
  max-height: 30vw;
}
#app .image-set .slides-2 .draggable figure {
  cursor: move;
  overflow: scroll;
  resize: both;
  max-width: 100vw;
  max-height: 40vw;
}
#app section.image-set .slides-2 figure {
  position: relative;
  width: auto;
}
#app section.image-set .slides-2 figure picture,
#app section.image-set .slides-2 figure {
  transition: transform .5s ease-in-out;
}
#app section.image-set .slides-2 figure:hover {
  transform: scale(1.1667);
}
#app section.image-set .slides-2 figure picture {
  position: relative;
  display: block;
  margin: 0 16vw 0 8vw;
}
#app section.image-set:hover .slides-2 figure picture {
  margin: 0 10vw 0 5vw;
}
#app section.image-set.anim .slides-2 figure:hover picture.even {
  transform: rotate(-5deg);
}
#app section.image-set.anim .slides-2 figure:hover picture.odd {
  transform: rotate(5deg);
}
#app section.image-set.pause .slides-2 {
  transition: left .5s ease-in-out;
}
#app section.image-set .slides-2.offset-1 {
  left:  -28.66vw;
}
#app section.image-set .slides-2.offset-2 {
  left:  -57.33vw;
}
#app section.image-set .slides-2.offset-3 {
  left:  -80vw;
}
#app section.image-set .slides-2.offset-4 {
  left:  -106.666vw;
}
#app section.image-set .slides-2.offset-5 {
  left:  -133.33vw;
}
#app section.image-set:hover .slides-2.offset-1 {
  left:  -40vw;
}
#app section.image-set:hover .slides-2.offset-2 {
  left:  -80vw;
}
#app section.image-set:hover .slides-2.offset-3 {
  left:  -120vw;
}
#app section.image-set:hover .slides-2.offset-4 {
  left:  -160vw;
}
#app section.image-set:hover .slides-2.offset-5 {
  left:  -200vw;
}
#app .image-set figure {
  max-width:  100%;
}
#app .image-set figure img {
  width:  100%;
  height:  auto;
}
@keyframes twinslides {
  0% {
    left: 0;
  }
  20% {
    left: -100vw;
  }
  35% {
    left: -200vw;
  }
  45% {
    left: -200vw;
  }
  60% {
    left: -100vw;
  }
  80% {
    left: 0;
  }
  100% {
    left: 0;
  }
}
@media screen and (min-width: 650px) {
  #app .image-set .row-6 figure,
  #app .image-set .row-5 figure,
  #app .image-set .row-4 figure,
  #app .image-set .row-2 figure {
    width:  50%;
    max-width: 50vw;
  }
  #app .image-set .row-3 figure{
    width:  33.33%%;
  }
}
@media screen and (min-width: 975px) {
  #app .image-set .row-5 figure,
  #app .image-set .row-6 figure {
    width:  33.333%;
  }
}
@media screen and (min-width: 1300px) {
  #app .image-set .row-6 figure {
    width:  16.66666%;
  }
  #app .image-set .row-5 figure {
    width:  20%;
  }
  #app .image-set .row-4 figure {
    width:  25%;
  }
}
</style>
