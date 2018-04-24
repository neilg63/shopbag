<template>
	<div class="sections">
	<template v-for="(section,index) in sections">
	  <template v-if="section.type == 'image_set'">
	     <image-set :key="index" :section="section"></image-set>
	  </template>
	</template>
	</div>
</template>
<script>

import ImageSet from './ImageSet'

export default {
	name: 'Sections',
	components: {
    ImageSet
  },
  props: {
    sections: {
      type: Array,
      required: true,
      default: []
    }
  },
}
</script>