/**
 * autocomplete-off.js
 * Desactiva el historial de autocompletado del navegador en todos
 * los inputs de tipo texto/fecha/etc. de la aplicación.
 */
(function () {
  const TIPOS_AFECTADOS = [
    'text', 'date', 'email', 'number', 'tel',
    'search', 'password', 'month', 'week',
    'time', 'datetime-local', 'url'
  ];

  function desactivarAutocomplete() {
    document.querySelectorAll('input').forEach(function (input) {
      const tipo = (input.getAttribute('type') || 'text').toLowerCase();
      if (TIPOS_AFECTADOS.includes(tipo)) {
        input.setAttribute('autocomplete', 'off');
      }
    });
  }

  // Ejecutar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', desactivarAutocomplete);
  } else {
    desactivarAutocomplete();
  }

  // También observar cambios dinámicos (inputs añadidos después por JS)
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        // Si el nodo añadido es un input
        if (node.tagName === 'INPUT') {
          const tipo = (node.getAttribute('type') || 'text').toLowerCase();
          if (TIPOS_AFECTADOS.includes(tipo)) {
            node.setAttribute('autocomplete', 'off');
          }
        }
        // O si contiene inputs dentro
        node.querySelectorAll && node.querySelectorAll('input').forEach(function (input) {
          const tipo = (input.getAttribute('type') || 'text').toLowerCase();
          if (TIPOS_AFECTADOS.includes(tipo)) {
            input.setAttribute('autocomplete', 'off');
          }
        });
      });
    });
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
})();
