# Aplicación Node.js con Docker y PostgreSQL

Este es un ejemplo de una aplicación Node.js usando Express, Docker y PostgreSQL. Incluye configuración para desarrollo y producción.

## Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Node.js](https://nodejs.org/) (opcional, solo para desarrollo local)
- `curl` o cliente HTTP (para probar endpoints)

## Instalación

### 1. Clonar el repositorio
```bash 
git clone https://github.com/MatiasBV/analisis-y-diseno-de-software.git
```

(debe tener `docker-desktop` abierto en todo momento)
Ejecutar en terminal:

1. Deben navegar hasta la carpeta `analisis-y-diseno-de-software/mi-proyecto-node-docker`

2. (les instalará las dependencias se suele demorar un poco la primera vez con esto levantan el proyecto)

```bash 
docker compose up --build
```

(para detener los contenedores)  

```bash
docker compose down -v
```

si no les ejecuta asegurense de estar en la carpeta correcta  
si trabajan desde Windows deben tener instalado WSL2 y tenerlo activado en docker desktop  
esto se puede verificar en  
Configuración   
-Resources  
  -Configure which WSL 2 distros you want to access Docker from. (esto debe estar activo)  
  -Enable integration with additional distros:(esto debe estar activo)  

# Comandos útiles 

Pueden levantar el proyecto sin volver a construir las imágenes con el siguiente comando:
```bash
docker compose up
```
Si quieren levantar el proyecto en segundo plano pueden usar:
```bash
docker compose up -d
```
Para ver el estado de los servicios que están corriendo:
```bash
docker compose ps
```
Para ver los logs en tiempo real de todos los servicios:
```bash
docker compose logs -f
```
O de un servicio específico:
```bash
docker compose logs -f nombre_servicio
```
Para reiniciar un servicio específico:
```bash
docker compose restart nombre_servicio
```
Para detener todos los contenedores sin eliminar volúmenes:
```bash
docker compose down
```

## Cuentas para testear las funcionalidades

Antes de probar la pagina web se recomienda mucho revisar si están instaladas las tablas de la base de datos o la base de datos mismas

Para acceder en modo usuario se crearon dos cuentas:
1. _(Modo Cliente)_ RUT: `12345678-9`; Contraseña: `1234`; Presione el botón de `Acceder`
2. _(Modo Administrador)_ RUT: `99999999-9` Contraseña: `admin123`; Presione el botón de `Administrador`

## Crear BD y Tablas

Primero abra la terminar en donde esta la carpeta del proyecto y ejecute el siguiente comando:
```bash
psql -U postgres
```

Ahora estaremos en la terminal del psql. Crearemos la BD y accederemos a la base de datos llamado "prestamos"
```psql
CREATE DATABASE prestamos_db;
\c prestamos_db;
```

Ahora instalaremos las tablas y codigos de testeo
```sql
-- ===========================================
--  ESQUEMA COMPLETO SISTEMA DE PRÉSTAMOS
--  Base de datos: prestamos_db
-- ===========================================

-- =====================================================
-- 1. CLIENTES DEL SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id                   SERIAL PRIMARY KEY,
  rut                  VARCHAR(20)  NOT NULL UNIQUE,
  clave                VARCHAR(255) NOT NULL,

  -- Seguridad / verificación (para SeguridadCuenta)
  foto_carnet_frontal   TEXT,
  foto_carnet_posterior TEXT,
  correo_seguridad      VARCHAR(255),
  verificacion_estado   VARCHAR(50) DEFAULT 'pendiente',
  verificacion_detalle  TEXT
);

-- 🔹 Clientes de prueba
INSERT INTO usuarios (rut, clave, correo_seguridad, verificacion_estado)
VALUES
  ('12345678-9', '1234', 'cliente1@ejemplo.cl', 'completada'),
  ('11111111-1', '1111', NULL, 'pendiente')
ON CONFLICT (rut) DO NOTHING;


-- =====================================================
-- 2. ADMINISTRADORES
-- =====================================================
CREATE TABLE IF NOT EXISTS administradores (
  id     SERIAL PRIMARY KEY,
  rut    VARCHAR(20)  NOT NULL UNIQUE,
  clave  VARCHAR(255) NOT NULL,
  nombre VARCHAR(100)
);

-- 🔹 Admin de prueba
INSERT INTO administradores (rut, clave, nombre)
VALUES
  ('99999999-9', 'admin123', 'Administrador del Sistema'),
  ('88888888-8', 'admin456', 'Admin Secundario')
ON CONFLICT (rut) DO NOTHING;


-- =====================================================
-- 3. PRÉSTAMOS
-- =====================================================
CREATE TABLE IF NOT EXISTS prestamos (
  id             SERIAL PRIMARY KEY,
  rut_cliente    VARCHAR(20) NOT NULL,
  monto          DECIMAL(12,2) NOT NULL,
  cuotas         INT NOT NULL,
  interes_total  DECIMAL(12,2),
  cuota_mensual  DECIMAL(12,2),
  estado         VARCHAR(20) DEFAULT 'pendiente',   -- pendiente | aprobado | pagado | rechazado
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_inicio   DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_prestamos_rut
  ON prestamos (rut_cliente);


-- =====================================================
-- 4. CUOTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS cuotas (
  id               SERIAL PRIMARY KEY,
  id_prestamo      INT NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  numero_cuota     INT NOT NULL,
  monto_cuota      DECIMAL(12,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  pagada           BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_cuotas_prestamo
  ON cuotas (id_prestamo);

CREATE INDEX IF NOT EXISTS idx_cuotas_pagada
  ON cuotas (pagada);


-- =====================================================
-- 5. EVALUACIONES DE SCORING
-- =====================================================
CREATE TABLE IF NOT EXISTS scoring_evaluaciones (
  id SERIAL PRIMARY KEY,

  -- Identificación
  rut               VARCHAR(20),
  nombre            VARCHAR(100),
  apellido_paterno  VARCHAR(50),
  apellido_materno  VARCHAR(50),

  -- Datos personales
  edad              INT,
  sistema_salud     VARCHAR(50),
  tipo_vivienda     VARCHAR(50),

  -- Situación financiera
  ingreso_mensual   NUMERIC(12,2),
  deuda_mensual     NUMERIC(12,2),
  condicion_laboral VARCHAR(50),
  antiguedad_meses  INT,
  integrantes_hogar INT,
  nivel_educacional VARCHAR(50),

  -- Historial crediticio
  mora_mas_larga_24m          INT,
  pagos_puntuales_12m         INT,
  creditos_cerrados_sin_mora  INT,
  consultas_credito_recientes INT,
  antiguedad_crediticia_anios INT,
  uso_tarjeta_pct             NUMERIC(5,2),
  tipo_pago_tarjeta           VARCHAR(50),

  -- Factores adicionales
  kyc_verificado          BOOLEAN,
  debe_pension_alimenticia BOOLEAN,

  -- Resultado scoring
  puntaje  INT,
  nivel    VARCHAR(50),
  motivo   TEXT,

  -- Fecha registro
  fecha TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scoring_rut
  ON scoring_evaluaciones (rut);


-- =====================================================
-- 6. SISTEMAS DE SCORING (para módulo modular)
-- =====================================================
CREATE TABLE IF NOT EXISTS scoring_systems (
  id             SERIAL PRIMARY KEY,
  nombre_sistema VARCHAR(255) NOT NULL,
  puntaje_base   INT NOT NULL,
  tabla_destino  VARCHAR(100) NOT NULL,  -- ej: 'scoring_evaluaciones'
  factores       JSONB NOT NULL,         -- parámetros de cada factor
  resumen        JSONB NOT NULL,         -- sumaPositiva, sumaNegativa, etc.
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- 7. OFERTAS PRE-APROBADAS
-- =====================================================
CREATE TABLE IF NOT EXISTS ofertas_preaprobadas (
  id            SERIAL PRIMARY KEY,
  rut_cliente   VARCHAR(20) NOT NULL,
  nombre_oferta VARCHAR(100) NOT NULL,
  monto_maximo  NUMERIC(12,2) NOT NULL,
  min_cuotas    INT NOT NULL,
  max_cuotas    INT NOT NULL,
  tasa_mensual  NUMERIC(5,2) NOT NULL,   -- % mensual referencial
  estado        VARCHAR(20) NOT NULL DEFAULT 'activa', -- activa | vencida | usada
  fecha_inicio  DATE DEFAULT CURRENT_DATE,
  fecha_fin     DATE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 🔹 Ofertas de ejemplo para el cliente de prueba 12345678-9
INSERT INTO ofertas_preaprobadas
  (rut_cliente, nombre_oferta, monto_maximo, min_cuotas, max_cuotas, tasa_mensual, estado)
VALUES
  ('12345678-9', 'Préstamo Súper Flexible', 2000000, 6, 36, 1.2, 'activa'),
  ('12345678-9', 'Préstamo Express',        500000,  3, 12, 1.5, 'activa'),
  ('12345678-9', 'Campaña Verano',         1500000, 12, 24, 1.1, 'vencida')
ON CONFLICT DO NOTHING;


-- =====================================================
-- 8. SOLICITUDES DERIVADAS DE OFERTAS PRE-APROBADAS
-- =====================================================
CREATE TABLE IF NOT EXISTS preaprobados_solicitudes (
  id              SERIAL PRIMARY KEY,
  id_oferta       INT NOT NULL REFERENCES ofertas_preaprobadas(id),
  rut_cliente     VARCHAR(20) NOT NULL,
  monto_solicitado NUMERIC(12,2) NOT NULL,
  cuotas          INT NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente_clave',
  -- pendiente_clave | confirmado | rechazado
  created_at      TIMESTAMP DEFAULT NOW()
);
```

## Funcionalidades implementadas

Para todas las funciones que requerian las API´s creamos una simulación de como debe funcionar dicha funcionalidad.

### Seguridad

La funcionalidad consiste en que un usuario puede registrar su correo y su carnet de identidad. Esto se enlazará a su cuenta y funcionará como el dispositivo de verificación de Identidad.

### Sistema de Scoring/Evaluación de Riesgo

Se implementó un sistema que, al registrar la información solicitada, entrega una evaluación de riesgo al usuario que la haya completado. Este sistema evalua diversos datos tales como edad, tipo de empleo, sueldo, historial crediticio, integrantes del hogar y comportamiento financiero.

### Solicitud de Préstamo e Historial

Consiste en la capacidad de poder realizar una solicitud de préstamo y ver el historial de solicitudes aprobadas, anuladas y rechazadas.

## Funcionalidades no implementadas
### Sistema de Scoring modular

Hay problemas para guardar los datos en las bases de datos. Se ha trabajado arduamente para resolver este problema, sin mucho éxito.

