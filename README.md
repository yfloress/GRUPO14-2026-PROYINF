# GRUPO02-2025-PROYINF

* Alvaro Aceituno - 202273520-1
* Diego Marin - 202273607-0
* Matias Guajardo - 202373549-3
* Vicente Galaz - 202273554-6
* **Tutor**: Felipe Ignacio Fernández Aguilar

## Wiki

Puede acceder a la Wiki mediante el siguiente [enlace](https://github.com/AlvaroTuno/GRUPO02-2025-PROYINF/wiki)

## Videos

* [Video presentación cliente (Esta alojado en Aula)](https://aula.usm.cl/mod/resource/view.php?id=6926137)
* [Video de avances del proyecto (Hito 3)](https://youtu.be/zVKJSRhsQBA)
* [Segunda Reunión con el cliente 05-11-2025](https://drive.google.com/file/d/1X_r8pDOMemV8-iPtcfFoTjsE5H_7BTZU/view)
* [Video de resultado final del sistema implementado (Hito 5)](https://youtu.be/Z70Jahmeq90)


## Aspectos técnicos relevantes

_Todo aspecto relevante cuando para poder usar el proyecto o consideraciones del proyecto base a ser entregado_

Este proyecto usa los siguientes stack de desarrollo:

* Front-end: React
* Back-end: Node.js
* Base de datos: PostgreSQL
### Instalación Del Proyecto
#### Requisitos Previos
* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
* [Node.js](https://nodejs.org/) (opcional, solo para desarrollo local)
* `curl` o cliente HTTP (para probar endpoints)
#### Clonar el repositorio
```bash
git clone [https://github.com/AlvaroTuno/GRUPO02-2025-PROYINF](https://github.com/AlvaroTuno/GRUPO02-2025-PROYINF)
```

(debe tener docker-desktop abierto en todo momento)

Ejecutar en terminal:

1. Deben navegar hasta la carpeta `GRUPO02-2025-PROYINF/mi-proyecto-node-docker2`

2. (les instalará las dependencias se suele demorar un poco la primera vez con esto levantan el proyecto)  
```bash
docker compose up --build
```

(para detener los contenedores)
```bash
docker compose down -v
```

y si no funciona el anterior pueden usar `Ctrl+C`.

si no les ejecuta asegurense de estar en la carpeta correcta  
si trabajan desde Windows deben tener instalado WSL2 y tenerlo activado en docker desktop  
esto se puede verificar en  

Por ultimo adentro de la carpeta del proyecto esta un readme explicando todas las funcionalidades y como crear las tablas para la base de datos

Configuración   

Resources  

  * Configure which WSL 2 distros you want to access Docker from. (esto debe estar activo)  
  * Enable integration with additional distros:(esto debe estar activo)


