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
    if(window.updateEmployeeTable) window.updateEmployeeTable();
  };

  function updateDashboardTable() {
    const recentTable = document.getElementById('recent-equipment-table');
    if (!recentTable) return;

    const savedData = JSON.parse(localStorage.getItem('recent_activity') || '[]');
    if (savedData.length === 0) {
        recentTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center p-4">
                    <i class="ph ph-file-dashed text-muted mb-2" style="font-size: 32px; display: block;"></i>
                    <p class="text-muted m-0">No se ha registrado ningún equipo últimamente</p>
                </td>
            </tr>`;
        return;
    }

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
                    <button class="btn btn-sm btn-primary" onclick="showStyledDetailsByIndex(${savedData.length - 1 - index})">Ver Detalles</button>
                    <button class="btn btn-sm btn-warning ms-1" onclick="openEditEquipmentModal(${savedData.length - 1 - index})" title="Modificar Equipo"><i class="ph ph-pencil"></i></button>
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

    const alertModalEl = document.getElementById('styledAlertModal');
    alertModalEl.style.zIndex = "";
    const alertModal = bootstrap.Modal.getOrCreateInstance(alertModalEl);
    
    // Fix for Bootstrap stacked modals bug (blackened screen)
    alertModalEl.addEventListener('hidden.bs.modal', function () {
        if (document.querySelectorAll('.modal.show').length > 0) {
            document.body.classList.add('modal-open');
        }
        const bds = document.querySelectorAll('.modal-backdrop');
        if (bds.length > document.querySelectorAll('.modal.show').length) {
            bds[bds.length - 1].remove();
        }
    }, { once: true });

    alertModal.show();
    
    setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 0) {
            backdrops[backdrops.length - 1].style.zIndex = "1090";
            alertModalEl.style.zIndex = "1095";
        }
    }, 100);
  };

  // Global helper for styled questions
  window.showStyledQuestion = function(message, title = 'Confirmación', onYes, onNo) {
    const modalTitle = document.getElementById('question-modal-title');
    const modalMessage = document.getElementById('question-modal-message');
    const yesBtn = document.getElementById('question-yes-btn');
    const noBtn = document.getElementById('question-no-btn');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;

    const questionModalEl = document.getElementById('styledQuestionModal');
    questionModalEl.style.zIndex = "";
    const questionModal = bootstrap.Modal.getOrCreateInstance(questionModalEl);
    
    // Quitar event listeners anteriores clonando los botones (o limpiando onclick)
    yesBtn.onclick = function() {
        questionModal.hide();
        if (onYes) onYes();
    };
    
    noBtn.onclick = function() {
        questionModal.hide();
        if (onNo) onNo();
    };

    // Fix for Bootstrap stacked modals bug (blackened screen)
    questionModalEl.addEventListener('hidden.bs.modal', function () {
        if (document.querySelectorAll('.modal.show').length > 0) {
            document.body.classList.add('modal-open');
        }
        const bds = document.querySelectorAll('.modal-backdrop');
        if (bds.length > document.querySelectorAll('.modal.show').length) {
            bds[bds.length - 1].remove();
        }
    }, { once: true });

    questionModal.show();
    
    setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 0) {
            backdrops[backdrops.length - 1].style.zIndex = "1090";
            questionModalEl.style.zIndex = "1095";
        }
    }, 100);
  };

  // Global helper for details modal
  window.showStyledDetails = function(item) {
    if (!item) return;
    
    const detailsModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('detailsModal'));
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

  // Edit Equipment Logic
  let currentEditingIndex = -1;

  window.openEditEquipmentModal = function(index) {
    const savedData = JSON.parse(localStorage.getItem('recent_activity') || '[]');
    const item = savedData[index];
    if (!item) return;
    
    currentEditingIndex = index;
    
    // Clear previous errors
    const errorMsgEl = document.getElementById('edit-eq-error');
    if (errorMsgEl) errorMsgEl.style.display = 'none';
    document.querySelectorAll('#editEquipmentModal .is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    // Set basic fields
    document.getElementById('edit-eq-id').value = item.identificador || '';
    document.getElementById('edit-eq-tipo').value = item.tipo || '';
    document.getElementById('edit-eq-estatus').value = item.estatus || 'Operativo';
    
    // Construct dynamic fields for item.data
    const dynamicContainer = document.getElementById('edit-dynamic-fields');
    dynamicContainer.innerHTML = '';
    
    const labelMap = {
        'serial': 'Número de Serie', 'clase': 'Clasificación', 'codigo': 'Código Institucional',
        'marca': 'Marca', 'modelo': 'Modelo', 'color': 'Color', 'capacidad': 'Capacidad', 'descripcion': 'Descripción'
    };

    for (let key in item.data) {
        const label = labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
        dynamicContainer.innerHTML += `
            <div class="mb-3">
                <label class="form-label">${label}</label>
                <input type="text" class="form-control" id="edit-data-${key}" value="${item.data[key]}" />
                <div class="invalid-feedback">Este espacio es obligatorio</div>
            </div>
        `;
    }

    const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editEquipmentModal'));
    editModal.show();
  };

  window.saveEquipmentEdit = function() {
    if (currentEditingIndex === -1) return;
    
    let hasError = false;
    
    // Validate basic fields
    const idInput = document.getElementById('edit-eq-id');
    const tipoInput = document.getElementById('edit-eq-tipo');
    
    [idInput, tipoInput].forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            hasError = true;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    // Validate dynamic fields
    const dynamicInputs = document.querySelectorAll('#edit-dynamic-fields input');
    dynamicInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            hasError = true;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    if (hasError) return;

    const savedData = JSON.parse(localStorage.getItem('recent_activity') || '[]');
    if (!savedData[currentEditingIndex]) return;

    // Update basic fields
    savedData[currentEditingIndex].identificador = idInput.value.trim();
    savedData[currentEditingIndex].tipo = tipoInput.value.trim();
    savedData[currentEditingIndex].estatus = document.getElementById('edit-eq-estatus').value;

    // Update dynamic fields
    dynamicInputs.forEach(input => {
        const key = input.id.replace('edit-data-', '');
        savedData[currentEditingIndex].data[key] = input.value.trim();
    });

    localStorage.setItem('recent_activity', JSON.stringify(savedData));
    
    bootstrap.Modal.getInstance(document.getElementById('editEquipmentModal')).hide();
    updateDashboardTable();
    window.showStyledAlert('El equipo ha sido modificado exitosamente.', 'Modificación Exitosa', 'ph-check-circle', '#16a34a');
  };

  window.deleteEquipmentModal = function() {
    if (currentEditingIndex === -1) return;

    const delModalEl = document.getElementById('modalDeleteEquipment');
    if (!delModalEl) return;
    
    // Ocultar modal de edición para mostrar el de borrado
    bootstrap.Modal.getInstance(document.getElementById('editEquipmentModal')).hide();
    
    const delModal = bootstrap.Modal.getOrCreateInstance(delModalEl);
    delModal.show();
    
    document.getElementById('btn-confirm-delete-eq').onclick = function() {
        const savedData = JSON.parse(localStorage.getItem('recent_activity') || '[]');
        savedData.splice(currentEditingIndex, 1);
        localStorage.setItem('recent_activity', JSON.stringify(savedData));
        
        delModal.hide();
        updateDashboardTable();
        currentEditingIndex = -1;
    };
  };

  // -----------------------------------------------------------
  // EMPLEADOS LOGIC
  // -----------------------------------------------------------

  window.updateEmployeeTable = function() {
    const table = document.getElementById('recent-employee-table');
    if (!table) return;

    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    if (empleados.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center p-4">
                    <i class="ph ph-users text-muted mb-2" style="font-size: 32px; display: block;"></i>
                    <p class="text-muted m-0">No se ha registrado ningún empleado últimamente</p>
                </td>
            </tr>`;
        return;
    }

    const latestItems = empleados.slice(-5).reverse();
    table.innerHTML = '';

    latestItems.forEach((item, index) => {
        let bg = 'bg-light-primary';
        let colorText = 'text-primary';
        let icon = 'ph-user';

        if (item.genero === 'Femenino') {
            bg = 'bg-light-danger';
            colorText = 'text-danger';
        }

        const row = `
            <tr class="unread">
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avtar avtar-s ${bg} me-2"><i class="ph ${icon} f-20 ${colorText}"></i></div>
                        <div>
                            <h6 class="mb-1">${item.nombre} ${item.apellido}</h6>
                            <small class="text-muted">${item.genero || 'No especificado'}</small>
                        </div>
                    </div>
                </td>
                <td><h6 class="mb-1">${item.cedula}</h6></td>
                <td>
                    <p class="m-0 text-muted">Cargo: <span class="fw-bold">${item.cargo || '-'}</span></p>
                    <small class="text-muted">Dpto: ${item.departamento || '-'}</small>
                </td>
                <td>
                    <h6 class="text-muted"><i class="ph ph-phone f-12 m-r-5"></i>${item.tlf || '-'}</h6>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showEmployeeDetailsByIndex(${empleados.length - 1 - index})">Ver Detalles</button>
                    <button class="btn btn-sm btn-warning ms-1" onclick="openEditEmployeeModal(${empleados.length - 1 - index})" title="Modificar Empleado"><i class="ph ph-pencil"></i></button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
  };

  let currentEmployeeEditingIndex = -1;

  window.openEditEmployeeModal = function(index) {
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const item = empleados[index];
    if (!item) return;
    
    currentEmployeeEditingIndex = index;
    
    // Clear errors
    document.querySelectorAll('#editEmployeeModal .is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    document.getElementById('edit-emp-nombre').value = item.nombre || '';
    document.getElementById('edit-emp-apellido').value = item.apellido || '';
    document.getElementById('edit-emp-cedula').value = item.cedula || '';
    document.getElementById('edit-emp-cargo').value = item.cargo || '';
    document.getElementById('edit-emp-depto').value = item.departamento || '';
    document.getElementById('edit-emp-genero').value = item.genero || 'Masculino';
    document.getElementById('edit-emp-tlf').value = item.tlf || '';

    const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editEmployeeModal'));
    editModal.show();
  };

  window.saveEmployeeEdit = function() {
    if (currentEmployeeEditingIndex === -1) return;
    
    let hasError = false;
    const fields = ['edit-emp-nombre', 'edit-emp-apellido', 'edit-emp-cedula', 'edit-emp-cargo', 'edit-emp-depto', 'edit-emp-tlf'];
    
    fields.forEach(id => {
        const input = document.getElementById(id);
        if (input && !input.value.trim()) {
            input.classList.add('is-invalid');
            hasError = true;
        } else if (input) {
            input.classList.remove('is-invalid');
        }
    });
    
    if (hasError) return;

    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    if (!empleados[currentEmployeeEditingIndex]) return;

    empleados[currentEmployeeEditingIndex].nombre = document.getElementById('edit-emp-nombre').value.trim();
    empleados[currentEmployeeEditingIndex].apellido = document.getElementById('edit-emp-apellido').value.trim();
    empleados[currentEmployeeEditingIndex].cedula = document.getElementById('edit-emp-cedula').value.trim();
    empleados[currentEmployeeEditingIndex].cargo = document.getElementById('edit-emp-cargo').value.trim();
    empleados[currentEmployeeEditingIndex].departamento = document.getElementById('edit-emp-depto').value.trim();
    empleados[currentEmployeeEditingIndex].genero = document.getElementById('edit-emp-genero').value;
    empleados[currentEmployeeEditingIndex].tlf = document.getElementById('edit-emp-tlf').value.trim();

    localStorage.setItem('empleados', JSON.stringify(empleados));
    
    bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal')).hide();
    window.updateEmployeeTable();
    if (window.showStyledAlert) {
        window.showStyledAlert('El empleado ha sido modificado exitosamente.', 'Modificación Exitosa', 'ph-check-circle', '#16a34a');
    }
  };

  window.deleteEmployeeModal = function() {
    if (currentEmployeeEditingIndex === -1) return;

    const delModalEl = document.getElementById('modalDeleteEmployee');
    if (!delModalEl) return;
    
    bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal')).hide();
    
    const delModal = bootstrap.Modal.getOrCreateInstance(delModalEl);
    delModal.show();
    
    document.getElementById('btn-confirm-delete-emp').onclick = function() {
        const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
        empleados.splice(currentEmployeeEditingIndex, 1);
        localStorage.setItem('empleados', JSON.stringify(empleados));
        
        delModal.hide();
        window.updateEmployeeTable();
        
        if (window.showStyledAlert) {
            setTimeout(() => {
                window.showStyledAlert('El empleado ha sido borrado exitosamente.', 'Borrado Exitoso', 'ph-trash', '#dc2626');
            }, 300);
        }
    };
  };

  window.showEmployeeDetailsByIndex = function(index) {
    const empleados = JSON.parse(localStorage.getItem('empleados') || '[]');
    const item = empleados[index];
    if (!item) return;

    const detailsModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('detailsModal'));
    const modalName = document.getElementById('details-modal-name');
    const modalTypeBadge = document.getElementById('details-modal-type-badge');
    const modalIcon = document.getElementById('details-type-icon');
    const detailsList = document.getElementById('details-list');

    modalName.textContent = `${item.nombre} ${item.apellido}`;
    modalTypeBadge.textContent = 'C.I: ' + item.cedula;
    modalTypeBadge.className = 'badge bg-light-info text-info';
    
    let bgClass = item.genero === 'Femenino' ? 'bg-light-danger text-danger' : 'bg-light-primary text-primary';
    modalIcon.className = `avtar avtar-l mb-2 ${bgClass}`;
    modalIcon.innerHTML = `<i class="ph ph-user"></i>`;

    let html = '';
    const details = {
        'Cargo': item.cargo,
        'Departamento': item.departamento,
        'Género': item.genero,
        'Teléfono': item.tlf,
        'Correo': item.correo || 'No especificado'
    };

    for (let key in details) {
        html += `
            <li class="list-group-item px-0 d-flex justify-content-between align-items-center">
                <span class="text-muted fw-bold">${key}</span>
                <span class="text-dark">${details[key] || '-'}</span>
            </li>
        `;
    }

    detailsList.innerHTML = html;
    detailsModal.show();
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

          // Eliminar scripts inyectados anteriormente (evita acumulación y duplicados de funciones)
          document.querySelectorAll('script[data-spa-injected]').forEach(s => s.remove());

          doc.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            newScript.setAttribute('data-spa-injected', 'true');
            Array.from(oldScript.attributes).forEach(attr => {
              if (attr.name !== 'data-spa-injected') newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.innerHTML;
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
