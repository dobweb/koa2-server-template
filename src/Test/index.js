const router = require('koa-router')()
const koaBody = require('koa-body')
const Test = require('./controller/ControllerTest')

router.prefix('/api/v1')

// 初始化数据表
router.get('/Test', Test.init)
// 查找数据
router.get('/find_Test', Test.FindTest)

module.exports = router