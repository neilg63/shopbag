<template>
	<div class="block instafeed-wrapper">
		<div id="instafeed"></div>
		<div class="control icon-instagram link-wrapper"><a :href="fullUrl" target="_blank" title="Full instagram feed"></a></div>
		<div class="control icon-chevron-thin-right scroll-down" @click="scrollDown()"></div>
	</div>
</template>
<script>

import u from '../utils/utils'

export default {
	name: 'Instafeed',
	props: {
    limit: {
      type: Number,
      required: false,
      default: 12
    },
    sortBy: {
    	type: String,
      required: false,
    	default: 'most-recent'
    },
    resolution: {
    	type: String,
      required: false,
    	default: 'standard'
    }
  },
  data () {
  	return {
  		userId: '7116321893',
  		clientId: '816835b2d35b4b7693bd08cb25209598',
			token: '7116321893.816835b.78e85ffc5d684040ad318d818ea17538',
			fullUrl: 'https://www.instagram.com/lucyofsyracuse',
			coreEl: null
  	}
  },
  mounted () {
  	let comp = this
  	setTimeout(() => {
  		comp.init()
  		comp.coreEl = document.getElementById('instafeed')
  	}, 500)
  	
  },
  methods: {
  	init () {
  		if (Instafeed) {
  			let opts = {
				  get: 'user',
				  userId: this.userId,
				  accessToken: this.token,
				  sortBy: this.sortBy,
				  limit: this.limit,
				  resolution: this.resolutionId(),
				  useHttp: true,
				  template: '<figure><a class="instagram-image" href="{{link}}" target="_blank"><img src="{{image}}" /></a></figure>',
				}
				if (this.clientId) {
  				opts.clientId = this.clientId;
  			}
  			let inf = window.instaFeed = new Instafeed(opts)
				window.instaFeed.run()
  		}
  	},
  	resolutionId () {
  		return this.resolution + '_resolution';
  	},
  	scrollDown () {
  		if (this.coreEl) {
  			u.scrollTo(this.coreEl,240);
  		}
  	}
  }
}
</script>
<style>

.instafeed-wrapper,
#instafeed {
	min-height: 20em;
	height: 640px;
	max-height: 80vh;
	width: 100%;
}

#instafeed {
	overflow: auto;
}

.instafeed-wrapper {
	position: relative;
}

#instafeed figure img {
	width: 100%;
	height: auto;
}

.instafeed-wrapper .link-wrapper a,
.instafeed-wrapper .control:before,
.instafeed-wrapper .control {
	position: absolute;
	z-index: 10;
}

.instafeed-wrapper .control {
	opacity: 0.5;
	transition: opacity .33s ease-in-out;
	bottom: 0.5rem;
}

.instafeed-wrapper:hover .control {
	opacity: 1;
	color: rgb(228,228,228);
}

.instafeed-wrapper .scroll-down {
	width: 60%;
	left: 20%;
	right: 20%;
	height: 2em;
}

.instafeed-wrapper .scroll-down:before {
	transform: rotate(90deg) scale(1,2);
	font-size: 3em;
	transition: transform .33s ease-in-out;
	cursor: pointer;
}


.instafeed-wrapper .scroll-down:hover:before {
	transform: rotate(90deg) scale(1.2,2.4);
}

.instafeed-wrapper .link-wrapper {
	left: 1vw;
	font-size: 4vw;
	width: 1em;
	height: 1em;
	transition: color .333s ease-in-out;
}

.instafeed-wrapper .link-wrapper a {
	display: block;
	width: 1em;
	min-height: 1em;
	z-index: 11;
}

.instafeed-wrapper .link-wrapper:hover {
	color: black;
}

@media screen and (min-height: 40em) and (min-width: 60em) {
	.instafeed-wrapper,
	#instafeed {
		max-height: 40vh;
	}
}

@media screen and (min-width: 80em) {
	.instafeed-wrapper .link-wrapper {
		font-size: 2em;
		left: 1rem;
	}
}

</style>