<template>
<picture :class="className">
  <template v-if="imgset.picture">
  <template v-for="(img,key) in imgset.sizes">
      <source v-if="sizes[key]" :srcset="img" :media="sizes[key]" :key="key">
    </template>
    <img :src="imgset.sizes.max_650x650" :width="imgset.attributes.width" :height="imgset.attributes.height" />
  </template>
  <template v-if="!imgset.picture">
    <img :src="imgset.sizes.orig" :width="imgset.attributes.width" :height="imgset.attributes.height" />
  </template>
</picture>
</template>
<script type="text/javascript">
export default {
  name: 'VuePicture',
  props: {
    imgset: {
      type: Object,
      required: true,
      default: null
    },
    group: {
      type: String,
      required: false,
      default: 'wide'
    },
    className: String
  },
  data () {
    return {
      sizes: {},
      sizeGroups: {
        wide: {
          'max_650x650': '(max-width: 650px)',
          'max_1300x1300': '(min-width: 651px) and (max-width: 1300px)',
          'max_1920x1920': '(min-width: 1301px) and (max-width: 1920px)',
          'max_2600x2600': '(min-width: 1921px)'
        },
        half: {
          'max_650x650': '(max-width: 1300px)',
          'max_1300x1300': '(min-width: 1301px)'
        }
      }
    }
  },
  created () {
    if (this.sizeGroups[this.group]) {
      this.sizes = this.sizeGroups[this.group]
      let srcs = {}, keys = Object.keys(this.imgset.sizes), i = 0, key, src
      for (; i < keys.length; i++) {
        key = keys[i]
        src = this.imgset.sizes[key]
        srcs[key] = this.translateFilePath(src, key)
      }
      this.imgset.sizes = srcs
    }
  },
  methods: {
    translateFilePath (src, key) {
      if (src.indexOf('/files/') < 0) {
        switch (key) {
          case 'orig':
            return '/files/' + src
           default:
            return '/files/styles/'+key+'/public/' + src
        }
      }
      return src
    }
  }
}
</script>
