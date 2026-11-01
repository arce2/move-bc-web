# Panel de contenidos Move BC (Decap CMS)

El gimnasio entra en **/admin** y edita, sin tocar el diseño:
- **Horarios**: días, franjas y si cada franja es CrossFit, HYROX o CrossFit y HYROX.
- **Tarifas**: nombre, qué incluye, precio, cuál se destaca, y los textos de bonos y servicios.
- **Eventos, talleres y formación**: título, tipo, fecha, hora, descripción, precio, plazas, foto y enlace de inscripción.
  Con fecha de hoy o futura salen en «Próximos eventos» (y en el aviso de la portada).
  Cuando pasa la fecha, pasan solos al archivo («Lo que hemos compartido» o «Formación»). No hay que mover nada.

Los datos se guardan en `data/*.json` y las fotos subidas en `img/subidas/`.

## Puesta en marcha (una sola vez)

1. Crea un repositorio en GitHub (p. ej. `move-bc-web`) y sube esta carpeta tal cual.
2. En Netlify: **Add new project → Import an existing project → GitHub** y elige el repositorio
   (sin comando de build; carpeta de publicación: la raíz `/`). Si quieres conservar la URL actual,
   en el sitio *fantastic-mermaid* ve a **Project configuration → Build & deploy → Link repository**.
3. En GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**
   - Homepage URL: la URL de la web
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   Copia el *Client ID* y genera un *Client secret*.
4. En Netlify: **Project configuration → Access & security → OAuth → Install provider → GitHub**
   y pega el Client ID y el Client secret.
5. En `admin/config.yml` cambia `repo: CAMBIAR-USUARIO/move-bc-web` por tu usuario/repositorio,
   y cuando pases al dominio definitivo, cambia `site_url` y `display_url`.
6. Acceso del gimnasio: que creen una cuenta de GitHub (p. ej. con movebarbellclub@gmail.com) y la añades
   como colaboradora del repositorio (**Settings → Collaborators**). Entran en `https://SU-DOMINIO/admin`
   con «Login with GitHub».

Cada vez que guardan algo en el panel, se crea un commit y Netlify vuelve a publicar la web sola (1-2 min).

Coste: 0 €. GitHub y Netlify gratis bastan para esta web.
(Netlify Identity está en desuso; por eso se entra con GitHub y no con email y contraseña.)

## Antes de publicar en el dominio definitivo
- Quitar `noindex` de los `<meta name="robots">` de las páginas, `_headers` y `robots.txt`.
- Quitar los avisos amarillos «Pendiente» que queden.

## Merchandising (más adelante)
Lo más sencillo: una colección «Merch» en el panel (foto, nombre, precio, tallas) y una página `merch.html`
que la pinte igual que los eventos, con botón de compra por WhatsApp o enlace de pago de Stripe por producto.
Sin carrito ni tienda online que mantener.
