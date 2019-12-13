<template>
  <div class="block instafeed-wrapper">
    <div class="bg-repeat-container">
      <div v-for="bg in bgs" class="bg-repeat" :class="bg.className" :key="bg.key"></div>
    </div>
    <div id="instafeed" :style="renderedStyle">
      <figure
        v-for="(img, ii) in images"
        :key="img.id"
        :class="figureClasses(ii)"
        @click="toggle()"
      >
        <img :src="img.uri" alt="img.caption" />
        <figcaption>{{img.caption}}</figcaption>
      </figure>
    </div>
    <div class="control icon-instagram link-wrapper">
      <a :href="fullUrl" target="_blank" title="Full instagram feed"></a>
    </div>
    <div class="control icon-chevron-thin-left scroll-left" @click="prev"></div>
    <div class="control icon-chevron-thin-right scroll-right" @click="next"></div>
  </div>
</template>
<script>
import u from "../utils/utils";
import axios from "axios";

export default {
  name: "Instaapi",
  props: {
    limit: {
      type: Number,
      required: false,
      default: 12
    },
    sortBy: {
      type: String,
      required: false,
      default: "most-recent"
    },
    resolution: {
      type: String,
      required: false,
      default: "standard"
    },
    numBgs: {
      type: Number,
      required: false,
      default: 10
    }
  },
  data() {
    return {
      name: "lucyofsyracuse",
      fullUrl: "https://www.instagram.com/lucyofsyracuse",
      apiUrl: "/instaapi",
      num: 20,
      images: [],
      coreEl: null,
      maxWidth: 0,
      currIndex: 0,
      atMaxOffset: false,
      containerWidth: 1024,
      lastEl: null,
      numPerScreen: 3,
      currDir: "next",
      interval: null
    };
  },
  mounted() {
    setTimeout(() => {
      this.coreEl = document.getElementById("instafeed");
      this.init();
    }, 500);
  },
  computed: {
    hasMaxWidth() {
      return this.maxWidth > 240;
    },
    renderedStyle() {
      let items = [];
      if (this.hasMaxWidth) {
        items.push("max-width: " + this.maxWidth * 1.04 + "px");
        let ml = 0;
        if (this.currIndex > 0) {
          ml = 0 - this.offsetLeft;
          items.push("margin-left: " + ml + "px");
        }
      }
      return items.join(";");
    },
    lastIndex() {
      return this.images.length - 1;
    },
    figureOuterWidth() {
      return this.maxWidth / this.images.length;
    },
    offsetLeft() {
      return (this.maxWidth / this.images.length) * this.currIndex;
    },
    bgs() {
      let els = [];
      let oddEvenClass = "";
      for (let i = 0; i < this.numBgs; i++) {
        oddEvenClass = i % 2 === 0 ? "odd" : "even";
        els.push({
          index: i,
          key: "horizontal-background-" + i,
          className: ["bg-" + i, oddEvenClass]
        });
      }
      return els;
    }
  },
  methods: {
    init() {
      let url = this.apiUrl;
      axios
        .get(url)
        .then(response => {
          if (response.data) {
            if (response.data.images) {
              this.images = response.data.images;
              setTimeout(this.calcMaxWidth, 500);
              setTimeout(this.cycle, 2000);
            }
          }
        })
        .catch(e => {
          console.log(e);
        });
      window.addEventListener("resize", this.calcMaxWidth);
    },
    resolutionId() {
      return this.resolution + "_resolution";
    },
    figureClasses(index) {
      let cls = ["instagram-index-" + index];
      const tgIndex = this.currIndex + Math.floor(this.numPerScreen / 2);
      if (index === tgIndex) {
        cls.push("selected");
      }
      return cls;
    },
    stop() {
      clearInterval(this.interval);
      this.interval = null;
    },
    toggle() {
      if (this.interval) {
        this.stop();
      } else {
        this.cycle();
      }
    },
    move(mode) {
      const offset = mode === "prev" ? -1 : 1;
      let tgIndex = this.currIndex + offset;
      if (tgIndex < 0) {
        tgIndex = 0;
        this.currDir = "next";
      }
      if (tgIndex > this.lastIndex) {
        tgIndex = this.lastIndex;
      }
      if (this.lastEl) {
        const lastElOffset = this.lastEl.offsetLeft - this.offsetLeft;
        this.atMaxOffset =
          lastElOffset <= this.containerWidth - this.figureOuterWidth;
        if (!this.atMaxOffset || offset < 0) {
          this.currIndex = tgIndex;
        }
        if (this.atMaxOffset) {
          this.currDir = "prev";
        }
      }
    },
    next() {
      this.move("next");
    },
    prev() {
      this.move("prev");
    },
    slide() {
      this.move(this.currDir);
    },
    cycle() {
      this.interval = setInterval(this.slide, 5000);
    },
    calcMaxWidth() {
      let w = 0;
      if (this.images.length > 0) {
        const figs = document.querySelectorAll("#instafeed > figure");
        const container = document.querySelector(".instafeed-wrapper");
        if (container) {
          this.containerWidth = container.offsetWidth;
        }
        this.lastEl = document.querySelector(
          "figure.instagram-index-" + this.lastIndex
        );
        if (figs.length > 0) {
          let s = null;
          let ml = 0;
          for (let fig of figs) {
            s = window.getComputedStyle(fig, null);
            ml = parseInt(s.getPropertyValue("margin-left"));
            w += fig.offsetWidth + ml * 2;
          }
        }
      }
      this.maxWidth = w;
      this.numPerScreen = Math.floor(
        this.containerWidth / this.figureOuterWidth
      );
    }
  }
};
</script>
<style>
#app .text-section.instafeed.side-block > .main-text {
  position: absolute;
  top: 2vw;
  min-height: 6em;
}

.instafeed-wrapper,
#instafeed {
  width: 100%;
  position: relative;
  transition: margin-left 1s ease-in-out;
}

.instafeed-wrapper {
  max-width: 100vw;
}

#instafeed {
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  width: 500%;
  padding: 40vw 0 5vw 0;
  min-height: 45vw;
}

.instafeed-wrapper {
  overflow: hidden;
}

#instafeed figure img {
  width: 100%;
  height: auto;
}

#app .main > div > .sections > section.instafeed > aside.subsection,
#app .main > div > .sections > section.instafeed {
  overflow-y: visible;
}

#instafeed figure {
  width: 40vw;
  height: 60vw;
  padding: 0;
  margin: 0 5vw -20vw 5vw;
  position: relative;
  transition: transform 1s ease-in-out;
  z-index: 20;
  cursor: pointer;
  overflow: hidden;
}

#instafeed figure.selected,
#instafeed figure:hover {
  z-index: 200;
}

#instafeed figure.selected {
  transform: scale(1.25) translateY(-2.5%);
}
#instafeed figure:hover {
  transform: scale(1.25) translateY(-6.25%);
}

#instafeed figure:nth-child(2n) {
  top: 2vw;
}

#instafeed figure:nth-child(2n-1) {
  top: -2vw;
}

#instafeed figure figcaption {
  position: relative;
  font-size: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 1.25em 5% 0.5em 5%;
  text-align: left;
  opacity: 0;
  height: 0;
  overflow: hidden;
  margin: -1vw 0 0 0;
  pointer-events: none;
  user-select: none;
}

#app #instafeed figure img {
  position: relative;
  max-width: 100%;
  z-index: 10;
  margin: 0;
}

#instafeed figure:hover figcaption {
  opacity: 1;
  height: auto;
}

.instafeed-wrapper .link-wrapper a,
.instafeed-wrapper .control:before,
.instafeed-wrapper .control {
  position: absolute;
}

#app .instafeed-wrapper .icon-instagram {
  bottom: 5%;
  left: 47.5%;
}

#app .instafeed-wrapper .icon-instagram:before {
  font-size: 4vw;
}

.instafeed-wrapper .control {
  z-index: 3000;
}

.instafeed-wrapper .control {
  opacity: 0.5;
  transition: opacity 0.33s ease-in-out;
  bottom: 10%;
  height: 2em;
}

.instafeed-wrapper:hover .control {
  opacity: 1;
  color: rgb(228, 228, 228);
}

.instafeed-wrapper .scroll-left {
  left: 0;
  height: 2em;
}

.instafeed-wrapper .scroll-right {
  right: 0;
}

.instafeed-wrapper .control:before {
  font-size: 6vw;
  transition: transform 0.33s ease-in-out;
  cursor: pointer;
  position: absolute;
  top: 0;
}

.instafeed-wrapper .scroll-left:before {
  left: 0;
}
.instafeed-wrapper .scroll-right:before {
  right: 0;
}

.instafeed-wrapper .link-wrapper {
  left: 1vw;
  font-size: 4vw;
  width: 1em;
  height: 1em;
  transition: transform 0.333s ease-in-out;
}

.instafeed-wrapper .link-wrapper a {
  display: block;
  width: 3em;
  min-height: 1.5em;
  z-index: 20;
}

.instafeed-wrapper .bg-repeat-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-flow: column;
}

.instafeed-wrapper .bg-repeat-container .bg-repeat {
  position: relative;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background-image: url("/static/images/logo-font-white.svg");
  background-repeat: repeat-x;
  background-size: contain;
}
.instafeed-wrapper .bg-repeat-container .bg-repeat.odd {
  background-position: 5% 0;
}

.instafeed-wrapper .link-wrapper:hover {
  transform: scale(1.0625) translateX(-2.5%);
}

@media screen and (min-width: 80em) {
  .instafeed-wrapper .link-wrapper {
    font-size: 2em;
    left: 1rem;
  }
}

@media (min-width: 480px) {
  #instafeed {
    padding: 35vw 0 5vw 0;
  }
  #instafeed figure figcaption {
    font-size: 0.625rem;
  }
}

@media screen and (min-width: 768px) {
  #instafeed {
    min-height: 32vw;
    padding: 27vw 0 5vw 0;
  }
  #instafeed figure {
    width: 25vw;
    height: 39vw;
    margin: 0 4vw -14vw 4vw;
  }
  #instafeed figure.selected {
    transform: scale(1.25) translateY(-3.75%);
  }
  #instafeed figure:hover {
    transform: scale(1.25) translateY(-7.5%);
  }
  #instafeed figure figcaption {
    font-size: 0.75rem;
  }
}

@media screen and (min-width: 1080px) {
  #instafeed {
    padding: 23vw 0 5vw 0;
  }

  #instafeed figure.selected {
    transform: scale(1.25) translateY(-5%);
  }
  #instafeed figure:hover {
    transform: scale(1.25) translateY(-10%);
  }
  #instafeed figure figcaption {
    font-size: 0.8333rem;
  }
}

@media screen and (min-width: 1440px) {
  #instafeed {
    min-height: 25vw;
  }
  #instafeed figure {
    width: 19vw;
    height: 29vw;
    margin: 0 3vw -10vw 3vw;
  }
}

@media screen and (min-width: 1920px) {
  .instafeed-wrapper {
    max-width: 1920px;
  }
  #instafeed {
    min-height: 480px;
  }

  #instafeed figure {
    width: 364.8px;
    height: 556.8px;
    margin: 0 57.6px -192px 57.6px;
  }
}
</style>