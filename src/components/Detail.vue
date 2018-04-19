<template>
  <article class="content-container node-page" :class="contClasses">
    <figure v-if="hasMainImage" class="subpanel" :class="mainImageClass">
      <vue-picture :imgset="image" :group="image.group" :className="image.type.replace('/','-')"></vue-picture>
    </figure>
    <div class="subpanel" :class="bodyClass">
      <h2 class="article-title" :class="{'show-title': showTitle,'hide-title': !showTitle}">{{title}}</h2>
      <div class="body" v-html="body"></div>
    </div>
  </article>
</template>

<script>

import VuePicture from './VuePicture'

export default {
  name: 'Detail',
  components: {
    VuePicture
  },
  data () {
    return {
      title: 'Welcome to Lucy of Syracuse',
      body: "",
      image: "",
      images: [],
      showTitle: false,
      numImages: 0,
      hasMainImage: false,
      hasContent: false,
      sections: [],
      numSections: 0,
      contClasses: [],
      mainImageClass: 'right',
      bodyClass: 'left'
    }
  },
  created () {
    this.$bus.$on('page', (data) => {
      this.contClasses = []
      if (data.valid) {
        this.hasMainImage = false
        if (data.title) {
          this.title = data.title
          this.hasContent = true
          this.showTitle = this.title.length > 1
        } else {
          this.title = ''
          this.showTitle = false
        }
        if (data.body) {
          this.body = data.body
          this.hasContent = true
        } else {
          this.body = ''
        }
        if (data.image) {
          if (data.image.sizes) {
            this.image = data.image
            this.hasMainImage = true 
            this.hasContent = true
          } else {
            this.hasMainImage = false
          }
        } else {
          this.image = {}
        }
        if (this.hasMainImage) {
          this.contClasses.push('flex-row');
          this.mainImageClass = 'left'
          this.bodyClass = 'right'
        }
        this.$parent.showDetail = this.hasContent
      } else {
        this.$parent.showDetail = false
      }
    })
  }
}
</script>
<style>



#app .detail-pane .body {
  padding: 2em;
  text-align: left;
  margin: 0 auto;
}

#app .detail-pane .flex-row .body {
  max-width: 100%;
}

@media screen and (min-width: 650px) {
  
  #app .detail-pane .flex-row  {
    display: flex;
    flex-flow: nowrap row;
  }

  #app .detail-pane .flex-row .subpanel {
    width: 50%;
  }
  #app .detail-pane .body {
    max-width: 80%;
  }
}

@media screen and (min-width: 975px) {
  #app .detail-pane .body {
    font-size: 112.5%;
  }
}

  @media screen and (min-width: 1300px) {
    #app .detail-pane .body {
      font-size: 125%;
    }
  }

  @media screen and (min-width: 1600px) {
    #app .detail-pane .body {
      font-size: 133.33%;
    }
  }

</style>