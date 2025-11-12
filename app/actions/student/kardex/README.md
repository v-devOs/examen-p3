# Kardex Actions

Actions para manejar el endpoint de kardex académico del estudiante.

## Estructura

- **schemas.ts**: Definición de schemas Zod para validación
- **actions.ts**: Funciones server actions para obtener el kardex
- **index.ts**: Barrel file para exportar todas las funcionalidades

## Endpoint

`GET /movil/estudiante/kardex`

## Schemas

### KardexSubject

Representa una materia individual en el kardex:

```typescript
{
  clave_materia: string;
  nombre_materia: string;
  creditos: number;
  calificacion: string | null;
  periodo?: string;
  semestre?: string | number;
  estatus?: string;
  tipo_materia?: string;
  observaciones?: string;
  fecha?: string;
  grupo?: string;
}
```

## Actions

### getKardexAction()

Obtiene el kardex completo del estudiante.

**Returns:** `Promise<KardexActionResult>`

**Ejemplo de uso:**

```typescript
const result = await getKardexAction();
if (result.success) {
  console.log(result.data); // KardexList
}
```

### refreshKardexAction()

Refresca los datos del kardex.

**Returns:** `Promise<KardexActionResult>`

## Logging

El módulo incluye logging detallado para debugging:

- 📚 Inicio de solicitud
- ✅ Token obtenido
- 📡 Status de respuesta
- 📦 Respuesta completa
- 📋 Datos extraídos
- 🔍 Análisis de estructura
- 📊 Total de materias
- 🔎 Estructura de primera materia
- 🔄 Validación con Zod
- ✨ Ejemplo de datos validados
- ⚠️ Fallback sin validación si es necesario

## Notas

- Los logs están diseñados para ayudar a identificar la estructura real de la respuesta del API
- El schema es flexible y maneja diferentes tipos de datos (string/number)
- Incluye transformaciones para normalizar los datos (ej: calificaciones a 2 decimales)
- Tiene fallback para devolver datos sin validación si el schema no coincide
