# Changelog

## [6.8.1] - 2023-02-08

### Changed

- Formato json cambiado
    'catalog' incluye todos los datos de los contenidos y música
    'media' y 'music' solo la lista de ids



## [6.8.0] - 2023-02-06

### Added

- Aviso sin contenidos cuando no hay contenidos

### Fixed

- Cuelgue si no hay música


## [6.7.0] - 2023-01-13

### Added

- Soporte para fechas y horas tanto de música como de contenidos
- Selector de volumen para los contenidos con audio
- Opción de color de fondo de aplicación (para transiciones)

### Changed

- Nuevo formato json, deploy.json, para todo. Detalles:
    Contenidos, musica, eventos, horarios y demás en un solo fichero desde el servidor
    Contenidos en la carpeta /media
    Música en la carpeta /music
    Catálogo separado de las listas de música, enlazados por id
    Más cambios pequeños

- Actualizado electron a 22.0.1

### Removed

- Algunos DIVs redundates en config.html




## [6.6.0] - 2022-12-21

### Added

- Soporte para más extensiones de contenidos (WEBP, AVIF)

### Changed

- Actualizado electron a 22.0.0

### Fixed

- Comprobación de extensiones de ficheros con o sin mayúsculas (ej, jpg, JPG)