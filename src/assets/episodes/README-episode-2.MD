<h1 align="center">Workshop contruyendo una Api Rest con Node.js</h1>

<h2 align="center">
Episodio 2: Implementando validaciones de request y mejores prácticas de manejo de errores.
</h2>

# Tabla de Contenido

- [Tabla de Contenido](#tabla-de-contenido)
  - [Objetivo General](#objetivo-general)
  - [Objetivos Específicos](#objetivos-específicos)
  - [Como lo haremos:](#como-lo-haremos)
  - [Pasos para implementar](#pasos-para-implementar)
    - [Validar los request usando @hapi/Joi](#validar-los-request-usando-@hapi/Joi)
    - [Manejo de errores](#manejo-de-errores)

## Objetivo General

Implementando validaciones de request y mejores prácticas de manejo de errores.

## Objetivos Específicos

1. Implementar validaciones de los requests http usando joi.
2. Centralizar el manejo de errores usando mejores practicas.
3. Reto: Queremos que nuestro modelo tenga ahora una nueva propiedad compleja (objeto json), llamada preferences, la cual tenga las propiedades hobby (string, opcional) y color (string, opcional). Entonces, deberás modificar:
   1. La persistencia, es decir el modelo para que guarde esa propiedad en la misma colección.
   2. Implementar la validación en el post que llama al save, asegurate que el color unicamente pueda recibir las palabras: rojo, azul, verde, si es un color diferente debes devolver un error 422.

## Como lo haremos

**Para validar** los requests que llegan a nuestros routes, utilizaremos @hapi/joi, el cual nos permite crear esquemas con los parámetros que recibamos en cualquiera de las partes de cada request (header, body, params y query). Porsteriormente crearemos una función que nos permita pasarle el esquema que intenamos validar y usarlo como *middleware* en el route *person.route.js* antes de llamar a nuestro controlador.

**Para el manejo de errores**, usaremos la librería *winston* para logear nuestros errores, aunque podriamos usar cualquier otra librería esto de hecho no es lo más relevante, ya que lo importante es manejar de manera centralizada nuestros errores e incluso disponer de nuetra lógica de negocio para gestionar los errores de manera consistentemente.

Te invito a darle un vistazo a este [excelente documento de mejores parcticas](https://github.com/goldbergyoni/nodebestpractices#2-error-handling-practices)

## Pasos para implementar

### Validar los request usando @hapi/Joi

1.Creemos otra rama a partir del código del episodio anterior:

``` bash
git checkout -b episodio-2
```

2.Instalemos la librería <kbd>joi</kbd> definir esquemas de validacion:

``` bash
npm i @hapi/joi
```

3.Crea la carpeta <kbd>utils</kbd> dentro de src/

4.Dentro de la carpeta utils crea el archivo <kbd>schema-validator.js</kbd> con el siguiente codigo:

```javascript
const validateRequest = (contextPart, label, schema, options) => {
  if (!schema) return
  const { error } = schema.validate(contextPart, options)
  if (error) {
    throw new Error(`Invalid ${label} - ${error.message}`)
  }
}
// middleware de validacion que usaremos para validar los request pasandole un determinado esquema
const validate = (schema) => (ctx, next) => {
  try {
    validateRequest(ctx.headers, 'Headers', schema.headers, { allowUnknown: true })
    validateRequest(ctx.params, 'URL Parameters', schema.params)
    validateRequest(ctx.query, 'URL Query', schema.query)
    if (ctx.request.body) {
      validateRequest(ctx.request.body, 'Request Body', schema.body)
    }
    return next()
  } catch (error) {
    ctx.throw(422, error.message)
  }
}

module.exports = validate

```

5.Creemos la carpeta <kbd>schemas</kbd> dentro de src/

6.Creemos el archivo <kbd>person.schema.js</kbd> con el siguiente codigo:

```javascript
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
})

module.exports = {
  post,
  byIndex
}

```

7.Ahora indiquemos a nuestra aplicación que use el esquema (*person.schema.js*) y middleware (*schema-validator.js*) creados anteriormente. **Modifiquemos el archivo** <kbd>routes/person.route.js</kbd> para agregar las referencias y utilizarlo en los routes (**fijate en los comentarios que empiezan con** ***LINEA AGREGADA:*** o con ***LINEA MODIFICADA:***)), el archivo final debe quedar asi:

:speech_balloon: **Nota:** el código siguiente no contiene la ruta que implementaste en el reto del episodio 1, por lo que respalda esa linea para agregarla luego de copiar el siguiente fragmento.

``` javascript
/**
 * person.route.js
 * Expone los puntos de entrada a traves de endpoints, es el encargado de recibir las solicitudes http que los usuarios o clientes del api nos envia.
 * puede contener diferentes rutas usando combinaciones de diferentes verbos http y parametros
 * por ejemplo:
 * router.get('person/byIndex', '/:index', controller.getByIndex) maneja la solicitudes desde person/99 donde 99 es el valor del parametro index
 */
const KoaRouter = require('koa-router')
const PersonController = require('../controllers/person.controller')

// LINEA AGREGADA: referenciamos los esquemas declarados
const personSchemas = require('../schemas/person.schema')

// LINEA AGREGADA: referenciamos el middleware de validacion de esquemas
const schemaValidator = require('../utils/schema-validator')

const router = new KoaRouter({ prefix: '/person' })
const controller = new PersonController()

// LINEA AGREGADA: creamos una instancia del validador pasandole la parte del request que queremos validar en este caso (params) y el esquema apropiado
const byIndexValidator = schemaValidator({ params: personSchemas.byIndex })

// LINEA AGREGADA: creamos una instancia del validador pasandole la parte del request que queremos validar en este caso (body) y el esquema apropiado
const postValidator = schemaValidator({ body: personSchemas.post })

// GET /person/29
// LINEA MODIFICADA: se agrega el validador antes de llamar al controller
router.get('person/byIndex', '/:index', byIndexValidator, controller.getByIndex)

// POST
// LINEA MODIFICADA: se agrega el validador antes de llamar al controller
router.post('person/post', '/', postValidator, controller.save)


module.exports = router
```

8.Ahora puedes iniciar la aplicación y prueba que todo esté funcionando, tambien prueba un caso para ver si la validción funciona, por ejemplo: GET person/XXXX (recuerda que el esquema getByIndex define que el parámetro *index* sean numérico y requerido). Otro caso que puedes probar es, que pasaría si envias en la propiedad *gender* un valor que no sea *male* o *female*

### Manejo de errores

1.Instalemos la librería [winston](https://github.com/winstonjs/winston#readme) para logear los errores en un archivo de texto:

:speech_balloon: **Nota:** incluso con winston puedes usar la librerria [winston-elasticsearch](https://github.com/vanthome/winston-elasticsearch#readme) de su ecosistema para logear en elasticsearch.

``` bash
npm i winston

```

2.Creemos el archivo <kbd>api-error.js</kbd> dentro de la carpeta *utils/*

``` javascript
// Middleware que usaremos en nuestra aplicación para procesar los errores
module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
}

```

3.Creemos la carpeta <kbd>logging</kbd> dentro de la carpeta *utils/*

4.Creemos la clase <kbd>app-error.js</kbd> dentro de la carpeta *logging/* el cual es nuestra propia implementación de la clase Error.

``` javascript
/**
 * Implementación de nuestra propia clase de error
 */
module.exports = class AppError extends Error {
  constructor(message, httpStatus = 500, name = 'UnknownError', isOperational = false, innerException = null) {
    super(message)
    Error.captureStackTrace(this, AppError)
    this.message = message
    this.name = name
    this.status = httpStatus
    this.date = new Date()
    this.isOperational = isOperational
    this.innerException = innerException
    this.expose = isOperational
  }
}

```

5.Creemos el archivo <kbd>common-errors.js</kbd> dentro de la carpeta *logging/* este archivo contiene para cada una de los errores más relevantes el nombre y el código http.

``` javascript
module.exports = {
  InvalidInput: {
    name: 'InvalidInput',
    httpStatus: 422,
  },
  Unauthorized: {
    name: 'Unauthorized',
    httpStatus: 401,
  },
  NotFound: {
    name: 'NotFound',
    httpStatus: 404,
  },
  OperationNotAllowed: {
    name: 'OperationNotAllowed',
    httpStatus: 405,
  },
  DuplicateItem: {
    name: 'DuplicateItem',
    httpStatus: 409,
  },
  Conflict: {
    name: 'Conflict',
    httpStatus: 409,
  },
  BadFormat: {
    name: 'BadFormat',
    httpStatus: 400,
  },
  UnknownError: {
    name: 'UnknownError',
    httpStatus: 500,
  },
}

```

6.Creemos el archivo <kbd>error-factory.js</kbd> dentro de la carpeta *loggin/* el cual nos permitirá crear errores de manera consistente.

``` javascript
const AppError = require('./app-error')
const commonErrors = require('./common-errors')

module.exports = {
  InvalidInputError: (message, innerException = null) =>
    new AppError(message, commonErrors.InvalidInput.httpStatus, commonErrors.InvalidInput.name, true, innerException),
  UnauthorizedError: (message, innerException = null) =>
    new AppError(message, commonErrors.Unauthorized.httpStatus, commonErrors.Unauthorized.name, true, innerException),
  OperationNotAllowedError: (message, innerException = null) =>
    new AppError(
      message,
      commonErrors.OperationNotAllowed.httpStatus,
      commonErrors.OperationNotAllowed.name,
      true,
      innerException,
    ),
  NotFoundError: (message, innerException = null) =>
    new AppError(message, commonErrors.NotFound.httpStatus, commonErrors.NotFound.name, true, innerException),
  DuplicateItemError: (message, innerException = null) =>
    new AppError(message, commonErrors.DuplicateItem.httpStatus, commonErrors.DuplicateItem.name, true, innerException),
  ConflictError: (message, innerException = null) =>
    new AppError(message, commonErrors.Conflict.httpStatus, commonErrors.Conflict.name, true, innerException),
  BadFormatError: (message, innerException = null) =>
    new AppError(message, commonErrors.BadFormat.httpStatus, commonErrors.BadFormat.name, true, innerException),
  UnknownError: (message, innerException = null) =>
    new AppError(message, commonErrors.UnknownError.httpStatus, commonErrors.UnknownError.name, false, innerException),
}

```

7.Modifquemos el archivo <kbd>utils/schema-validator.js</kbd>

:speech_balloon: **Nota**: Identificarás las modificaciones del archivo con comentarios que inician con ***LINEA AGREGADA: o LINEA MODIFICADA:***

``` javascript
// LINEA AGREGADA: reemplazaremos los ctx.throw por throw errorFactory.
const errorFactory = require('../utils/logging/error-factory')

const validateRequest = (contextPart, label, schema, options) => {
  if (!schema) return
  const { error } = schema.validate(contextPart, options)
  if (error) {
    // LINEA MODIFICADA: Manejamos los errores operacionales usando nuestra fabrica de errores
    throw errorFactory.UnknownError(`Invalid ${label} - ${error.message}`)
  }
}
// middleware de validacion que usaremos para validar los request pasandole un determinado esquema
const validate = (schema) => (ctx, next) => {
  try {
    validateRequest(ctx.headers, 'Headers', schema.headers, { allowUnknown: true })
    validateRequest(ctx.params, 'URL Parameters', schema.params)
    validateRequest(ctx.query, 'URL Query', schema.query)
    if (ctx.request.body) {
      validateRequest(ctx.request.body, 'Request Body', schema.body)
    }
    return next()
  } catch (error) {
    // LINEA AGREGADA: Manejamos los errores operacionales usando nuestra fabrica de errores
    throw errorFactory.InvalidInputError(`Solicitud no válida: ${error.message}`)
  }
}

module.exports = validate

```

8.Modifquemos el controlador <kbd>person.controller.js</kbd> (ahora ya no validamos si los parametros son inválidos, porque el schema-validator que usamos en person.route lo hace por nosotros)

:speech_balloon: **Nota**: Identificarás las modificaciones del archivo con comentarios que inician con ***LINEA AGREGADA: o LINEA MODIFICADA:***

``` javascript
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

  async getByQuery(ctx) {
    const filter = Object.assign({}, ctx.query)
    if (ctx.query.page) delete filter.page
    if (ctx.query.size) delete filter.size
    const page = ctx.query.page && !isNaN(ctx.query.page) ? parseInt(ctx.query.page) : 1
    const size = ctx.query.size && !isNaN(ctx.query.size) ? parseInt(ctx.query.size) : 10
    const data = await repository.find(filter, page, size)
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

```

9.Creemos el archivo <kbd>log-manager.js</kbd> dentro de *loggin/* Este solo es un wrapper de winston, ya que nos facilita que si cambiamos por otra libreria no impacte las otras partes de nuestro código.

``` javascript
const winston = require('winston')
const yenv = require('yenv')

const env = yenv()

module.exports = class logManager {
  constructor() {
    const transports = []
    if (env.LOGGER.TARGETS.FILE.ENABLED) {
      transports.push(
        new winston.transports.File({ level: env.LOGGER.TARGETS.FILE.LEVEL, filename: env.LOGGER.TARGETS.FILE.PATH }),
      )
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: transports,
    })

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      )
    }
  }

  info(info) {
    this.logger.info(info)
  }

  error(appError) {
    const isOperational = appError.isOperational || false
    this.logger.error(appError)
    return isOperational
  }
}

```

10.Agreguemos la configuración del logger winston en nuestro archivo de configuración <kbd>env.yaml</kbd>, agregalo debajo de *MONGODB_URL*

``` YAML
LOGGER:
      TARGETS:
        FILE:
          ENABLED: true
          LEVEL: "info"
          PATH: "error.log"
```

11.Ahora debemos modificar el <kbd>server.js</kbd>, las lineas nuevas y modificadas tienen el comentario ***LINEA AGREGADA o LINEA MODIFICADA***

:speech_balloon: **Nota**: Identificarás las modificaciones del archivo con comentarios que inician con ***LINEA AGREGADA: o LINEA MODIFICADA:***

``` javascript
/**
 * server.js
 * Responsable por inciar nuestra api, inicializa koa con todos sus middleware y tambien inicialzia la conexión de bd
 */
const Koa = require('koa')
const json = require('koa-json')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const yenv = require('yenv')
const mongoose = require('mongoose')

const env = yenv()
const routes = require('./routes')

// LINEA AGREGADA: referenciar al middleware que manejará los errores
const apiError = require('./utils/api-error')

// LINEA AGREGADA: referenciar a la clase LogManager
const LogManager = require('./utils/logging/log-manager')

// Inicializar nuestro servidor usando koa (similar a express)
const app = new Koa()

// LINEA AGREGADA: instanciar el LogManager
const logManager = new LogManager()

// Inicializar los middleware
// LINEA MODIFICADA: agregar .use(apiError) para usar el middleware de manejo de errores en todas las solicitudes
app.use(bodyParser()).use(json()).use(logger()).use(apiError)

// cargar los routes que escucharan las peticiones http
routes.map((item) => {
  app.use(item.routes()).use(item.allowedMethods())
})

// LINEA AGREGADA: centralizar el manejo de errores con este evento
app.on('error', (err, ctx) => {
  console.error('logging error')
  const isOperationalError = logManager.error(err)
  if (!isOperationalError) {
    process.exit(1)
  }
})

// abrir la conexión con MongoDB
mongoose
  .connect(env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => {
    // iniciar el servidor koa para que empiece a escuchar peticiones
    app.listen(env.PORT, () => {
      console.log(`Escuchando en el puerto ${env.PORT}`)
    })
  })
  .catch((error) => {
    console.error(error)
  })

```

12.Probemos que tal lo hicimos
