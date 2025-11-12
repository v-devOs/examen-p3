# 🎓 Portal Estudiantil - Sistema de Gestión Académica

Portal web moderno para estudiantes que permite consultar calificaciones, kardex académico y horarios de clases. Desarrollado con Next.js 16 y diseñado con una interfaz intuitiva y responsiva.

## 📋 Descripción

Sistema de gestión académica que integra con una API REST para proporcionar a los estudiantes acceso a su información académica de manera centralizada y eficiente. Incluye autenticación segura mediante JWT y visualización de datos en tiempo real.

### ✨ Características Principales

- 🔐 **Autenticación Segura**: Sistema de login con tokens JWT
- 📊 **Dashboard Interactivo**: Vista general con acceso rápido a todos los módulos
- 📝 **Calificaciones**: Consulta de calificaciones por periodo con estadísticas
- 📚 **Kardex Académico**: Historial completo de materias cursadas y promedios
- 📅 **Horario de Clases**: Visualización del horario con múltiples vistas (semanal, diaria, lista)
- 🌙 **Dark Mode**: Soporte completo para tema oscuro
- 📱 **Diseño Responsivo**: Optimizado para dispositivos móviles, tablets y escritorio
- ♿ **Accesible**: Implementado siguiendo estándares de accesibilidad web

## 🚀 Tecnologías Utilizadas

### Framework Principal

**Next.js 16.0.1** - Framework de React para producción

Next.js es un framework de React que permite crear aplicaciones web de alto rendimiento con las siguientes características:

- **App Router**: Sistema de enrutamiento basado en el sistema de archivos con soporte para React Server Components
- **Server Components**: Componentes que se ejecutan en el servidor para mejor rendimiento y SEO
- **API Routes**: Endpoints de API integrados para manejar lógica del servidor
- **Optimización Automática**: Code splitting, lazy loading y optimización de imágenes integrados
- **TypeScript**: Soporte completo con tipado estático para mayor seguridad
- **Hot Reloading**: Recarga en caliente para desarrollo ágil

### Stack Tecnológico

```json
{
  "Frontend": {
    "Framework": "Next.js 16.0.1",
    "Biblioteca UI": "React 19.2.0",
    "Lenguaje": "TypeScript 5.x",
    "Estilos": "Tailwind CSS 4.x"
  },
  "Validación": {
    "Esquemas": "Zod 4.1.12"
  },
  "Autenticación": {
    "Método": "JWT (JSON Web Tokens)",
    "Almacenamiento": "Cookies HTTP-only"
  }
}
```

### Arquitectura

- **Server-Side Rendering (SSR)**: Renderizado en servidor para mejor SEO y performance
- **Client Components**: Componentes interactivos con estado del lado del cliente
- **API Integration**: Consumo de API REST externa para datos académicos
- **Component-Based**: Arquitectura modular con componentes reutilizables
- **Type Safety**: Validación de tipos con TypeScript y Zod

## 📦 Instalación

### Prerrequisitos

Asegúrate de tener instalado:

- **Node.js**: versión 18.x o superior
- **npm**, **yarn**, **pnpm** o **bun**: gestor de paquetes

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/v-devOs/examen-p3.git
cd examen-p3
```

2. **Instalar dependencias**

```bash
# Con npm
npm install

# Con yarn
yarn install

# Con pnpm
pnpm install

# Con bun
bun install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto (puedes copiar desde `.env.example`):

```bash
cp .env.example .env.local
```

**⚠️ IMPORTANTE para VPS con HTTP (sin SSL):**

Si vas a desplegar en un VPS que funciona con HTTP (sin HTTPS), debes configurar:

```env
# .env.local
NEXT_PUBLIC_ALLOW_HTTP=true
```

Esto permite que las cookies de autenticación funcionen en HTTP. **No uses esta configuración en producción con datos sensibles.**

Para desarrollo local o producción con HTTPS, no necesitas configurar nada adicional.

## 🎯 Ejecución

### Modo Desarrollo

Inicia el servidor de desarrollo con hot-reloading:

```bash
# Con npm
npm run dev

# Con yarn
yarn dev

# Con pnpm
pnpm dev

# Con bun
bun dev
```

La aplicación estará disponible en: **http://localhost:3000**

### Modo Producción

1. **Construir la aplicación**

```bash
npm run build
```

2. **Iniciar el servidor de producción**

```bash
npm run start
```

La aplicación optimizada estará disponible en: **http://localhost:3000**

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run start        # Inicia servidor de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint para verificar el código
```

## 🌐 Despliegue en VPS

### Configuración para VPS sin SSL (HTTP)

Si tu VPS funciona con HTTP (sin certificado SSL/HTTPS), sigue estos pasos:

1. **Crear archivo de configuración**

```bash
nano .env.local
```

2. **Agregar la siguiente configuración**

```env
NODE_ENV=production
NEXT_PUBLIC_ALLOW_HTTP=true
```

3. **Construir y ejecutar**

```bash
npm run build
npm run start
```

4. **Verificar que funciona**

- Las cookies de autenticación ahora funcionarán en HTTP
- El login debería mantener la sesión correctamente
- Revisa la consola del navegador para confirmar que no hay errores de cookies

### ⚠️ Recomendaciones de Seguridad

Para un entorno de producción real:

1. **Usa HTTPS**: Obtén un certificado SSL gratuito con [Let's Encrypt](https://letsencrypt.org/)
2. **Configura un proxy inverso**: Usa Nginx o Apache con SSL
3. **No uses `NEXT_PUBLIC_ALLOW_HTTP=true`** en producción con datos sensibles

```bash
# Ejemplo de configuración con SSL
# No necesitas NEXT_PUBLIC_ALLOW_HTTP
NODE_ENV=production
```

### Solución de Problemas Comunes

**Problema**: Las cookies no se guardan después del login en VPS

**Solución**:

1. Verifica que `.env.local` existe y contiene `NEXT_PUBLIC_ALLOW_HTTP=true`
2. Reinicia el servidor después de cambiar las variables de entorno
3. Limpia las cookies del navegador y vuelve a intentar

**Problema**: "Cookie blocked - secure attribute"

**Solución**: Esto ocurre cuando `secure=true` en HTTP. Asegúrate de:

- Tener `NEXT_PUBLIC_ALLOW_HTTP=true` en `.env.local`
- Reiniciar el servidor con `npm run build && npm run start`

## 📁 Estructura del Proyecto

```
examen-p3/
├── app/                          # App Router de Next.js
│   ├── actions/                  # Server Actions
│   │   ├── login/               # Autenticación
│   │   └── student/             # Acciones del estudiante
│   │       ├── grades/          # Calificaciones
│   │       ├── kardex/          # Kardex académico
│   │       └── schedule/        # Horarios
│   ├── student/                 # Rutas del estudiante
│   │   ├── grades/              # Página de calificaciones
│   │   ├── kardex/              # Página de kardex
│   │   └── schedule/            # Página de horario
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página de inicio (login)
├── components/                   # Componentes reutilizables
│   ├── schedule-header.tsx      # Header del horario
│   ├── schedule-stats-card.tsx  # Tarjeta de estadísticas
│   ├── schedule-filters.tsx     # Filtros de horario
│   ├── schedule-card.tsx        # Tarjeta compacta de clase
│   └── schedule-detailed-card.tsx # Tarjeta detallada de clase
├── public/                      # Archivos estáticos
├── .env.local                   # Variables de entorno (no incluido)
├── next.config.ts               # Configuración de Next.js
├── tailwind.config.ts           # Configuración de Tailwind
├── tsconfig.json                # Configuración de TypeScript
└── package.json                 # Dependencias y scripts
```

## 🔑 Credenciales de Prueba

Para probar la aplicación, utiliza las siguientes credenciales del sistema SIIA del Tecnológico Nacional de México:

```
Usuario: Tu número de control
Contraseña: Tu contraseña del SIIA
```

**Nota**: Este es un proyecto de demostración que consume la API real del SIIA. Asegúrate de usar tus credenciales reales del Tecnológico.

## 🎨 Características de UI/UX

- **Glassmorphism**: Efectos de vidrio esmerilado para un diseño moderno
- **Gradientes**: Paleta de colores blue → indigo → purple
- **Animaciones**: Transiciones suaves y micro-interacciones
- **Responsividad**: Grid adaptable para todos los tamaños de pantalla
- **Dark Mode**: Tema oscuro automático basado en preferencias del sistema
- **Loading States**: Indicadores de carga para mejor experiencia
- **Error Handling**: Mensajes de error claros y útiles

## 🧪 Módulos Implementados

### 1. 🔐 Autenticación

- Login con validación de credenciales
- Gestión de sesión con JWT
- Protección de rutas privadas

### 2. 📊 Calificaciones

- Vista por periodo académico
- Estadísticas de promedio
- Desglose por materia
- Indicadores visuales de rendimiento

### 3. 📚 Kardex Académico

- Historial completo de materias
- Cálculo de promedios
- Visualización de créditos
- Filtros por periodo

### 4. 📅 Horario de Clases

- Vista semanal organizada por días
- Vista diaria con detalle de clases
- Vista de lista completa
- Búsqueda y filtros
- Información de aulas y grupos

## 🛠️ Desarrollo

### Requisitos para Contribuir

1. Fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

### Convenciones de Código

- **TypeScript**: Usar tipado estático en todo el código
- **ESLint**: Seguir las reglas de linting del proyecto
- **Componentes**: Usar Server Components por defecto, Client Components solo cuando sea necesario
- **Estilos**: Usar Tailwind CSS con clases utilitarias
- **Nomenclatura**: camelCase para variables, PascalCase para componentes

## 📄 Licencia

Este proyecto es un trabajo académico desarrollado para el Tecnológico Nacional de México.

## 👨‍💻 Autor

**Victor Manuel Angeles Meza**

- GitHub: [@v-devOs](https://github.com/v-devOs)

## 🙏 Agradecimientos

- Tecnológico Nacional de México por proporcionar la API del SIIA
- Next.js y el equipo de Vercel por el excelente framework
- Tailwind CSS por el sistema de diseño
- La comunidad de código abierto

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub
