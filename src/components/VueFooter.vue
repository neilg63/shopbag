<template>
  <footer :id="id">
    <ul class="menu plain footer-menu flex-row">
      <li v-for="item in menu" :key="item.link">
        <router-link v-bind:to="item.link">{{item.title}}</router-link>
      </li>
    </ul>
    <div class="info">
      <p>
        <a :href="mailtoEmail">{{footer.copyright}}</a>
      </p>
    </div>
    <div class="developed-by">
      <a href="http://www.multifaceted.info/" target="_blank">Developed by Multifaceted Web Services</a>
    </div>
    <div class="admin">
      <span class="clear icon-backward" v-on:click="clearCache()" title="Clear cache"></span>
      <a :href="adminLink" target="_blank">{{adminLabel}}</a>
    </div>
  </footer>
</template>
<script>
export default {
  name: "VueFooter",
  props: {
    id: {
      type: String,
      required: true,
      default: "page-footer"
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
        copyright: "",
        email: ""
      }
    }
  },
  data() {
    return {
      adminLink: "/user",
      adminLabel: "Admin"
    };
  },
  computed: {
    mailtoEmail() {
      let str = "#";
      if (this.footer.email) {
        str = "mailto:" + this.footer.email;
      }
      return str;
    }
  },
  created() {
    this.adminLink = "/user";
    this.checkUser();
    let comp = this;
    if (this.id == "page-footer") {
      setTimeout(() => {
        comp.checkUser();
      }, 12000);
    } else {
      this.$bus.$on("show-detail", () => {
        comp.checkUser();
      });
    }
  },
  methods: {
    clearCache() {
      this.$ls.remove("siteinfo");
    },
    checkUser() {
      let user = this.$parent.$parent.user;
      if (user) {
        if (user.is_editor) {
          this.adminLabel = "Edit";
          switch (this.id) {
            case "inner-page-footer":
              let ps = this.$parent.$parent.pages;
              this.adminLink = "admin/content";
              if (ps.hasOwnProperty(this.$route.path)) {
                if (ps[this.$route.path].nid) {
                  this.adminLink = "node/" + ps[this.$route.path].nid + "/edit";
                }
              }
              break;
            default:
              this.adminLink = "node/" + this.$parent.$parent.nid + "/edit";
              break;
          }
        }
      }
    }
  }
};
</script>