document.addEventListener('DOMContentLoaded', function () {
  console.log('SPA script initialized');

  const mainContentArea = document.getElementById('main-content-area');
  const dashboardHomeView = document.getElementById('dashboard-home-view');
  const breadcrumbContainer = document.getElementById('breadcrumb-container');
  
  if (!mainContentArea || !dashboardHomeView || !breadcrumbContainer) {
    console.error('SPA: Required elements missing', { mainContentArea, dashboardHomeView, breadcrumbContainer });
    return;
  }

  const originalHomeContent = dashboardHomeView.cloneNode(true);

  function updateBreadcrumb(text, parentText = 'Panel') {
    breadcrumbContainer.innerHTML = `
            <div class="page-header">
              <div class="page-block">
                <div class="row align-items-center">
                  <div class="col-md-12">
                    <div class="page-header-title">
                      <h5 class="mb-0">${text}</h5>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <ul class="breadcrumb mb-0">
                      <li class="breadcrumb-item"><a href="../dashboard/index.html" class="spa-link">Menu Principal</a></li>
                      <li class="breadcrumb-item"><a href="javascript: void(0)">${parentText}</a></li>
                      <li class="breadcrumb-item" aria-current="page">${text}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
        `;
  }

  function goHome() {
    console.log('SPA: Returning home');
    mainContentArea.innerHTML = '';
    mainContentArea.appendChild(originalHomeContent.cloneNode(true));
    
    breadcrumbContainer.innerHTML = `
            <div class="page-header">
              <div class="page-block">
                <div class="row align-items-center">
                  <div class="col-md-12">
                    <div class="page-header-title">
                      <h5 class="mb-0">Inicio</h5>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <ul class="breadcrumb mb-0">
                      <li class="breadcrumb-item"><a href="../dashboard/index.html" class="spa-link">Menu Principal</a></li>
                      <li class="breadcrumb-item"><a href="javascript: void(0)">Panel</a></li>
                      <li class="breadcrumb-item" aria-current="page">Inicio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
        `;
    initDetailsButtons();
  }

  function initDetailsButtons() {
    const viewBtns = document.querySelectorAll('.view-details-btn');
    viewBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const eqName = this.getAttribute('data-eq');
        const modalName = document.getElementById('modalEqName');
        if (modalName) modalName.textContent = eqName;
      });
    });
  }

  // GLOBAL CLICK INTERCEPTOR - Uses capture phase to catch events before other scripts
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    // Ignore external links, anchor-only links, or non-navigation links
    if (!href || href === '#!' || href.startsWith('http') || href.startsWith('javascript:')) return;

    // Only intercept local .html navigation
    if (href.includes('.html')) {
      e.preventDefault();
      e.stopPropagation();

      const absoluteUrl = new URL(href, window.location.href).pathname;
      
      console.log('SPA: Intercepted link click', { href, absoluteUrl });

      if (absoluteUrl.includes('dashboard/index.html')) {
        goHome();
      } else {
        const mtext = link.querySelector('.pc-mtext') || link.querySelector('span') || link;
        const text = mtext.textContent.trim();
        const parentItem = link.closest('.pc-hasmenu');
        const parentMText = parentItem ? parentItem.querySelector('.pc-mtext') : null;
        const parentText = parentMText ? parentMText.textContent.trim() : 'Procesos';
        
        loadContent(href, text, parentText);
      }
    }
  }, true);

  function loadContent(url, text, parentText) {
    console.log('SPA: Loading content', url);
    mainContentArea.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <h4 class="mt-3">Cargando <b>${text}</b></h4>
                <p>Por favor, espere un momento...</p>
            </div>`;

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar el archivo: ' + response.statusText);
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('main');

        if (newContent) {
          const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
          
          // Fix relative paths for images
          newContent.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/')) {
              img.src = baseUrl + src;
            }
          });

          // Inject CSS if missing
          doc.querySelectorAll('link[rel="stylesheet"]').forEach(style => {
            const href = style.getAttribute('href');
            if (href && !href.startsWith('http')) {
              const absoluteHref = baseUrl + href;
              if (!document.querySelector(`link[href="${absoluteHref}"]`)) {
                const newStyle = document.createElement('link');
                newStyle.rel = 'stylesheet';
                newStyle.href = absoluteHref;
                document.head.appendChild(newStyle);
              }
            }
          });

          mainContentArea.innerHTML = '';
          mainContentArea.appendChild(newContent);
          updateBreadcrumb(text, parentText);
          handleFormButtons(baseUrl);
          window.scrollTo(0, 0);
        } else {
          mainContentArea.innerHTML = '<div class="alert alert-warning m-4">Error: La página cargada no tiene el formato esperado (falta etiqueta &lt;main&gt;).</div>';
        }
      })
      .catch(error => {
        console.error('SPA: fetch error', error);
        mainContentArea.innerHTML = `<div class="alert alert-danger m-4">Error al cargar el contenido: ${error.message}</div>`;
      });
  }

  function handleFormButtons(baseUrl) {
    mainContentArea.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function (e) {
        const action = this.getAttribute('action');
        if (action && !action.startsWith('http')) {
          e.preventDefault();
          const button = e.submitter;
          const buttonText = button ? button.value || button.name : 'Continuar';

          if (action.includes('dashboard/index.html')) {
            goHome();
          } else {
            const nextUrl = baseUrl + action;
            loadContent(nextUrl, buttonText, 'Navegación');
          }
        }
      });
    });
  }
});
