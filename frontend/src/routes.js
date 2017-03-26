//
// LIBRARIES
//

import Test from 'Test.vue';
import Test2 from 'Test2.vue';
import _404 from '404.vue';
import PostGreDemo from 'PostGreDemo.vue';

//
// FRONTEND ROUTING
//


// Frontend routes.
export default [

    //
    // Redirect
    //

    {
        path: '/index.html',
        redirect: '/'
    },
    {
        path: '/index.htm',
        redirect: '/'
    },
    {
        path: '/index',
        redirect: '/'
    },

    //
    // Pages
    //

    {
        path: '/',
        component: Test2
    },

    {
        path: '/test',
        component: Test
    },

    {
        path: '/db',
        component: PostGreDemo
    },

    {
        path: '*',
        component: _404
    }

]