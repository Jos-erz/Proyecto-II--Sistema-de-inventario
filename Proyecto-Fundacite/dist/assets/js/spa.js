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

  window.goHome = function() {
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
    updateDashboardTable();
  };

  function updateDashboardTable() {
    const recentTable = document.getElementById('recent-equipment-table');
    if (!recentTable) return;

    const savedData = JSON.parse(localStorage.getItem('recent_activity') || '[]');
    if (savedData.length === 0) return;

    const latestItems = savedData.slice(-5).reverse();
    recentTable.innerHTML = '';

    latestItems.forEach((item, index) => {
        let icon = 'ph-desktop';
        let bg = 'bg-light-primary';
        let colorText = 'text-primary';
        let estatus = item.estatus || 'Operativo';
        let estatusColor = estatus === 'Operativo' ? 'success' : 'warning';

        if (item.tipo === 'Periférico') {
            icon = 'ph-keyboard'; bg = 'bg-light-warning'; colorText = 'text-warning';
        } else if (item.tipo === 'Componente') {
            icon = 'ph-cpu'; bg = 'bg-light-success'; colorText = 'text-success';
        } else if (item.tipo === 'Equipo Informático') {
            if (item.data.clase === 'Laptop') {
                icon = 'ph-laptop'; bg = 'bg-light-danger'; colorText = 'text-danger';
            } else {
                icon = 'ph-desktop'; bg = 'bg-light-primary'; colorText = 'text-primary';
            }
        }

        const row = `
            <tr class="unread">
                <td>
                    <div class="avtar avtar-s ${bg}"><i class="ph ${icon} f-20"></i></div>
                </td>
                <td>
                    <h6 class="mb-1">${item.identificador}</h6>
                    <p class="m-0 text-muted">Tipo: <span class="${colorText} fw-bold">${item.tipo}</span></p>
                </td>
                <td>
                    <h6 class="text-muted"><i class="ti ti-circle-filled ${colorText} f-10 m-r-15"></i>${item.fecha}</h6>
                </td>
                <td>
                    <span class="badge bg-light-${estatusColor} text-${estatusColor}">${estatus}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showStyledDetailsByIndex(${latestItems.length - 1 - index})">Ver Detalles</button>
                </td>
            </tr>
        `;
        recentTable.innerHTML += row;
    });
  }

  // Global helper for styled alerts
  window.showStyledAlert = function(message, title = 'Mensaje del Sistema', icon = 'ph-info', color = '#1e5694') {
    const modalTitle = document.getElementById('alert-modal-title');
    const modalMessage = document.getElementById('alert-modal-message');
    const modalIcon = document.getElementById('alert-modal-icon');
    const modalHeader = document.getElementById('alert-modal-header');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;
    if (modalIcon) {
        modalIcon.className = `ph ${icon} f-40 mb-3`;
        modalIcon.style.color = color;
    }
    if (modalHeader) modalHeader.style.background = color;

    const alertModal = new bootstrap.Modal(document.getElementById('styledAlertModal'));
    alertModal.show();
  };

  // Global helper for styled questions
  window.showStyledQuestion = function(message, title = 'Confirmación', onYes, onNo) {
    const modalTitle = document.getElementById('question-modal-title');
    const modalMessage = document.getElementById('question-modal-message');
    const yesBtn = document.getElementById('question-yes-btn');
    const noBtn = document.getElementById('question-no-btn');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;

    const questionModal = new bootstrap.Modal(document.getElementById('styledQuestionModal'));
    
    yesBtn.onclick = function() {
        questionModal.hide();
        if (onYes) onYes();
    };
    
    noBtn.onclick = function() {
        questionModal.hide();
        if (onNo) onNo();
    };

    questionModal.show();
  };

  // Global helper for details modal
  window.showStyledDetails = function(item) {
    if (!item) return;
    
    const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    const modalName = document.getElementById('details-modal-name');
    const modalTypeBadge = document.getElementById('details-modal-type-badge');
    const modalIcon = document.getElementById('details-type-icon');
    const detailsList = document.getElementById('details-list');

    modalName.textContent = item.identificador;
    modalTypeBadge.textContent = item.tipo;
    
    let icon = 'ph-desktop';
    let bg = 'bg-light-primary';
    let text = 'text-primary';

    if (item.tipo === 'Periférico') { icon = 'ph-keyboard'; bg = 'bg-light-warning'; text = 'text-warning'; }
    else if (item.tipo === 'Componente') { icon = 'ph-cpu'; bg = 'bg-light-success'; text = 'text-success'; }
    else if (item.tipo === 'Equipo Informático' && item.data.clase === 'Laptop') { icon = 'ph-laptop'; bg = 'bg-light-danger'; text = 'text-danger'; }

    modalIcon.className = `avtar avtar-l mb-2 ${bg} ${text}`;
    modalIcon.innerHTML = `<i class="ph ${icon}"></i>`;
    modalTypeBadge.className = `badge ${bg} ${text}`;

    let listHtml = '';
    const labelMap = {
        'fecha': 'Fecha de Registro',
        'origen': 'Origen de Adquisición',
        'serial': 'Número de Serie',
        'nombre': 'Nombre/Tipo',
        'estado': 'Estado Físico',
        'estatus': 'Estatus en Sistema',
        'capacidad': 'Capacidad Técnica',
        'clase': 'Clasificación',
        'codigo': 'Código Institucional',
        'color': 'Color del Equipo',
        'descripcion': 'Descripción Detallada',
        'marca': 'Marca',
        'modelo': 'Modelo',
        'flujo': 'Tipo de Flujo'
    };

    listHtml += `<li class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="text-muted small">Fecha</span>
                    <span class="fw-bold">${item.fecha}</span>
                 </li>`;
    listHtml += `<li class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="text-muted small">Origen</span>
                    <span class="fw-bold">${item.origen}</span>
                 </li>`;

    for (let key in item.data) {
        const label = labelMap[key] || key.toUpperCase();
        listHtml += `<li class="list-group-item d-flex justify-content-between align-items-start py-3">
                        <div class="ms-2 me-auto">
                            <div class="text-muted small mb-1">${label}</div>
                            <div class="fw-bold text-dark">${item.data[key]}</div>
                        </div>
                     </li>`;
    }

    detailsList.innerHTML = listHtml;
    detailsModal.show();
  };

  window.showStyledDetailsByIndex = function(index) {
    const savedData = JSON.parse(localStorage.getItem('recent_activity') || '[]');
    if (savedData[index]) {
        showStyledDetails(savedData[index]);
    }
  };

  window.loadContentGlobal = function(url, text, parentText) {
    loadContent(url, text, parentText);
  };

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

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#!' || href.startsWith('http') || href.startsWith('javascript:')) return;

    if (href.includes('.html')) {
      e.preventDefault();
      e.stopPropagation();

      const absoluteUrl = new URL(href, window.location.href).pathname;
      
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
          
          newContent.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/')) {
              img.src = baseUrl + src;
            }
          });

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

          doc.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            document.body.appendChild(newScript);
          });

          updateBreadcrumb(text, parentText);
          handleFormButtons(baseUrl);
          window.scrollTo(0, 0);
          
          if (url.includes('dashboard/index.html')) {
            updateDashboardTable();
          }
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
  
  updateDashboardTable();
});
