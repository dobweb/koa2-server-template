const { notEmpty } = require('../utils.js')

module.exports = {
  description: '创建模块',
  prompts: [{
    type: 'input',
    name: 'name',
    message: '请输入模块名称',
    validate: notEmpty('name')
  }],
  actions: data => {
    const name = '{{name}}'
    const actions = [
      {
        type: 'add',
        path: `src/${name}/index.js`,
        templateFile: 'plop-templates/app/index.hbs',
        data: {
          name: name
        }
      },
      {
        type: 'add',
        path: `src/${name}/controller/Controller${name}.js`,
        templateFile: 'plop-templates/app/controller.hbs',
        data: {
          name: name
        }
      },
      {
        type: 'add',
        path: `src/${name}/models/Models${name}.js`,
        templateFile: 'plop-templates/app/models.hbs',
        data: {
          name: name
        }
      },
      {
        type: 'add',
        path: `src/${name}/schema/MysqlDB.js`,
        templateFile: 'plop-templates/app/mysql.hbs',
        data: {
          name: name
        }
      },
      {
        type: 'add',
        path: `src/${name}/schema/Tables.js`,
        templateFile: 'plop-templates/app/tables.hbs',
        data: {
          name: name
        }
      }
    ]

    return actions
  }
}
