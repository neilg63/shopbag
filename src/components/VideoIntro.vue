<template>
  <section id="video-overlay" :class="classNames" @click.stop="checkPlaying">
    <video
      v-if="isLoaded"
      id="top-full-background-video"
      class="large-background"
      :poster="backgroundPoster"
      autoplay
      muted
      loop
      playsinline
    >
      <source
        v-for="(source, bgi) in backgroundSources"
        :key="['bg',bgi].join('-')"
        :src="source.src"
        :type="source.type"
        :media="source.media"
      />
    </video>
    <figure class="screen-top full-height" id="foreground-container" @click.stop="checkPlaying">
      <div
        class="toggle-foreground"
        :class="toggleIcon"
        @mouseover="showToggle"
        @mouseout="hideToggle"
        @click="toggleVideo"
      ></div>
      <video
        v-if="hasForeground"
        @mouseover="showToggle"
        @mouseout="hideToggle"
        id="top-inlay-video"
        class="playable"
        :poster="fgPoster"
        controls
      >
        <source
          v-for="(source, bgi) in foregroundSources"
          :key="['bg',bgi].join('-')"
          :src="source.src"
          :type="source.type"
          :media="source.media"
        />
      </video>

      <div v-if="hasTopLinks" class="top-links">
        <h2 v-for="(tl, ti) in topLinks" :key="['top-link', ti].join('-')" :class="tl.className">
          <router-link v-bind:to="tl.link">{{tl.title}}</router-link>
        </h2>
      </div>
    </figure>

    <div
      class="scroller"
      :class="textScrollClass"
      :style="scrollerStyle"
      @click.stop="toggleTextScroller"
    >
      <p v-for="strapline in straplines" :key="strapline.key">{{strapline.text}}</p>
    </div>
  </section>
</template>
<script>
import utils from "../utils/utils";

export default {
  name: "VideoIntro",
  props: {
    videoSet: {
      type: Object,
      required: true,
      default() {
        return {
          size: [],
          formats: [],
          background: {},
          foreground: {}
        };
      }
    },
    sections: {
      type: Array,
      required: false,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      topLinks: [],
      currIndex: 0,
      bgLoaded: false,
      fgLoaded: false,
      loadForeground: false,
      showVideoToggle: false,
      foregroundEnabled: true,
      sourceText: "",
      scrollPos: -1,
      textInterval: -1,
      textScrollEndPos: 24
    };
  },
  computed: {
    isLoaded() {
      let loaded = false;
      if (this.videoSet.background) {
        const bgKeys = Object.keys(this.videoSet.background);
        if (bgKeys.indexOf("name") >= 0) {
          loaded = this.videoSet.background.name.length > 4;
        }
      }
      return loaded;
    },
    hasForeground() {
      const { path } = this.$route;
      return (
        path.length < 4 &&
        this.foregroundEnabled &&
        this.foregroundSources.length > 0 &&
        this.loadForeground
      );
    },
    hasTopLinks() {
      return this.topLinks.length > 0;
    },
    fgPoster() {
      if (this.foregroundSources.length > 0) {
        return this.foregroundSources[0].poster;
      }
    },
    classNames() {
      let cls = ["video-overlay"];
      if (this.isLoaded) {
        cls.push("data-loaded");
      }
      if (this.bgLoaded) {
        cls.push("background-loaded");
      }
      if (this.fgLoaded) {
        cls.push("foreground-loaded");
      }
      if (this.hasForeground) {
        cls.push("has-foreground");
      } else {
        cls.push("no-foreground");
      }
      if (this.showVideoToggle) {
        cls.push("show-toggle");
      }
      return cls;
    },
    backgroundSources() {
      let rows = [];
      if (this.isLoaded) {
        const { name } = this.videoSet.background;
        rows = this.videoSet.background.formats.map(row => {
          return this.addMediaAttrs(name, row);
        });
      }
      return rows;
    },
    backgroundPoster() {
      if (this.backgroundSources.length > 0) {
        return this.backgroundSources[0].poster;
      }
    },
    foregroundSources() {
      let rows = [];
      if (this.isLoaded) {
        const { names } = this.videoSet.foreground;
        const index = this.currIndex;
        if (index >= 0 && index < names.length) {
          const refName = names[index];
          rows = this.videoSet.foreground.formats.map(r => {
            this.addMediaAttrs(refName, r);
            return r;
          });
        }
      }
      return rows;
    },
    toggleIcon() {
      return this.hasForeground ? "icon-close" : "icon-chevron-thin-right";
    },
    straplines() {
      let sls = [];
      if (this.sourceText) {
        const paras = this.sourceText
          .replace(/(\w)\.(\s|$)/g, "$1----")
          .split("----");
        if (paras.length > 1) {
          sls = paras
            .filter(str => str.length > 4)
            .map((str, si) => {
              return {
                key: "strapline-" + si,
                text: str.replace(/\.\s*$/, "") + "."
              };
            });
        }
      }
      return sls;
    },
    scrollerStyle() {
      let str = "";
      if (this.scrollPos > 0) {
        const maxPos = this.textScrollEndPos * 0.9375;
        const currPos = this.scrollPos < maxPos ? this.scrollPos : maxPos;
        const emPos = currPos * 4;
        str = "margin-left: -" + emPos + "em";
      }
      return str;
    },
    textScrollClass() {
      let cls = [];
      if (this.scrollPos < 0) {
        cls.push("paused");
      }
      if (
        this.scrollPos < 0 - this.textScrollEndPos / 16 ||
        this.scrollPos >= this.textScrollEndPos * 0.98
      ) {
        cls.push("switching");
      }
      return cls;
    }
  },
  created() {
    this.$bus.$on("video-data-loaded", () => {
      let checkLoading = setInterval(() => {
        const bgEl = document.getElementById("top-full-background-video");
        if (bgEl) {
          if (bgEl.readyState) {
            if (bgEl.readyState > 3) {
              clearInterval(checkLoading);
              this.bgLoaded = true;
              setTimeout(() => {
                this.loadForeground = true;
              }, 1000);
              setTimeout(() => {
                const fgEl = document.getElementById("top-inlay-video");
                if (fgEl) {
                  this.fgLoaded = true;
                }
              }, 6000);
            }
          }
        }
        this.calcCurrIndex();
        const firstSec = this.sections.find(sc => sc.type === "section");
        if (firstSec) {
          this.sourceText = firstSec.text.replace(
            /<\/?(p|h\d|div|li|ul|ol)[^>]*?>/gi,
            ""
          );
          this.textScrollEndPos = this.sourceText.length / 12;
        }
        this.scrollText();
      }, 500);
      if (this.$parent.menu) {
        if (
          this.$parent.menu instanceof Array &&
          this.$parent.menu.length > 0
        ) {
          const rgx = /\b(sun|eye|vision)/;
          this.topLinks = this.$parent.menu
            .filter(lk => rgx.test(lk.link))
            .map(tl => {
              tl.className = tl.link.substring(1).replace(/\//, "-");
              return tl;
            });
        }
      }
    });
    this.$bus.$on("return-home", () => {
      this.calcCurrIndex();
    });
  },
  methods: {
    addMediaAttrs(name, row) {
      const { sizes, formats } = this.videoSet;
      if (sizes instanceof Array && formats instanceof Array) {
        const sz = sizes.find(s => s.key === row.size);
        const ft = formats.find(f => f.key === row.format);
        if (sz && ft) {
          row.src =
            "/videos/" +
            name +
            "--" +
            sz.suffix +
            "." +
            ft.ext.replace(/mv4/, "m4v");
          row.poster = "/videos/" + name + ".jpg";
          row.type = ft.type;
          row.media = "(" + sz.media + ")";
        }
      }
      return row;
    },
    calcCurrIndex() {
      if (this.isLoaded) {
        const { names } = this.videoSet.foreground;
        if (names instanceof Array) {
          this.currIndex = Math.floor(Math.random() * names.length * 0.9999);
          if (this.currIndex < 0) {
            this.currIndex = 0;
          } else if (this.currIndex >= names.length) {
            this.currIndex = names.length - 1;
          }
        }
      }
    },
    showToggle() {
      this.showVideoToggle = this.fgLoaded;
    },
    hideToggle() {
      this.showVideoToggle = false;
    },
    toggleVideo() {
      const nv = !this.foregroundEnabled;
      const ts = nv ? 250 : 10;
      if (nv) {
        this.calcCurrIndex();
      }
      setTimeout(() => {
        this.foregroundEnabled = nv;
      }, ts);
    },
    toggleTextScroller() {
      if (this.textInterval >= 0) {
        clearInterval(this.textInterval);
        this.textInterval = -1;
      } else {
        this.scrollText();
      }
    },
    scrollTextNext() {
      if (this.textInterval >= 0) {
        this.scrollPos++;
        if (this.scrollPos > this.textScrollEndPos) {
          this.scrollPos = 0 - this.textScrollEndPos / 12;
        }
      }
    },
    scrollText() {
      this.textInterval = setInterval(this.scrollTextNext, 1000);
    },
    checkPlaying(e) {
      if (e.target) {
        const { tagName } = e.target;
        const tn = tagName.toLowerCase();
        switch (tn) {
          case "section":
          case "div":
            const vEl = document.getElementById("top-full-background-video");
            if (vEl) {
              if (vEl.paused) {
                vEl.play();
              } else {
                vEl.pause();
              }
            }
            break;
        }
      }
    }
  }
};
</script>
<style>
#video-overlay .full-height,
#video-overlay,
#video-overlay .large-background {
  width: 100vw;
  height: 56.25vw;
}

#video-overlay .screen-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56.25vw;
  max-height: 100vh;
}

#app .main > div > section#video-overlay {
  position: relative;
  z-index: 20;
}

#video-overlay .large-background {
  position: relative;
}

#video-overlay .toggle-foreground,
#video-overlay .playable {
  position: absolute;
  bottom: 0;
  left: 0;
}

#video-overlay .toggle-foreground {
  z-index: 40;
  font-size: 1.5vw;
  bottom: 22vw;
  cursor: pointer;
  width: 1em;
  height: 1em;
  padding: 0.375em;
  background-color: rgba(255, 255, 255, 0.5);
  margin: 0.1875em 0 -1.25em 0.625em;
  border-radius: 1em;
  transition: all 125ms ease-in-out;
  opacity: 0;
  user-select: none;
}

#video-overlay .toggle-foreground:hover {
  transform: scale(1.0625);
  background-color: rgba(255, 255, 255, 0.75);
}

#video-overlay.no-foreground .toggle-foreground {
  left: 3vw;
  opacity: 0.5;
}

#video-overlay.show-toggle .toggle-foreground {
  opacity: 1;
}

#video-overlay .playable {
  width: 50%;
}

video.playable,
video.large-background {
  opacity: 0;
  outline: none;
}

video.playable {
  transition: opacity 2s ease-in;
}
video.large-background {
  transition: opacity 1s ease-in;
  pointer-events: none;
}

#video-overlay.background-loaded video.large-background,
#video-overlay.foreground-loaded video.playable {
  opacity: 1;
}

#video-overlay .top-links {
  position: absolute;
  right: 2.5vw;
  bottom: 0;
  z-index: 30;
  display: flex;
  flex-flow: row nowrap;
}

#video-overlay .scroller {
  position: absolute;
  color: black;
  top: 3rem;
  font-size: 1rem;
  left: 2.5%;
  right: 0;
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  transition: margin-left 1s ease-in-out, opacity 1s ease-in-out;
  user-select: none;
  cursor: pointer;
  opacity: 1;
}

#app #video-overlay .scroller.switching {
  opacity: 0.5;
}

#video-overlay .scroller p {
  margin-right: 4em;
}

#video-overlay .top-links a {
  display: inline-block;
  position: relative;
  color: black;
  user-select: none;
  text-decoration: none;
  transform: scale(1);
  transition: all 0.5s ease-in-out;
}

#video-overlay .top-links h2 a:hover {
  transform: scale(1.125);
  color: white;
}

#video-overlay .top-links h2 {
  margin: 0 1em;
  font-size: 1.83333em;
  text-transform: uppercase;
  margin-bottom: 5rem;
}

@media (min-width: 600px) {
  #video-overlay .scroller {
    top: 3.5rem;
  }
  #video-overlay .top-links h2 {
    font-size: 2em;
  }
}

@media (min-width: 768px) {
  #video-overlay .scroller {
    top: 4.5rem;
    font-size: 1.125rem;
  }

  #video-overlay .playable {
    position: absolute;
    width: 45%;
    left: 2vw;
  }

  #video-overlay .toggle-foreground {
    left: 44%;
    font-size: 1vw;
    margin: 0.75em 0 -1.25em 1.625em;
  }

  #video-overlay .top-links {
    right: 5vw;
  }

  #video-overlay .top-links h2 {
    font-size: 2.3333em;
  }
}

@media (min-width: 1024px) {
  #video-overlay .playable {
    width: 40%;
  }
  #video-overlay .scroller {
    top: 5rem;
    font-size: 1.25rem;
  }
  #video-overlay .top-links h2 {
    font-size: 2.6667em;
  }
}

@media (min-width: 1280px) {
  #video-overlay .playable {
    position: absolute;
    width: 37.5%;
  }

  #video-overlay .toggle-foreground {
    left: 36.5%;
  }

  #video-overlay .top-links {
    right: 7.5vw;
  }
  #video-overlay .scroller {
    top: 5.5rem;
    font-size: 1.3333rem;
  }
  #video-overlay .top-links h2 {
    font-size: 3em;
  }
}

@media (min-width: 1920px) {
  body #video-overlay,
  body #video-overlay .large-background {
    width: 1920px;
    height: 1080px;
  }
}
</style>