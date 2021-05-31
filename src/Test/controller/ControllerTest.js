const ModelsTest = require('../models/ModelsTest')

// 初始化
const init = async function(ctx) {
  const data = ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query
  ctx.body = await ModelsTest.CreateTable(data)
}

const FindTest = async function(ctx) {
  const data = ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query
  ctx.body = await ModelsTest.Find(data)
}

module.exports = {
  init,
  FindTest
}