<template>
<picture :class="className">
  <template v-for="(img,key) in imgset.sizes">
    <source v-if="sizes[key]" :srcset="img" :media="sizes[key]" @key="key">
  </template>
  <img :src="imgset.sizes.max_650x650" :width="imgset.attributes.width" :height="imgset.attributes.height" />
</picture>
</template>
<script type="text/javascript">
export default {
  name: 'VuePicture',
  props: {
    imgset: {
      type: Object,
      required: true,
      default: {}
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
        }
      }
    }
  },
  created () {
    if (this.sizeGroups[this.group]) {
      this.sizes = this.sizeGroups[this.group]
    }
  }
}
</script>
