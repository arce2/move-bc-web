/* Contenido editable desde el panel (/admin): horarios, tarifas y actividades.
   Los datos viven en /data/*.json y se pintan aquí. */
(function () {
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var get = function (url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw r; return r.json(); });
  };
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- fechas ---------- */
  var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  var aFecha = function (s) { var p = String(s || '').slice(0, 10).split('-'); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); };
  var fmtLargo = function (d) { return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(d); };
  var fmtCorto = function (d) { return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(d); };
  var pos = function (e) { return { 'Arriba': 'center 12%', 'Centro': 'center 55%', 'Abajo': 'center 88%' }[e] || 'center top'; };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var waBtn = function (a) {
    if (!a.enlace) a = { enlace: 'https://movebarbellclub.aimharder.com/schedule', enlace_texto: 'Reserva tu plaza' };
    var ext = /^https?:/.test(a.enlace) ? ' target="_blank" rel="noopener"' : '';
    return '<a class="btn" href="' + esc(a.enlace) + '"' + ext + '>' + esc(a.enlace_texto || 'Más información') + '</a>';
  };

  /* ---------- horarios ---------- */
  var tSched = $('[data-horarios]');
  if (tSched) get('data/horarios.json').then(function (h) {
    var dias = h.dias || [];
    var tipo = function (t) { return t === 'CrossFit y HYROX' ? 'both' : (t === 'HYROX' ? 'hx' : 'cf'); };
    var nombre = { cf: 'CrossFit', both: 'CrossFit / HYROX', hx: 'HYROX' };
    var ini = function (hora) { var m = String(hora).match(/(\d{1,2})[:.](\d{2})/); return m ? (+m[1]) * 60 + (+m[2]) : 9999; };
    var corta = function (d) { return String(d).slice(0, 3); };
    // tabla semanal (ordenador)
    var horas = {};
    dias.forEach(function (d) { (d.clases || []).forEach(function (c) { horas[c.hora] = ini(c.hora); }); });
    var filas = Object.keys(horas).sort(function (a, b) { return horas[a] - horas[b]; });
    var tabla = '<table class="week"><thead><tr><th scope="col">Hora</th>' + dias.map(function (d) { return '<th scope="col">' + esc(d.dia) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      filas.map(function (hr) {
        return '<tr><th scope="row">' + esc(hr) + '</th>' + dias.map(function (d) {
          var cs = (d.clases || []).filter(function (x) { return x.hora === hr; });
          return '<td>' + (cs.length ? cs.map(function (c) { return '<span class="tag ' + tipo(c.tipo) + '">' + nombre[tipo(c.tipo)] + '</span>'; }).join('') : '<span class="none">—</span>') + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
    // lista por día (móvil)
    var listas = dias.map(function (d, i) {
      return '<ul class="daylist" data-dia="' + i + '">' + (d.clases || []).map(function (c) {
        return c;
      }).reduce(function (acc, c) { var last = acc[acc.length - 1]; if (last && last.hora === c.hora) last.tipos.push(c.tipo); else acc.push({ hora: c.hora, tipos: [c.tipo] }); return acc; }, []).map(function (g) {
        return '<li><b>' + esc(g.hora) + '</b><span class="tags">' + g.tipos.map(function (t) { return '<span class="tag ' + tipo(t) + '">' + nombre[tipo(t)] + '</span>'; }).join('') + '</span></li>';
      }).join('') + '</ul>';
    }).join('');
    tSched.innerHTML = '<div class="week-wrap">' + tabla + '</div>' + listas;
    var bar = $('[data-dias]');
    var hoyIdx = (new Date().getDay() + 6) % 7; if (hoyIdx >= dias.length) hoyIdx = 0;
    var elegir = function (i) {
      [].forEach.call(tSched.querySelectorAll('.daylist'), function (u) { u.classList.toggle('on', +u.getAttribute('data-dia') === i); });
      if (bar) [].forEach.call(bar.children, function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    };
    if (bar) {
      bar.innerHTML = dias.map(function (d, i) { return '<button type="button" role="tab" data-i="' + i + '"><span class="full">' + esc(d.dia) + '</span><span class="short">' + esc(corta(d.dia)) + '</span></button>'; }).join('');
      bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) elegir(+b.getAttribute('data-i')); });
    }
    elegir(hoyIdx);
    var n = $('[data-horarios-nota]'); if (n && h.nota) n.textContent = h.nota;
  }).catch(function () {});

  /* ---------- tarifas ---------- */
  var tPrices = $('[data-tarifas]');
  if (tPrices) get('data/tarifas.json').then(function (t) {
    tPrices.innerHTML = (t.planes || []).map(function (p) {
      return '<div class="price' + (p.destacado ? ' feat' : '') + '"><b>' + esc(p.nombre) + '</b><span>' + esc(p.detalle) + '</span><span class="amt">' + esc(p.precio) + ' €<small> /mes</small></span></div>';
    }).join('');
    var set = function (sel, v) { var e = $(sel); if (e && v) e.textContent = v; };
    set('[data-tarifas-intro]', t.intro); set('[data-tarifas-bonos]', t.bonos); set('[data-tarifas-servicios]', t.servicios);
  }).catch(function () {});

  /* ---------- actividades (próximas, formación y archivo) ---------- */
  var needAct = $('[data-proximas]') || $('[data-archivo]') || $('[data-formacion]') || $('[data-aviso-evento]');
  if (needAct) get('data/actividades.json').then(function (data) {
    var list = (data.actividades || []).map(function (a) { a._d = aFecha(a.fecha); return a; });
    var prox = list.filter(function (a) { return a._d >= hoy && a.tipo !== 'Formación'; }).sort(function (a, b) { return a._d - b._d; });
    var past = list.filter(function (a) { return a._d < hoy; }).sort(function (a, b) { return b._d - a._d; });

    // aviso en portada
    var aviso = $('[data-aviso-evento]');
    if (aviso) {
      if (prox.length) {
        var e = prox[0];
        aviso.innerHTML = '<a class="ev-strip home" href="comunidad.html#proximos"><span class="eyebrow" style="margin:0">Próximo evento</span><b>' + esc(e.titulo) + ' · ' + esc(fmtLargo(e._d)) + '</b><span class="link">Ver evento</span></a>';
        aviso.hidden = false;
      } else aviso.remove();
    }

    // próximas
    var pBox = $('[data-proximas]');
    if (pBox) {
      if (!prox.length) { var em = $('[data-if-empty]'); if (em) em.hidden = false; pBox.remove(); }
      else pBox.innerHTML = prox.map(function (a) {
        var cuando = cap(fmtLargo(a._d)) + (a.hora ? ' · ' + esc(a.hora) + (/^\d/.test(a.hora) ? ' h' : '') : '');
        var dl = '<dt>Fecha</dt><dd>' + cuando + '</dd>' +
          (a.para ? '<dt>Para</dt><dd>' + esc(a.para) + '</dd>' : '') +
          (a.plazas ? '<dt>Plazas</dt><dd>' + esc(a.plazas) + '</dd>' : '') +
          (a.precio ? '<dt>Precio</dt><dd>' + esc(a.precio) + '</dd>' : '');
        return '<article class="event">' +
          (a.imagen ? '<div class="pic"><img src="' + esc(a.imagen) + '" alt="' + esc(a.titulo) + '" loading="lazy" decoding="async" style="object-position:' + pos(a.encuadre) + '"></div>' : '') +
          '<div class="txt"><span class="eyebrow" style="margin-bottom:.5rem">' + esc(a.tipo || 'Evento') + '</span><h3>' + esc(a.titulo) + '</h3>' +
          (a.descripcion ? '<p class="prose" style="margin-top:.6rem">' + esc(a.descripcion) + '</p>' : '') +
          '<dl>' + dl + '</dl>' + waBtn(a) + '</div></article>';
      }).join('');
    }

    // tarjetas de archivo
    var card = function (a) {
      var cuando = a.fecha_texto || cap(fmtCorto(a._d));
      return '<article>' + (a.imagen ? '<div class="pic"><img src="' + esc(a.imagen) + '" alt="' + esc(a.titulo) + '" loading="lazy" decoding="async"></div>' : '') +
        '<time datetime="' + esc(a.fecha) + '">' + esc(cuando) + '</time><h3>' + esc(a.titulo) + '</h3>' +
        (a.descripcion ? '<p>' + esc(a.descripcion) + '</p>' : '') +
        (a.enlace ? '<a class="link" href="' + esc(a.enlace) + '" target="_blank" rel="noopener">' + esc(a.enlace_texto || 'Ver más') + '</a>' : '') + '</article>';
    };
    var pintar = function (box, items, max) {
      if (!box) return;
      if (!items.length) { var sec = box.closest('[data-seccion]'); if (sec) sec.remove(); return; }
      box.innerHTML = items.map(card).join('');
      var more = box.parentNode.querySelector('[data-ver-mas]');
      if (items.length > max) {
        [].slice.call(box.children, max).forEach(function (el) { el.hidden = true; });
        if (more) { more.hidden = false; more.addEventListener('click', function () { [].forEach.call(box.children, function (el) { el.hidden = false; }); more.remove(); }); }
      } else if (more) more.remove();
    };
    pintar($('[data-formacion]'), list.filter(function (a) { return a.tipo === 'Formación'; }), 9);
    pintar($('[data-archivo]'), past.filter(function (a) { return a.tipo !== 'Formación'; }), 6);
  }).catch(function () { var a = $('[data-aviso-evento]'); if (a) a.remove(); });
})();
