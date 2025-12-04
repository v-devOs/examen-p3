#!/bin/bash

# Script para preparar el despliegue en Vercel

echo "🚀 Preparando despliegue en Vercel..."
echo ""

# Verificar que no haya cambios sin commitear
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Tienes cambios sin commitear."
    echo "Por favor, haz commit de tus cambios primero:"
    echo "  git add ."
    echo "  git commit -m 'Mensaje descriptivo'"
    echo "  git push"
    exit 1
fi

echo "✅ No hay cambios pendientes"
echo ""

echo "📋 Checklist de despliegue:"
echo ""
echo "1. ¿Tienes una base de datos PostgreSQL accesible desde internet?"
echo "   - ❌ localhost NO funcionará"
echo "   - ✅ Neon, Supabase, Railway, Render"
echo ""
echo "2. ¿Has configurado DATABASE_URL en Vercel?"
echo "   - Ve a: vercel.com > Tu proyecto > Settings > Environment Variables"
echo "   - Agrega: DATABASE_URL=postgresql://..."
echo ""
echo "3. ¿Has sincronizado el schema a la base de datos de producción?"
echo "   - Ejecuta: DATABASE_URL='tu_url_produccion' npx prisma db push"
echo ""

read -p "¿Estás listo para desplegar? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "🎉 ¡Perfecto! Ya puedes desplegar"
    echo ""
    echo "Opciones:"
    echo "1. Push a GitHub (Vercel despliega automáticamente)"
    echo "   git push"
    echo ""
    echo "2. Desplegar con Vercel CLI"
    echo "   vercel --prod"
    echo ""
else
    echo "❌ Despliegue cancelado"
    echo "Completa el checklist y vuelve a intentar"
    exit 1
fi
