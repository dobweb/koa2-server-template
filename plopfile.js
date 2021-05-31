const viewGenerator = require('./plop-templates/app/prompt')

module.exports = function(plop) {
  plop.setGenerator('view', viewGenerator)
}
