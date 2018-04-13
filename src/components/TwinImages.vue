 <template>
 <section class="twin-images">
  <figure class="image portrait left">
    <vue-picture v-if="images.length>0" :imgset="images[0]" group="half" className="falf"></vue-picture>
  </figure>
  <figure class="image portrait right">
    <vue-picture v-if="images.length>1" :imgset="images[1]" group="half" className="half"></vue-picture>
  </figure>
</section>
</template>
<script>

import VuePicture from './VuePicture'
  
export default {
  name: 'TwinImages',
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
      images: []
    }
  },
  created () {
    if (this.section.images) {
      if (this.section.images instanceof Array) {
        this.images = this.section.images
      }
    }
  }
}

</script>