 <template>
 <section class="image-set" :class="sectionClasses">
  <div :class="contClasses">
    <figure v-for="(image,index) in images" class="image" :class="image.figClass" v-on:click.stop="handleSelect(image,index)">
      <vue-picture :imgset="image" :group="image.groupName" :className="image.classNames.join(' ')"></vue-picture>
    </figure>
  </div>
  <template v-if="showNav">
    <div class="slide-nav left-nav icon-arrow-left" v-on:click.stop="prev()"></div>
    <div class="slide-nav right-nav icon-arrow-right" v-on:click.stop="next()"></div>
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
      cycleIv: null
    }
  },
  created () {
    this.assignSection()
  },
  watch: {
    section (newVal) {
      this.assignSection()
    }
  },
  methods: {
    assignSection () {
      if (this.section.images) {
        if (this.section.images instanceof Array) {
          this.images = this.section.images.map((img,index) => {
            let oddClass = index % 2 === 0 ? 'odd' : 'even'
            img.classNames = ['num-' + index, oddClass]
            img.groupName = 'half'
            img.figClass = index > 0?'' : 'active'
            return img
          })
          this.numImages = this.images.length
          switch (this.section.layout) {
            case 'column':
              break
            case 'aspect':
              this.cycleActive()
              break
            case 'slides-2':
              this.contClasses.push('flex-row')
              this.contClasses.push('offset-0')
              this.showNav = true
              break
            default:
              this.contClasses.push('flex-row')
              break
          }
          this.contClasses.push(this.section.layout.replace(/_/g,'-'))
          this.contClasses.push('num-images-' + this.numImages)
        }
      }
    },
    handleSelect (image, index) {
      switch (this.section.layout) {
        case 'aspect':
          this.handleAspect()
          break
      }
    },
    handleAspect () {
      if (this.cycleIv) {
        clearInterval(this.cycleIv)
      } else {
        this.next()
      }
    },
    next () {
      this.nextPrev()
    },
    prev () {
      this.nextPrev('prev')
    },
    nextPrev (mode) {
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
      this.images = this.images.map((img,index) => {
        img.figClass = index === ni? 'active' : ''
        return img
      })
    },
    cycleActive () {
      let comp = this
      this.cycleIv = setInterval( () => {
        comp.next()
      }, 2000)
    }
  },
}
</script>
<style>
#app .image-set .flex-row {
  display:  flex;
  flex-flow: wrap row;
  justify-content: center;
  align-items: center;
}

#app .main > div > section {
  position: relative;
}

#app section.image-set .slide-nav {
  position: absolute;
  top: 0;
  width:  33.333vw;
  bottom: 0;
  z-index:  20;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.75s ease-in-out;
  cursor: pointer;
}

#app section.image-set .slide-nav:before {
  position: absolute;
  top: 36%;
  font-size: 6vw;
}

#app section.image-set .slide-nav:hover {
  opacity: 0.5;
  transform: skew(-5deg);
}

#app section.image-set .left-nav {
  left:  0;
}

#app section.image-set .left-nav:before {
  left: 5%;
}

#app section.image-set .right-nav {
  left: 65vw;
}

#app section.image-set .right-nav:before {
  right: 5%;
}

#app .image-set {
  max-width:  100%;
  background-color: white;
}
#app section.image-set .slides-2 {
  position: relative;
  flex-flow: nowrap row;
  overflow: hidden;
}

#app section.image-set .slides-2.num-images-2 {
  width: 200%;
}

#app section.image-set .slides-2.num-images-3 {
  width: 300%;
}

#app section.image-set .slides-2.num-images-4 {
  width: 400%;
}

#app section.image-set .slides-2.num-images-5 {
  width: 500%;
}

#app section.image-set .slides-2.num-images-6 {
  width: 600%;
}

#app section.image-set .slides-2.num-images-7 {
  width: 700%;
}

#app section.image-set .slides-2.num-images-8 {
  width: 800%;
}

#app section.image-set .slides-2.num-images-9 {
  width: 900%;
}

#app section.image-set .slides-2,
#app section.image-set .slides-2 figure {
  height: 25vw;
  transition: height .5s ease-in-out;
}
#app section.image-set .slides-2 figure {
  position: relative;
  display: flex;
  flex-flow: nowrap row;
  justify-content: center;
  align-items: center;
  width: 100vw;
}
#app section.image-set .slides-2 figure img {
  max-width: 45vw;
  max-height: 25vw;
  width: auto;
  height: auto;
  transform: scale(-.5,.5) translateX(125vw);
  transition: transform .5s ease-in-out;
}

#app section.image-set .slides-2 figure:hover {
  transform: scale(1.5);
}

#app section.image-set .slides-2.offset-0 .num-0 img,
#app section.image-set .slides-2.offset-1 .num-1 img,
#app section.image-set .slides-2.offset-2 .num-2 img,
#app section.image-set .slides-2.offset-3 .num-3 img,
#app section.image-set .slides-2.offset-4 .num-4 img,
#app section.image-set .slides-2.offset-5 .num-5 img,
#app section.image-set .slides-2.offset-6 .num-6 img {
  transform: scale(1,1) translateX(0);
}

#app section.image-set .slides-2 figure picture,
#app section.image-set .slides-2 figure {
  transition: transform 1s ease-in-out;
}

#app section.image-set .slides-2.offset-1 {
  left:  -100vw;
}


#app section.image-set .slides-2.offset-2 {
  left:  -200vw;
}
#app section.image-set .slides-2.offset-3 {
  left:  -300vw;
}
#app section.image-set .slides-2.offset-4 {
  left:  -400vw;
}
#app section.image-set .slides-2.offset-5 {
  left:  -500vw;
}
#app section.image-set .slides-2.offset-6 {
  left:  -600vw;
}
#app section.image-set .slides-2.offset-7 {
  left:  -700vw;
}
#app section.image-set .slides-2.offset-8 {
  left:  -800vw;
}
#app section.image-set .slides-2.offset-9 {
  left:  -900vw;
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

#app .image-set .row-6,
#app .image-set .row-5 {
  overflow: hidden;
}


#app .image-set .row-6 figure {
  width:  50%;
  max-width: 50vw;
}

#app .image-set .row-6 figure img,
#app .image-set .row-5 figure img {
  position: relative;
  transition: transform 0.75s ease-in-out;
  transform: scale(1);
  z-index: 3;
  padding: 1.5vw 3vw;
  cursor: pointer;
}

#app .image-set .row-6 figure:hover img,
#app .image-set .row-5 figure:hover img {
  transform: scale(1.5);
  z-index: 20;
}

#app .image-set .aspect figure {
  opacity: 0;
  transform: scale(-1, 1);
  transition: all .5s ease-in-out;
}

#app .image-set .aspect figure.active {
  opacity: 1;
  transform: scale(1, 1);
}


@media screen and (min-width: 650px) {
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
  #app .image-set .row-6 figure:hover img,
  #app .image-set .row-5 figure:hover img {
    transform: scale(2);
  }
}
</style>
