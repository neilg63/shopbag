import Vue from 'vue'
import Router from 'vue-router'
import Detail from '@/components/Detail'

Vue.use(Router)

export default new Router({
  routes: [
  	{
      path: '/',
      name: 'Home',
      component: Detail
    },
    {
      path: '/:name',
      name: 'Detail',
      component: Detail
    }
  ]
});
