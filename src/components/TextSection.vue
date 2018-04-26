<template>
	<section class="text-section" :class="sectionClasses">
  	<h3 v-if="hasTitle"></h3>
    <template v-if="hasSingle" v-html="text">
    </template>
    <template v-if="hasSlides">
      <div class="slides">
        <article v-for="(slide,index) in slides" :key="index" v-html="slide" :class="{'active': index == currIndex}">
      </article>
      </div>
    </template>
  </section>
</template>
<script>
export default {
	name: 'TextSection',
  props: {
    section: {
      type: Object,
      required: true,
      default: null
    }
  },
  data () {
    return {
      title: '',
      text: '',
      slides: [],
      currIndex: 0,
      numSlides: 0,
      layout: 'single',
      multiple: false,
      hasSingle: false,
      hasSlides: false 
    }
  },
  created () {
    if (typeof this.section.title == 'string') {
      this.title = this.section.title.trim()
      this.hasTitle = this.title.length > 1
    }
    if (typeof this.section.text == 'string') {
      this.text = this.section.text.trim()
      this.hasSingle = this.text.length > 1
    }
    if (this.section.text instanceof Array) {
      this.slides = this.section.text
      this.numSlides = this.slides.length
      this.hasSlides = this.numSlides > 0
    }
    this.sectionClasses = []
    if (this.section.text_layout) {
      this.layout = this.section.text_layout
    }
    if (this.layout) {
      this.sectionClasses.push(this.layout.replace(/_/g, '-'))
    }
    if (this.hasSlides) {
      this.sectionClasses.push('flex-row')
      this.sectionClasses.push('num-' + this.slides.length)
    }
    switch (this.layout) {
      case 'fade':
        this.cycle()
        this.hasTitle = false
        break
    }
  },
  methods: {
    cycle () {
      setInterval(() => {
        let nx = this.currIndex + 1
        if (nx >= this.numSlides) {
          nx = 0
        }
        this.currIndex = nx
      }, 5000)
    }
  }
}
</script>
<style>

.text-section.fade,
.text-section.blocks,
.home-pane .text-section {
  min-height: 30em;
  position: relative;
}

.text-section.fade .slides > article {
  height: 25em;
  padding: 2.5em 5%;
}

@media screen and (min-height: 40em) {
  .text-section.fade,
  .text-section.blocks,
  .home-pane .text-section,
  .text-section {
    min-height: 50vh;
    position: relative;
  }
  .text-section.fade .slides > article {  
    padding: 5vh 5%;
    height: 40vh;
  }
}

.text-section.fade .slides > article,
.text-section.blocks .slides {
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-section.blocks .slides {
  flex-flow: nowrap row;
}

.text-section.fade .slides > article {
  flex-flow: nowrap column;
  font-size: 1.2em;
  width: 90%;
}

@media screen and (min-width: 40em) {
  .text-section.fade .slides > article {
    font-size: 1.33em;
  }
}
@media screen and (min-width: 60em) {
  .text-section.fade .slides > article {
    font-size: 1.5em;
  }
}

@media screen and (min-width: 80em) {
  .text-section.fade .slides > article {
    font-size: 1.667em;
  }
}

.text-section .slides {
  position: relative;
  height: 100%;
}

.fade > .slides > article {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0;
  z-index: -1;
  transition: opacity .5s ease-in-out;
}

#app .fade .slides > article.active {
  opacity: 1;
  z-index: 2;
}

</style>