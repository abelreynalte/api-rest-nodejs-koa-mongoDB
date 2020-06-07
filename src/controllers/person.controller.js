/**
 * person.controller.js
 * Responsable por recibir las solicitudes http desde el router person.route.js
 */
const PersonRepository = require('../repositories/person.repository')
// LINEA AGREGADA: reemplazaremos los ctx.throw por throw errorFactory.
const errorFactory = require('../utils/logging/error-factory')

const repository = new PersonRepository()

module.exports = class PersonController {
  /**
   *
   * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
   * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
   */
  async getByIndex(ctx) {
    const index = ctx.params.index && !isNaN(ctx.params.index) ? parseInt(ctx.params.index) : 0
    const filter = { index: index }
    const data = await repository.findOne(filter)
    if (data) {
      ctx.body = data
    } else {
      // LINEA AGREGADA: Manejamos los errores operacionales usando nuestra fabrica de errores
      throw errorFactory.NotFoundError(`No se ha encontrado la persona con el indice ${index}`)
    }
  }

  /**
   *
   * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso desde el body,
   * obtendremos las propiedades de la persona a guardar a traves de ctx.request.body
   */
  async save(ctx) {
    const person = ctx.request.body
    await repository.save(person, true)
    ctx.body = person
  }

  /**
   *
   * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso desde el body,
   * obtendremos las propiedades de la persona a guardar a traves de ctx.request.body
   */
  async getByQuery(ctx) {
    const filter = Object.assign({}, ctx.query)
    if (ctx.query.page) delete filter.page
    if (ctx.query.pageSize) delete filter.pageSize

    const options = {
      page: ctx.query.page && !isNaN(ctx.query.page) ? parseInt(ctx.query.page) : 1,
      limit: ctx.query.pageSize && !isNaN(ctx.query.pageSize) ? parseInt(ctx.query.pageSize) : 10,
    }

    const data = await repository.getByQuery(filter, options)
    if (data) {
      ctx.body = data
    } else {
      // LINEA AGREGADA: Manejamos los errores operacionales usando nuestra fabrica de errores
      throw errorFactory.NotFoundError(
        `No se ha encontrado personas que cumplan son el query ${JSON.stringify(ctx.query)}`,
      )
    }
    ctx.body = data
  }
}
