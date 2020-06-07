const Joi = require('@hapi/joi')

// esquema de validacion que usaremos en el route GET person/:index
const byIndex = Joi.object().keys({
  index: Joi.number().min(1).required(),
})

// esquema de validacion que usaremos en el route POST person/
const post = Joi.object().keys({
  index: Joi.number().min(1).required(),
  age: Joi.number().min(5).max(100).required(),
  eyeColor: Joi.string().valid('black', 'blue', 'green', 'brown', 'grey').required(),
  name: Joi.string().required(),
  gender: Joi.string().valid('male', 'female').required(),
  company: Joi.string().required(),
  country: Joi.string().length(2).uppercase().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  preferences: {
    hobby: Joi.string().optional(),
    color: Joi.string().valid('red', 'blue', 'green').optional(),
  },
})

// esquema de validacion que usaremos en el route GET person/
const getByQuery = Joi.object().keys({
  eyeColor: Joi.string().valid('black', 'blue', 'green', 'brown', 'grey').optional(),
  country: Joi.string().length(2).uppercase().optional(),
  gender: Joi.string().valid('male', 'female').optional(),
  page: Joi.number().optional(),
  pageSize: Joi.number().optional(),
})

module.exports = {
  post,
  byIndex,
  getByQuery,
}
