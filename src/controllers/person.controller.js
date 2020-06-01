/**
 * person.controller.js
 * Responsable por recibir las solicitudes http desde el router person.route.js
 */
const PersonRepository = require('../repositories/person.repository')
const repository = new PersonRepository()

module.exports = class PersonController {
  /**
   *
   * @param {object} ctx: contexto de koa que contiene los parameteros de la solicitud, en este caso
   * desde el url de donde sacaremos el valor del parametro index (ctx.params.index)
   */
  async getByIndex(ctx) {
    const index = ctx.params.index && !isNaN(ctx.params.index) ? parseInt(ctx.params.index) : 0
    if (index > 0) {
      const filter = { index: index }
      const data = await repository.findOne(filter)
      if (data) {
        ctx.body = data
      } else {
        ctx.throw(404, `No se ha encontrado la persona con el indice ${index}`)
      }
    } else {
      ctx.throw(422, `Valor ${ctx.params.index} no soportado`)
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
  async getByeyeColorCountryGender(ctx) {
    const filter = {
      eyeColor: ctx.params.eyeColor,
      country: ctx.params.country,
      gender: ctx.params.gender,
    }

    const { page, pageSize } = ctx.query
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(pageSize, 10) || 10,
    }

    try {
      ctx.body = await repository.paginationByeyeColorCountryGender(filter, options)
    } catch (err) {
      ctx.status = err.status || 500
      ctx.body = err.message
      ctx.app.emit('error', err, ctx)
    }
  }
}
