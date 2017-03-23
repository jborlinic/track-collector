var postcss = require('postcss')
var selectorParser = require('postcss-selector-parser')
var cache = require('lru-cache')(100)
var assign = require('object-assign')
var options = require('./compilers/options')

var currentId
var addId = postcss.plugin('add-id', function () {
  return function (root) {
    root.each(function rewriteSelector (node) {
      if (!node.selector) {
        // handle media queries
        if (node.type === 'atrule' && node.name === 'media') {
          node.each(rewriteSelector)
        }
        return
      }
      node.selector = selectorParser(function (selectors) {
        selectors.each(function (selector) {
          var node = null
          selector.each(function (n) {
            if (n.type !== 'pseudo') node = n
          })
          selector.insertAfter(node, selectorParser.attribute({
            attribute: currentId
          }))
        })
      }).process(node.selector).result
    })
  }
})

/**
 * Add attribute selector to css
 *
 * @param {String} id
 * @param {String} css
 * @param {Boolean} scoped
 * @return {Promise}
 */

module.exports = function (id, css, scoped) {
  var key = id + '!!' + css
  var val = cache.get(key)
  if (val) {
    return Promise.resolve(val)
  } else {
    var plugins = []
    var opts = {}

    if (options.postcss instanceof Array) {
      plugins = options.postcss.slice()
    } else if (options.postcss instanceof Object) {
      plugins = options.postcss.plugins || []
      opts = options.postcss.options
    }

    // scoped css rewrite
    if (scoped) {
      plugins.push(addId)
    }
    // autoprefixing
    if (options.autoprefixer !== false) {
      var autoprefixer = require('autoprefixer')(options.autoprefixer)
      plugins.push(autoprefixer)
    }
    // minification
    if (process.env.NODE_ENV === 'production') {
      plugins.push(require('cssnano')(assign({
        autoprefixer: false,
        safe: true
      }, options.cssnano)))
    }
    currentId = id
    return postcss(plugins)
      .process(css, opts)
      .then(function (res) {
        var val = {
          source: res.css,
          type: 'style'
        }
        cache.set(key, val)
        return val
      })
  }
}

