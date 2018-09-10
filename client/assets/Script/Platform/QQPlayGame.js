let _ = require('lodash')

let CommonPlatform = require('./Common')
let QQPlatform = _.merge(_.cloneDeep(CommonPlatform), {
})

module.exports = QQPlatform;