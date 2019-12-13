<template>
  <aside id="cookie-policy" :class="classNames">
    <div class="inner">
      <div class="text" v-html="text"></div>
      <div class="actions" v-on:click.prevent.stop="acceptNotice">
        <button class="agree icon-check" v-on:click.prevent="acceptNotice">{{accept}}</button>
      </div>
    </div>
  </aside>
</template>
<script>
import utils from "../utils/utils";

export default {
  name: "CookieOverlay",
  props: {
    text: {
      type: String,
      required: true,
      default: ""
    },
    accept: {
      type: String,
      required: true,
      default: "OK"
    }
  },
  data() {
    return {
      agreed: true,
      out: false
    };
  },
  computed: {
    classNames() {
      let cls = ["overlay central"];
      if (!this.agreed) {
        cls.push("show");
      }
      if (this.out) {
        cls.push("out");
      }
      return cls;
    }
  },
  created() {
    setTimeout(() => {
      let accepted = utils.getCookie("accepted");
      if (accepted) {
        this.agreed = accepted !== "declined";
      } else {
        this.agreed = false;
      }
      this.out = this.agreed;
    }, 3000);
  },
  methods: {
    acceptNotice() {
      utils.setCookie("accepted", "ok", 35);
      this.agreed = true;
      this.out = false;
      setTimeout(() => {
        this.out = true;
      }, 1500);
    }
  }
};
</script>