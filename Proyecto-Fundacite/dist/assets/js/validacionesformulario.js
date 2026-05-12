/**
 * Sistema de Inventario - Fundacite Yaracuy
 * Validaciones de Formularios Centralizadas
 */

(function() {
    'use strict';

    /**
     * Valida el formato del RIF (Venezolano)
     */
    function isValidRIF(rif) {
        const rifRegex = /^[VGEPJC][-][0-9]{8}[-][0-9]$/i;
        return rifRegex.test(rif);
    }

    /**
     * Muestra u oculta un error para un campo específico
     */
    function toggleError(inputEl, isValid, message = 'Campo obligatorio') {
        let errorEl = inputEl.parentNode.querySelector('.error-message');
        
        // Si no existe el div de error, lo creamos dinámicamente
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.style.display = 'none';
            inputEl.parentNode.appendChild(errorEl);
        }

        if (isValid) {
            inputEl.classList.remove('input-error');
            errorEl.style.display = 'none';
        } else {
            inputEl.classList.add('input-error');
            errorEl.innerHTML = message;
            errorEl.style.display = 'block';
        }
    }

    /**
     * Función global de validación
     */
    window.validateCurrentForm = function(form) {
        if (form.id === 'form-salir' || form.id === 'form-atras') return true;

        let isAllValid = true;
        
        // Buscamos todos los campos relevantes en el formulario
        const inputs = form.closest('main').querySelectorAll('input[type="text"], input[type="date"], input[type="radio"], select, textarea');

        // Diccionario de ejemplos técnicos realistas
        const fieldExamples = {
            'inst-rif': 'J-30123456-0',
            'inst-nombre': 'Fundación para el Desarrollo de la Ciencia y la Tecnología del Estado Yaracuy',
            'inst-direccion': 'Av. Libertador entre calles 10 y 11, Edif. Fundacite, San Felipe',
            'marca-id': 'HPI-10',
            'marca-nombre': 'HEWLETT-PACKARD',
            'marca-descripcion': 'Empresa tecnológica especializada en hardware y software',
            'modelo-id': 'HP-600-G1',
            'modelo-nombre': 'HP ProDesk 600 G1 SFF',
            'modelo-especificaciones': 'Procesador Intel Core i5-4570, 8GB RAM DDR3, 500GB HDD',
            'tcomp-id': 'MEM-DDR4',
            'tcomp-nombre': 'Memoria RAM DDR4',
            'tcomp-descripcion': 'Memoria de acceso aleatorio para procesamiento de datos',
            'tcomp-unidad': 'GB / MHz / TB',
            'tper-codigo': 'MON-LED',
            'tper-nombre': 'Monitor LED',
            'tper-descripcion': 'Unidad de visualización de video de alta resolución',
            'equipo-codigo': 'FY-CP-001',
            'equipo-serial': 'MXL4123456',
            'equipo-estado': 'OPERATIVO',
            'equipo-color': 'NEGRO / PLATEADO',
            'equipo-descripcion': 'Computador de escritorio de alto rendimiento para diseño',
            'comp-serial': 'ABCD123456789',
            'comp-estado': 'NUEVO',
            'comp-estatus': 'INSTALADO',
            'comp-capacidad': '8GB / 240GB SSD',
            'per-serial': 'CN-0V5357-71618',
            'per-nombre': 'Teclado USB Estándar',
            'doc-archivo': {
                'Motivo': 'Traslado de equipos a la oficina de soporte técnico',
                'Nombre del archivo': 'acta_recepcion_bienes.pdf',
                'default': 'acta_recepcion_bienes.pdf'
            },
            'doc-numero': 'NRO-2024-0012',
            // Campos de Asignación
            'comp-solicitud': 'SOL-FY-001',
            'comp-Descripcion': 'Requerimiento de equipo para oficina de administración',
            'comp-codigo': 'DIR-ADM',
            'comp-cargo': 'AUX-ADM-I',
            'comp-Cedula': '12.345.678',
            'comp-telefono': '04121234567',
            // Mapeo especial para IDs genéricos basados en el nombre del campo
            'comp-nombre': {
                'Nombre del Departamento': 'Informática',
                'Nombre del Cargo': 'Encargado de los Bienes',
                'default': 'Informática'
            },
            // Campos de Desincorporación
            'n_informe': 'INF-FY-2024-089',
            'justificacion': 'Daño crítico en tarjeta madre por sobretensión eléctrica',
            // Campos de Mantenimiento
            'ID_solicitud': 'SOL-MANT-2024-012',
            'descrip_falla': 'El equipo presenta parpadeos constantes en la pantalla y se apaga solo',
            'Nro_report': 'REP-TEC-2024-045',
            'estado_operativo': 'FUERA DE SERVICIO / OPERATIVO',
            'tipo_falla': 'HARDWARE (FUENTE DE PODER)',
            'hallazgo': 'Capacitores de la fuente de poder hinchados y con fuga de electrolito',
            'respuesta': 'Se procedió al reemplazo de la fuente de poder por una nueva de 500W y se realizaron pruebas de estabilidad'
        };

        inputs.forEach(input => {
            // Saltamos botones y campos ocultos
            if (input.type === 'submit' || input.type === 'button') return;

            let val = input.value.trim();
            
            // Lógica especial para radios
            if (input.type === 'radio') {
                const checked = form.closest('main').querySelector(`input[name="${input.name}"]:checked`);
                val = checked ? checked.value : '';
            }

            const label = input.parentNode.querySelector('label') || input.closest('td')?.querySelector('label') || input.closest('tr')?.querySelector('label');
            const fieldName = label ? label.innerText.replace('*', '').trim() : 'Este campo';
            
            // Buscamos el ejemplo en nuestro diccionario (por ID o por Name) o usamos el placeholder como respaldo
            let example = fieldExamples[input.id] || fieldExamples[input.name] || input.getAttribute('placeholder') || 'rellenar';
            
            // Si el ejemplo es un objeto, buscamos por el nombre del campo (para IDs compartidos como comp-nombre)
            if (typeof example === 'object') {
                example = example[fieldName] || example['default'];
            }

            // Determinamos si el campo debe mostrar ejemplo (solo para texto y textarea)
            const noExampleTypes = ['date', 'radio', 'checkbox'];
            const isSelect = input.tagName === 'SELECT';
            
            // Excepción: no mostrar ejemplos en nombres y apellidos de personas
            // Detectamos si el campo es exactamente "Nombre" o "Apellido" (típico de empleados)
            const isPersonField = fieldName === 'Nombre' || fieldName === 'Apellido';

            const shouldShowExample = !noExampleTypes.includes(input.type) && !isSelect && !isPersonField;

            // Validación genérica de campos obligatorios
            if (!val) {
                const errorMsg = shouldShowExample 
                    ? `El campo "${fieldName}" es obligatorio. (Ej: ${example})`
                    : `El campo "${fieldName}" es obligatorio.`;
                
                toggleError(input, false, errorMsg);
                isAllValid = false;
            } else {
                // Validaciones específicas
                if (input.id === 'inst-rif' && !isValidRIF(val)) {
                    toggleError(input, false, `Formato de RIF inválido. Debe ser como el ejemplo: J-00000000-0`);
                    isAllValid = false;
                } else {
                    toggleError(input, true);
                }
            }
        });

        if (!isAllValid) {
            const firstError = form.closest('main').querySelector('.input-error');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isAllValid;
    };

    /**
     * Inicializa las máscaras y auto-formatos
     */
    function initMasks() {
        const rifInput = document.getElementById('inst-rif');
        if (rifInput) {
            rifInput.addEventListener('input', function(e) {
                let value = e.target.value.toUpperCase();
                let firstChar = 'J';
                const validLetters = ['V', 'G', 'J', 'P', 'E', 'C'];
                if (value.length > 0 && validLetters.includes(value[0])) firstChar = value[0];
                let digits = value.replace(/[^0-9]/g, '').substring(0, 9);
                let formatted = firstChar + '-';
                if (digits.length > 0) {
                    if (digits.length <= 8) formatted += digits;
                    else formatted += digits.substring(0, 8) + '-' + digits.substring(8);
                }
                e.target.value = formatted;
            });
            rifInput.addEventListener('focus', function(e) {
                if (e.target.value === '') e.target.value = 'J-';
            });
        }

        // Auto-formato para fechas (opcional, pero ayuda)
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(dateInput => {
            if (!dateInput.value) {
                // Podríamos poner la fecha de hoy por defecto si quisiéramos
                // dateInput.valueAsDate = new Date();
            }
        });
    }

    initMasks();
    console.log('Sistema de validaciones inteligente activado.');
})();
