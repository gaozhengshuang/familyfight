let _ = require('lodash')

let CommonPlatform = require('./CommonGame')
let QQPlatform = _.merge(_.cloneDeep(CommonPlatform), {
})

module.exports = QQPlatform;