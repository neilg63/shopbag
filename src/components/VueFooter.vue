<template>
	<footer :id="id">
  	<ul class="menu plain footer-menu flex-row">
		  <li v-for="item in menu" :key="item.link"><router-link v-bind:to="item.link">{{item.title}}</router-link></li>
		</ul>
		<div class="info">
  		<p>{{footer.copyright}}</p>
  	</div>
</footer>
</template>
<script>
export default {
	name: 'VueFooter',
  props: {
  	id: {
      type: String,
      required: true,
      default: 'page-footer'
    },
    menu: {
      type: Array,
      required: true,
      default: []
    },
    footer: {
    	type: Object,
      required: true,
      default: {
      	copyright: ''
      }
    }
  },
}
</script>