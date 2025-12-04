# 🚀 Despliegue en Vercel con Prisma

## Prerrequisitos

1. **Base de datos PostgreSQL accesible desde internet**

   - No puede ser `localhost`
   - Opciones recomendadas:
     - [Neon](https://neon.tech) - PostgreSQL serverless (GRATIS)
     - [Supabase](https://supabase.com) - PostgreSQL con extras (GRATIS)
     - [Railway](https://railway.app) - PostgreSQL en la nube
     - [Render](https://render.com) - PostgreSQL managed

2. **Cuenta en Vercel** (gratis)

## 📝 Pasos para Desplegar

### 1. Preparar la Base de Datos

#### Opción A: Usar Neon (Recomendado - Gratis)

1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta y un proyecto
3. Copia la cadena de conexión (Connection String)
4. Ejemplo: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

#### Opción B: Usar Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. Ve a Settings > Database
4. Copia la Connection String (formato URI)
5. Ejemplo: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`

### 2. Actualizar la Base de Datos

Si estás usando una base de datos nueva en producción:

```bash
# Configura la URL de producción temporalmente
export DATABASE_URL="tu_url_de_produccion"

# O en Windows PowerShell:
$env:DATABASE_URL="tu_url_de_produccion"

# Sincroniza el schema a la nueva base de datos
npx prisma db push

# O si quieres usar el schema existente
npx prisma db pull
```

### 3. Desplegar en Vercel

#### Método 1: Desde GitHub (Recomendado)

1. Sube tu código a GitHub (ya lo hiciste con `git push`)

2. Ve a [vercel.com](https://vercel.com)

3. Click en "Add New Project"

4. Importa tu repositorio de GitHub

5. **Configurar Variables de Entorno:**

   - Ve a "Environment Variables"
   - Agrega:
     ```
     DATABASE_URL=postgresql://user:password@host:port/database?schema=public
     ```
   - Asegúrate de que sea la URL de producción (NO localhost)

6. **Configuración del Build:**

   - Framework Preset: Next.js (se detecta automáticamente)
   - Build Command: `npm run build` (ya configurado)
   - Output Directory: `.next` (automático)

7. Click en "Deploy"

#### Método 2: Desde la Terminal (Alternativo)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Seguir las instrucciones
# Cuando pregunte por variables de entorno, agrega:
# DATABASE_URL=tu_url_de_produccion
```

### 4. Configurar Variables de Entorno en Vercel

Si olvidaste configurarlas durante el despliegue:

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega:
   - **Key:** `DATABASE_URL`
   - **Value:** Tu cadena de conexión de producción
   - **Environments:** Production, Preview, Development (marca todos)
4. Guarda y redeploy

### 5. Redeployar (si es necesario)

```bash
# Método 1: Hacer un nuevo push a GitHub
git add .
git commit -m "Configure production environment"
git push

# Método 2: Desde Vercel Dashboard
# Ve a tu proyecto > Deployments > ... > Redeploy
```

## ⚠️ Importante

### Variables de Entorno

Tu `.env` local tiene:

```
DATABASE_URL="postgresql://admin:admin123@localhost:5440/proyecto_final_db?schema=public"
```

**NO uses esta URL en producción** porque:

- `localhost` no es accesible desde Vercel
- Es tu base de datos local de desarrollo

### Estructura de la URL de Producción

```
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[database]?schema=public&sslmode=require
```

Ejemplo con Neon:

```
postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## 🔍 Verificar el Despliegue

Después del despliegue, verifica:

1. **Build exitoso** - Vercel muestra "Ready"
2. **Prisma Client generado** - Revisa los logs del build
3. **Conexión a la BD** - Prueba la aplicación
4. **Funcionalidad de citas** - Agenda una cita de prueba

## 🐛 Solución de Problemas

### Error: "Cannot find module '@prisma/client'"

**Solución:** Asegúrate de que `postinstall` esté en `package.json`:

```json
"postinstall": "prisma generate"
```

### Error: "Can't reach database server"

**Solución:**

- Verifica que `DATABASE_URL` esté configurada en Vercel
- Asegúrate de que la base de datos permita conexiones externas
- Revisa que incluya `?sslmode=require` si es necesario

### Error: "Invalid `prisma.xxx.findMany()` invocation"

**Solución:**

- Asegúrate de que el schema de la base de datos coincida
- Ejecuta `npx prisma db push` en la base de datos de producción

### Error de build: "prisma generate failed"

**Solución:**

- Verifica que `prisma` esté en `dependencies` (no en `devDependencies`)
- Ya está configurado correctamente en tu `package.json`

## 📊 Monitoreo

Para ver logs en producción:

1. Ve a tu proyecto en Vercel
2. Click en "Functions" o "Deployments"
3. Selecciona un deployment
4. Click en "View Function Logs"

## 🔐 Seguridad

✅ **Ya configurado:**

- `.env` está en `.gitignore`
- Las variables de entorno se configuran en Vercel
- La cadena de conexión no se expone en el código

## 📱 URLs de tu Aplicación

Después del despliegue, tendrás:

- **Producción:** `https://tu-proyecto.vercel.app`
- **Preview:** `https://tu-proyecto-git-branch.vercel.app` (por cada branch)

## 🎉 ¡Listo!

Tu aplicación con Prisma está lista para producción en Vercel.

Para actualizaciones futuras, solo haz:

```bash
git add .
git commit -m "Update"
git push
```

Vercel automáticamente desplegará los cambios.
