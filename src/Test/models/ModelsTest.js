const { MysqlDB, SQLMethods } = require('../schema/MysqlDB')
const { CREATE_Test } = require('../schema/Tables')

// 创建数据表
const CreateTable = async function (data) {
  const result = await MysqlDB(CREATE_Test())
  return {
    code: 200,
    data: result
  }
}
// 查询数据
const Find = async function (data) {
  const sqlStr = {
    methods: 'selectone',
    table: 'dob_Test',
    field: '*',
    where: [
      { key: 'id', value: 1000000000, relation: '=' }
    ]
  }
  return await SQLMethods(sqlStr)
}

module.exports = {
  CreateTable,
  Find
}
