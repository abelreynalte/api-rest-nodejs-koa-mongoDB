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

## Objetivo General
Implementando validaciones de request y mejores prácticas de manejo de errores.

## Objetivos Específicos
1. Implementar validaciones de los requests http usando joi.
2. Centralizar el manejo de errores usando mejores practicas.
3. Reto: Queremos que nuestro modelo tenga ahora una nueva propiedad compleja (objeto json), llamada preferences, la cual tenga las propiedades hobby (string, opcional) y color (string, opcional). Entonces, deberás modificar:
   1. La persistencia, es decir el modelo para que guarde esa propiedad en la misma colección.
   2. Implementar la validación en el post que llama al save, asegurate que el color unicamente pueda recibir las palabras: rojo, azul, verde, si es un color diferente debes devolver un error 422.

### Como lo haremos:


## Pasos para implementar

