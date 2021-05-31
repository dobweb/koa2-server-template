const mysql = require('mysql')
const C = require('colors')

// mysql
const pool = mysql.createPool({
  host:      '127.0.0.1',
  user:      '',
  password:  '',
  database:  'wechat_single',
  // queryArgs: 'UTF8_UNICODE_CI',
  port:      3306
})

// query sql语句入口
const MysqlDB = async (sql, val) => {
  return new Promise((resolve, reject) => {
    console.time('Sql')
    console.log(sql)
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, val, (err, fields) => {
          if (err) {
            reject(err)
          } else {
            resolve(fields)
          }
          connection.release()
        })
      }
    })
    console.timeEnd('Sql')
  })
}

// 查询总数
const TOTAL = (table, where) => `SELECT count(*) FROM ${table} ${where};`
// 条件查询数据表
const SELECT = (table, field, where, orderby, start, end) => `SELECT ${field} FROM ${table} ${where} ${orderby} LIMIT ${start}, ${end};`
// 条件查询一条
const SELECTONE = (table, field, where) => `SELECT ${field} FROM ${table} ${where};`
// IN 查询
const SELECTIN = (table, field, whereIn) => `SELECT ${field} FROM ${table} WHERE ${whereIn};`
// 插入数据
const INSERT = (table, { key, val }) => `INSERT IGNORE INTO ${table} (${key}) VALUES ${val};`
// 更新数据
const UPDATE = (table, where, keyToVal) => `UPDATE ${table} SET ${keyToVal} WHERE ${where};`
// 删除数据 
const DELETE = (table, { primaryKey, primaryVal }) => `DELETE FROM ${table} WHERE (${primaryKey}=${primaryVal});`
// 不重复插入，有数据先删再查入
const REPLACE = (table, { key, val }) => `REPLACE INTO ${table} SET (${key}) VALUES ${val};`

// 分页查询
/*
* 参数：
* {
    method: 'select',
    table: '数据表名',
    field: '*',
    where: [
      { key: '', value: '', relation: '=' },
      { key: '', value: '', relation: 'in' }
    ],
    orderby: 'ORDER BY update_time DESC',
    size: 10,
    page: 1
  }
*/
const SQLSelect = async (params) => {
  const table = params.table
  const field = params.field || '*'
  const orderby = params.orderby || ''
  let where = ''
  const start = params.page == 1 ? 0 : params.page * params.size
  const num = params.size

  if (params.where) {
    const whereArr = []
    for (const item of params.where) {
      if (item.value !== '') {
        if (item.relation.toLowerCase() === 'in') {
          whereArr.push(`${item.key} ${ item.relation } (${item.value})`)
        } else {
          whereArr.push(`${item.key} ${ item.relation } '${item.value}'`)
        }
      }
    }
    where += whereArr.length > 0 ? ' WHERE ' + whereArr.join(' AND ') : ''
  }
  // 只选择一条信息
  if (params.method === 'selectone') {
    const resultSelectOne = await MysqlDB(SELECTONE(`\`${ table }\``, `${field}`, where))
    return {
      code: 200,
      data: resultSelectOne[0] || ''
    }
  }
  // 取记录总数
  const total = await MysqlDB(TOTAL(`\`${ table }\``, where))
  // 取查询结果
  /* 错误信息
  code: "ER_SP_UNDECLARED_VAR"
  errno: 1327
  index: 0
  sql: "SELECT * FROM `dob_shopping`  ORDER BY update_time DESC LIMIT NaN, undefined;"
  sqlMessage: "Undeclared variable: NaN"
  sqlState: "42000"
  */
  const result = await MysqlDB(SELECT(`\`${ table }\``, field, where, orderby, start, num))
  if (result.errno) {
    return {
      code: 42001,
      msg: 'select:fail'
    }
  } else {
    return {
      code: 200,
      total: total[0]['count(*)'] || 0,
      data: result || ''
    }
  }
}

// 操作方法
const SQLMethods = async (params) => {
  let where = ''
  // 检查 where 并 生成 where SQL 语句
  if (params.where) {
    const whereArr = []
    for (const item of params.where) {
      if (item.value !== '') {
        whereArr.push(`${item.key} ${ item.relation } '${item.value}'`)
      }
    }
    where += whereArr.length > 0 ? whereArr.join(' AND ') : ''
  }
  // 选择（包含查询和分页）
  if (params.method === 'select') {
    return await SQLSelect(params)
  }
  // 选择一条
  if (params.method === 'selectone') {
    return await SQLSelect(params)
  }
  // IN 查询
  if (params.method === 'selectin') {
    const resultSelectIn = await MysqlDB(SELECTIN(`\`${params.table}\``, params.field, params.whereIn))
    if (resultSelectIn.errno) {
      return {
        code: 42001,
        msg: 'select:fail'
      }
    } else {
      return {
        code: 200,
        data: resultSelectIn || ''
      }
    }
  }
  // // 多表组合查询
  // if (params.method === 'selectmoretable') {
  //   return await SQLSelect(params)
  // }
  // 更新
  /*
    {
      method: 'update',
      table: '数据表名',
      data: { key: value },
      where: [
        { key: '', value: '', relation: '=' }
      ]
    }
  */
  /*
  OkPacket {
   fieldCount: 0,
   affectedRows: 1,
   insertId: 0,
   serverStatus: 34,
   warningCount: 0,
   message: '(Rows matched: 1  Changed: 1  Warnings: 0',
   protocol41: true,
   changedRows: 1
  }
  */
  if (params.method === 'update') {
    let valueUpdate = ''
    for (const k in params.data) {
      const v = typeof(params.data[k]) === 'object' ? JSON.stringify(params.data[k]) : params.data[k]
      valueUpdate += `${k}='${v}',`
    }
    valueUpdate = valueUpdate.slice(0, valueUpdate.length - 1)
    const resultUpdate = await MysqlDB(UPDATE(`\`${ params.table }\``, where, valueUpdate))
    // console.log(C.yellow(resultUpdate.affectedRows))
    if (resultUpdate.affectedRows && resultUpdate.affectedRows > 0) {
      if (resultUpdate.changedRows == 0) {
        return {
          code: 200,
          data: '数据没发生变更',
          msg: 'update:ok'
        }
      } else {
        return {
          code: 200,
          msg: 'update:ok'
        }
      }
    } else {
      return {
        code: 40001,
        msg: '更新数据失败'
      }
    }
  }

  // 以下，插入和替换
  /*
    {
      method: 'insert || replace',
      table: '数据表名',
      data: [
        { key: value }
      ]
    }
  */
  if (params.method === 'insert' || params.method === 'replace') {
    const keyStr = []
    const valStr = []
    for (let k in params.data[0]) {
      keyStr.push(`\`${ k }\``)
    }
    params.data.map(item => {
      let val = []
      for (let k in item) {
        val.push(`'${ typeof(item[k]) === 'object' ? JSON.stringify(item[k]) : item[k] }'`)
      }
      valStr.push(`(${ val })`)
    })
    const insertSql = {
      key: keyStr,
      val: valStr
    }
    // 插入
    if (params.method === 'insert') {
      const resultInsert = await MysqlDB(INSERT(`\`${ params.table }\``, insertSql))
      if (resultInsert.affectedRows && resultInsert.affectedRows > 0) {
        return {
          code: 200,
          data: '插入数据成功',
          msg: 'insert:ok'
        }
      } else {
        return {
          code: 44001,
          data: '插入数据失败',
          msg: 'insert:fail'
        }
      }
    }
    // 替换
    /*
    OkPacket {
     fieldCount: 0,
     affectedRows: 1,
     insertId: 1000000005,
     serverStatus: 2,
     warningCount: 0,
     message: '',
     protocol41: true,
     changedRows: 0 }
    */
    if (params.method === 'replace') {
      const resultReplace = await MysqlDB(REPLACE(`\`${ params.table }\``, insertSql))
      // console.log(C.blue(resultReplace))
      if (resultReplace.affectedRows && resultReplace.affectedRows > 0) {
        return {
          code: 200,
          data: '替换数据成功',
          msg: 'replace:ok'
        }
      } else {
        return {
          code: 44001,
          data: '替换数据失败',
          msg: 'replace:fail'
        }
      }
    }
  }
}

module.exports = {
  MysqlDB,
  SQLMethods
}
