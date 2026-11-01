(function () {
  document.documentElement.classList.add('js');
  var top = document.querySelector('.top');
  var burger = document.querySelector('.burger');
  if (burger) burger.addEventListener('click', function () {
    var open = top.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', function () { top.classList.remove('open'); }); });

  var mbar = document.querySelector('.mbar');
  var contact = document.getElementById('contacto');
  var onScroll = function () {
    top.classList.toggle('scrolled', scrollY > 10);
    if (!mbar) return;
    var nearEnd = contact && contact.getBoundingClientRect().top < innerHeight * 0.85;
    mbar.classList.toggle('show', scrollY > 420 && !nearEnd);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // aparición suave (el contenido es visible aunque falle el script)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
