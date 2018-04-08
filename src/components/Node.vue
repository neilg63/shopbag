<template>
  <article class="content-container node-page" v-if="hasContent">
    <h2 class="article-title" :class="{'show-title': showTitle,'hide-title': !showTitle}">{{title}}</h2>
    <div class="edit-bar" v-if="isAdmin"><div class="edit" v-on:click.stop="editNode(content.nid)">Edit</div></div>
    <template v-if="content.hasImage">
      <vue-picture :imgset="content.image" :sizes="fullSizes" :className="content.image.attributes.className"></vue-picture>
    </template>
    <div class="body" v-html="content.body"></div>
    
  </article>
</template>

<script>
import _ from 'lodash'
import scrollTo from 'vue-scrollto'

export default {
  name: 'node',
  directives: {
    scrollTo
  },
  components: {
  },
  props: {
    isAdmin: false
  },
  data: function () {
    return {
      title: 'About',
      showTitle: false,
      hasContent: false,
      content: {},
      nodes: [],
      loading: false,
      fillPicCalled: false,
      fullSizes: {
        'max_2600x2600': '(min-width:1301px)',
        'max_1300x1300': '(min-width:651px) and (max-width:1300px)',
        'max_650x650': '(max-width:650px)'
      }
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(function (vm) {
      vm.initPage()
    })
  },
  created: function () {
    window.addEventListener('hashchange', this.loadPage)
  },
  methods: {
    initPage: function () {
      if (this.$parent.infoLoaded) {
        this.nodes = this.$parent.nodes
        this.loadPage()
      } else {
        var comp = this
        setInterval(function () {
          if (comp.$parent.infoLoaded) {
            comp.nodes = comp.$parent.nodes
            comp.loadPage()
          }
        }, 200)
      }
      this.$parent.scrollTo(0, 250)
    },
    loadPage: function () {
      this.fillPicCalled = false
      var alias = window.location.hash
      if (alias.length > 2 && this.loading !== true) {
        alias = alias.replace(/^#/, '')
        var comp = this
        var index = -1
        if (alias.indexOf('/projects') !== 0) {
          index = _.findIndex(this.nodes, function (n) {
            return n.alias === alias
          })
        }
        if (index >= 0) {
          this.loading = true
          var node = this.nodes[index]
          this.$parent.getNode(node.nid, function (data) {
            comp.addArticle(data)
            comp.loading = false
          })
        } else {
          setTimeout(function () {
            comp.addNotFound()
          }, 3000)
        }
      }
    },
    addNotFound: function () {
      if (!this.hasContent) {
        this.title = 'Page not found'
        this.content.body = 'This resource is not available'
        this.content.hasImage = false
        this.hasContent = true
        this.showTitle = true
      }
    },
    addArticle: function (data, refName) {
      if (data.title) {
        this.content = data
        this.title = data.title
        this.hasContent = true
        this.content.hasImage = false
        this.showTitle = false
        if (data.image) {
          this.content.hasImage = data.image !== null && data.image.sizes
        }
      }
      var comp = this
      setTimeout(function () {
        comp.loading = false
      }, 250)
    },
    editNode: function (id) {
      this.$parent.adminUrl = '/node/' + id + '/edit'
    }
  }
}
</script>
