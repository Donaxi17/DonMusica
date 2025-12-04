# 🚀 Guía de Integración PropellerAds

## ¿Qué es PropellerAds?

PropellerAds es una red publicitaria que **NO requiere tráfico mínimo** y aprueba sitios rápidamente (24-48 horas). Es perfecta para empezar a monetizar mientras construyes audiencia para AdSense.

## 💰 Ganancias Esperadas

| Tráfico Diario | Ganancia Mensual Estimada |
|----------------|---------------------------|
| 50 visitas/día | $5-15/mes |
| 100 visitas/día | $15-40/mes |
| 500 visitas/día | $75-200/mes |
| 1,000 visitas/día | $150-400/mes |

*Nota: Con tráfico de calidad (Colombia/LATAM), las ganancias son menores que USA/Europa, pero es un buen comienzo.*

## 📋 Paso 1: Registro

### A) Crear Cuenta

1. **Ir a:** https://publishers.propellerads.com/#/app/auth/signUp

2. **Completar formulario:**
   ```
   Email: tu-email@gmail.com
   Password: (crea una segura)
   Full Name: Tu Nombre
   Country: Colombia
   ```

3. **Verificar email** (chequea spam si no llega)

### B) Agregar Sitio Web

1. Ir a **"Sites & Apps"** → **"Add Site"**

2. **Completar información:**
   ```
   Website URL: https://tudominio.com
   Category: Music / Entertainment
   Monthly Visitors: 0-10,000 (o el número real)
   Traffic Sources: Organic, Social Media, Direct
   ```

3. **Aceptar términos** y enviar

4. **Esperar aprobación:** 24-48 horas (normalmente 1-2 horas)

## 📧 Paso 2: Después de la Aprobación

Recibirás un email de aprobación. Entonces:

### A) Crear Zonas de Anuncios

1. Ir a **"Monetization"** → **"Create Zone"**

2. **Recomendación de zonas para tu sitio:**

#### Zona 1: OnClick Popunder (Más Rentable)
```
Name: Homepage Popunder
Format: OnClick Popunder
Frequency: 1 per 24 hours
Sites: DonMusica
```

#### Zona 2: Push Notifications
```
Name: Push Notifications
Format: Push Notifications
Frequency: Unlimited
Sites: DonMusica
```

#### Zona 3: Native Banner (Blog)
```
Name: Blog Banner
Format: Native Banner
Size: 300x250 or Responsive
Sites: DonMusica
```

### B) Obtener Códigos

Después de crear cada zona, PropellerAds te dará:
- **Zone ID** (ejemplo: `5408708`)
- **Código JavaScript**

## 🔧 Paso 3: Integrar en DonMusica

### A) OnClick Popunder (Más importante)

1. **Abre:** `src/index.html`

2. **Agrega ANTES del cierre `</head>`:**

```html
<!-- PropellerAds OnClick Popunder -->
<script>
(function(d,z,s){
  s.src='https://'+d+'/400/'+z;
  try{
    (document.body||document.documentElement).appendChild(s)
  }catch(e){}
})('wordugoldenbutton.com', AQUI_TU_ZONE_ID, document.createElement('script'))
</script>
```

**Reemplaza `AQUI_TU_ZONE_ID` con el número que te den** (ej: `5408708`)

### B) Native Banners (En el Blog)

Ya creaste el componente `PropellerAdComponent`. Para usarlo:

1. **Importa en el blog:**

```typescript
// En src/app/components/blog/blog.component.ts
import { PropellerAdComponent } from '../shared/propeller-ad/propeller-ad.component';

// Agrega a imports
imports: [CommonModule, AdBannerComponent, PropellerAdComponent]
```

2. **Usa en el HTML:**

```html
<!-- En blog.component.html, después de algunos artículos -->
<app-propeller-ad [zoneId]="'TU_ZONE_ID_AQUI'"></app-propeller-ad>
```

### C) Push Notifications

1. **Abre:** `src/index.html`

2. **Agrega ANTES del cierre `</body>`:**

```html
<!-- PropellerAds Push Notifications -->
<script src="https://cdn.p-n.io/pushads-autosubscribe.min.js" data-zone="TU_ZONE_ID" async data-vars-1="0"></script>
```

## 📍 Dónde Colocar Anuncios (Recomendado)

### ✅ Buenos Lugares:
1. **Homepage:** OnClick Popunder (1 vez cada 24h)
2. **Blog:** Native Banner cada 3 artículos
3. **Player:** Banner lateral (desktop)
4. **Artistas:** Banner después de la lista
5. **Push:** En todo el sitio (auto-subscribe)

### ❌ Evitar:
- Más de 3 banners por página
- Pop-ups agresivos al inicio
- Anuncios que cubran contenido importante

## 💡 Tips para Maximizar Ganancias

### 1. **Optimiza la Colocación**
```
- Above the fold (parte visible sin scroll)
- Cerca de contenido popular
- En puntos de conversión natural
```

### 2. **Prueba Formatos**
```
Semana 1: Solo Popunder
Semana 2: Popunder + Push
Semana 3: Popunder + Push + Banners
```

Analiza cuál genera más sin afectar la experiencia.

### 3. **Monitorea Estadísticas**
```
- Dashboard de PropellerAds cada día
- Ve qué páginas generan más
- Ajusta ubicaciones según rendimiento
```

## 🎯 Próximos Pasos

### Inmediato (Hoy):
1. ✅ Registrarte en PropellerAds
2. ✅ Agregar tu sitio
3. ✅ Esperar aprobación (1-2 horas)

### Después de Aprobación (Mañana):
1. ✅ Crear 3 zonas (Popunder, Push, Banner)
2. ✅ Copiar códigos
3. ✅ Integrar códigos en el sitio
4. ✅ Hacer commit y push a producción
5. ✅ Verificar que los anuncios funcionen

### Primera Semana:
1. ✅ Monitorear ganancias diarias
2. ✅ Ajustar ubicaciones si es necesario
3. ✅ Comenzar a generar tráfico (redes sociales)

### Primer Mes:
1. ✅ Llegar a 100 visitas/día
2. ✅ Ganar primeros $15-30
3. ✅ Aplicar a AdSense cuando tengas tráfico estable
4. ✅ Reemplazar PropellerAds con AdSense

## 📊 Comparación: PropellerAds vs AdSense

| Característica | PropellerAds | AdSense |
|----------------|--------------|---------|
| Aprobación | ✅ 24-48h | ⏰ 1-2 semanas |
| Tráfico Mínimo | ✅ No requiere | ❌ 100+/día |
| CPM Promedio | $1-5 | $3-10 |
| Pago Mínimo | $5 | $100 |
| Experiencia Usuario | ⚠️ Más intrusivo | ✅ Menos intrusivo |

## 🆘 Soporte

Si tienes problemas:
- **PropellerAds Support:** publishers@propellerads.com
- **Telegram:** @PropellerAdsPublishers
- **Live Chat:** En el dashboard

## 📝 Notas Importantes

1. **No uses AdSense y PropellerAds juntos** - Viola las políticas de AdSense
2. **Primero construye con PropellerAds**, luego migra a AdSense
3. **Los pop-ups pueden molestar** - úsalos con moderación
4. **Pagos:** PropellerAds paga vía PayPal, Payoneer, o transferencia bancaria
5. **Mínimo de pago:** $5 USD (muy alcanzable)

## 🎉 ¡Listo!

Ahora sabes todo lo necesario para monetizar con PropellerAds. Recuerda:
- Es una solución **temporal** mientras construyes tráfico
- Cuando tengas 100+ visitas/día y 2-3 meses de antigüedad, **cambia a AdSense**
- Enfócate en crear contenido y generar tráfico en paralelo

---

**Próximo paso:** Registrarte en PropellerAds ahora mismo → https://publishers.propellerads.com/#/app/auth/signUp
