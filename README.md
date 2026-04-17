# GRUPO14-2026-PROYINF

| Nombre          | Nickname     | Rol              |
| --------------- | ------------ | ---------------- |
| Diego Marin     |  DiegoMarinRojas    |  202273607-0     |
| Cristóbal Reyes |  Lamemble           |  202373562-0     |
| Héctor Jerez    |  PrintExponent68    |  202373544-2     |
| Nicolás Muñoz   |  elsopaipilla12     |  202273641-0     |
| Yair Flores     |  yfloress           |  202266595-5     |

* **Tutor**: Miguel Huerta

## Wiki

Puede acceder a la Wiki mediante el siguiente [enlace](https://github.com/yfloress/GRUPO14-2026-PROYINF/wiki)

## Videos

* [Video presentación cliente (Está alojado en Aula)](https://aula.usm.cl/mod/resource/view.php?id=6926137)
* [Video de avances del proyecto (Hito 3)](https://youtu.be/zVKJSRhsQBA)
* [Segunda Reunión con el cliente 05-11-2025](https://drive.google.com/file/d/1X_r8pDOMemV8-iPtcfFoTjsE5H_7BTZU/view)
* [Video de resultado final del sistema implementado (Hito 5)](https://youtu.be/Z70Jahmeq90)


## Aspectos técnicos relevantes

Este proyecto usa los siguientes stack de desarrollo:

* Front-end: React
* Back-end: Node.js
* Base de datos: PostgreSQL
### Instalación del Proyecto
#### Requisitos Previos
* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
* [Node.js](https://nodejs.org/) (opcional, solo para desarrollo local)
* `curl` o cliente HTTP (para probar endpoints)
* (Opcional) [Podman](https://podman.io/) y [Podman Compose](https://github.com/containers/podman-compose)

#### Clonar el repositorio
```bash
git clone https://github.com/yfloress/GRUPO14-2026-PROYINF
```

(Debe tener Docker Desktop abierto en todo momento si se usa Docker. Si se usa Podman no es necesario, y simplemente ejecute los comandos usando podman en vez de docker.)

Ejecutar en terminal:

1. Ingrese a la carpeta `GRUPO14-2026-PROYINF/mi-proyecto-node-docker2`

2. (Esto instalará las dependencias y suele demorar un poco la primera vez; con esto levantan el proyecto):  
```bash
docker compose up --build
```

(Para detener los contenedores)
```bash
docker compose down -v
```

Y si no funciona el comando anterior, pueden usar `Ctrl+C`.

Si no se ejecuta, asegúrense de estar en la carpeta correcta.  
Si trabajan desde Windows, deben tener instalado WSL2 y tenerlo activado en Docker Desktop.  

Por último, adentro de la carpeta del proyecto hay un README explicando todas las funcionalidades y cómo crear las tablas para la base de datos.
> **Tip:** Para inicializar rápidamente las tablas de la base de datos con Docker (desde la raíz), se puede ejecutar esto:
> ```bash
> awk 'NR>=98 && NR<=288' mi-proyecto-node-docker2/README.md | docker exec -i postgres_db psql -U postgres -d prestamos_db
> ```

Configuración   

Resources  

  * Configure which WSL 2 distros you want to access Docker from (esto debe estar activo).  
  * Enable integration with additional distros (esto debe estar activo).

