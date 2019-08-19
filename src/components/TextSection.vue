<template>
  <section class="text-section" :class="sectionClasses">
    <aside v-if="showBlock" class="subsection aside">
      <instaapi></instaapi>
    </aside>
    <div class="main-text subsection">
      <h3 v-if="hasTitle"></h3>
      <article v-if="hasSingle" v-html="text" class="body"></article>
    </div>
    <template v-if="hasSlides">
      <div class="slides">
        <article
          v-for="(slide,index) in slides"
          :key="index"
          v-html="slide"
          :class="{'active': index == currIndex}"
        ></article>
      </div>
    </template>
  </section>
</template>
<script>
import Instaapi from "./Instaapi";
import axios from "axios";

export default {
  name: "TextSection",
  components: {
    Instaapi
  },
  props: {
    section: {
      type: Object,
      required: true,
      default: null
    }
  },
  data() {
    return {
      id: 0,
      title: "",
      text: "",
      slides: [],
      currIndex: 0,
      numSlides: 0,
      layout: "single",
      multiple: false,
      hasSingle: false,
      hasSlides: false,
      block: "",
      showBlock: false
    };
  },
  created() {
    this.assign(this.section);
    switch (this.layout) {
      case "fade":
        this.cycle();
        this.hasTitle = false;
        break;
    }
    let comp = this;
    this.$bus.$on("siteinfo", data => {
      if (data.home.sections && comp.id > 0) {
        let matched = data.home.sections.find(s => s.id == comp.id);
        if (matched) {
          comp.assign(matched);
        }
      }
    });
  },
  methods: {
    cycle() {
      setInterval(() => {
        let nx = this.currIndex + 1;
        if (nx >= this.numSlides) {
          nx = 0;
        }
        this.currIndex = nx;
      }, 5000);
    },
    assign(section) {
      if (section.id) {
        this.id = parseInt(section.id);
      }
      if (typeof section.title == "string") {
        this.title = section.title.trim();
        this.hasTitle = this.title.length > 1;
      }
      if (typeof section.text == "string") {
        this.text = section.text.trim();
        this.hasSingle = this.text.length > 1;
      }
      if (section.text instanceof Array) {
        this.slides = section.text;
        this.numSlides = this.slides.length;
        this.hasSlides = this.numSlides > 0;
      }
      this.sectionClasses = [];
      if (section.text_layout) {
        this.layout = section.text_layout;
      }
      if (section.showBlock) {
        this.showBlock = section.showBlock;
        this.block = section.block;
        this.layout = "side-block";
        this.sectionClasses.push("has-block");
      }
      if (this.layout) {
        this.sectionClasses.push(this.layout.replace(/_/g, "-"));
      }
      if (this.hasSlides) {
        this.sectionClasses.push("flex-row");
        this.sectionClasses.push("num-" + this.slides.length);
      }
    }
  }
};
</script>
<style>
.text-section.fade,
.text-section.fade .slides,
.text-section.blocks,
.text-section.side-block > .main-text,
.home-pane .text-section {
  min-height: 20em;
  position: relative;
}

.text-section.fade .slides > article {
  height: 15em;
  padding: 2.5em 5%;
}

@media screen and (min-height: 40em) {
  .text-section.fade,
  .text-section.fade .slides,
  .text-section.blocks,
  .text-section.side-block > .main-text,
  .home-pane .text-section,
  .text-section {
    min-height: 40vh;
    position: relative;
  }
  .text-section.fade .slides > article {
    padding: 5vh 5%;
    height: 30vh;
  }
}

.text-section.single,
.text-section.side-block > .main-text,
.text-section.fade .slides > article,
.text-section.blocks .slides {
  display: flex;
  align-items: center;
}

.text-section.single article {
  padding: 2em 10%;
  text-align: left;
  margin: 0 auto;
  max-width: 60em;
}

.text-section.fade .slides > article,
.text-section.blocks .slides {
  justify-content: center;
}

.text-section.blocks .slides {
  flex-flow: nowrap row;
}

.text-section.fade .slides > article {
  flex-flow: nowrap column;
  font-size: 1.2em;
  width: 90%;
}

.text-section .slides {
  position: relative;
  height: 100%;
}

.text-section article h3 {
  -webkit-margin-before: 0;
}

.has-block {
}

#app .fade .slides > .bg,
.fade > .slides > article {
  position: absolute;
}

.fade > .slides > article {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.5s ease-in-out;
}

.fade .slides > article.active {
  opacity: 1;
  z-index: 2;
}

.fade .slides > .bg {
  height: 4vmin;
  width: 4vmin;
  z-index: 3;
  transition: all 0.5s ease-in-out;
} /* 

.fade .slides:hover > .bg {
  height: 9vmin;
  width: 8vmin;
}

.fade .slides > .bg.top-left {
  top: 3vmin;
  left: 3vmin;
  border-top: dashed 1px rgba(0, 0, 0, 0.5);
  border-left: dashed 1px rgba(0, 0, 0, 0.5);
}

.fade .slides > .bg.top-right {
  top: 3vmin;
  right: 3vmin;
  border-top: dashed 1px rgba(0, 0, 0, 0.5);
  border-right: dashed 1px rgba(0, 0, 0, 0.5);
}

#app .has-intro .slides > .bg.top-right {
  border-top: none;
  border-right: none;
  cursor: pointer;
}

#app .has-intro .slides > .bg.top-right:before {
  position: absolute;
  top: 0;
  right: 0;
  font-family: icomoon;
  content: "\e912";
  font-size: 2em;
}

.fade .slides > .bg.bottom-left {
  bottom: 3vmin;
  left: 3vmin;
  border-bottom: dashed 1px rgba(0, 0, 0, 0.5);
  border-left: dashed 1px rgba(0, 0, 0, 0.5);
}

.fade .slides > .bg.bottom-right {
  bottom: 3vmin;
  right: 3vmin;
  border-bottom: dashed 1px rgba(0, 0, 0, 0.5);
  border-right: dashed 1px rgba(0, 0, 0, 0.5);
} */

.home-pane aside.site-intro {
  position: absolute;
  top: 10%;
  height: 80%;
  left: -90%;
  width: 80%;
  z-index: -1;
  text-align: left;
  pointer-events: none;
  transition: left 0.75s ease-in-out;
  background-color: rgb(228, 228, 228);
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.home-pane section.text-section.show-intro aside.site-intro {
  left: 10%;
  z-index: 20;
}

@media screen and (min-width: 40em) {
  .text-section.fade .slides > article {
    font-size: 1.33em;
  }

  .text-section.side-block {
    display: flex;
    flex-flow: nowrap row;
  }

  .text-section.side-block > .subsection {
    width: 50%;
  }

  .text-section.side-block > .main-text > article {
    padding: 5%;
  }
}
@media screen and (min-height: 40em) and (min-width: 60em) {
  .text-section.fade .slides > article {
    font-size: 1.5em;
  }

  .text-section.side-block #instafeed,
  .text-section.side-block .instafeed-wrapper,
  #app .text-section.side-block > .main-text {
    min-height: 62.5vh;
  }
}

@media screen and (min-width: 80em) {
  .text-section.fade .slides > article {
    font-size: 1.667em;
  }

  #app .text-section.side-block > .aside,
  #app .text-section.side-block > .main-text {
    width: auto;
    max-width: 50%;
  }
}
</style>