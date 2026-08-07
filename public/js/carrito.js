// Lógica del Carrito de Compras (Client-Side)

// Inicializar el carrito desde LocalStorage
let carrito = JSON.parse(localStorage.getItem('grifos_carrito')) || [];

// Actualizar el contador en el icono del header
function actualizarBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Agregar producto al carrito
function agregarAlCarrito(id, nombre, precio, imagen_url) {
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: parseFloat(precio),
            imagen_url: imagen_url,
            cantidad: 1
        });
    }
    
    // Guardar en memoria local
    localStorage.setItem('grifos_carrito', JSON.stringify(carrito));
    
    // Actualizar UI
    actualizarBadge();
    
    // Pequeña alerta visual
    mostrarAlerta(`¡${nombre} añadido al carrito!`);
}

// Función para mostrar notificación toast (muy básica)
function mostrarAlerta(mensaje) {
    const alertDiv = document.createElement('div');
    alertDiv.textContent = mensaje;
    alertDiv.style.position = 'fixed';
    alertDiv.style.bottom = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.backgroundColor = '#198754';
    alertDiv.style.color = 'white';
    alertDiv.style.padding = '10px 20px';
    alertDiv.style.borderRadius = '5px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.transition = 'opacity 0.5s';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 500);
    }, 2000);
}

// Renderizar la página del carrito si estamos en ella
function renderizarPaginaCarrito() {
    const contenedorCarrito = document.getElementById('carrito-items');
    const totalElement = document.getElementById('carrito-total');
    
    if (!contenedorCarrito || !totalElement) return; // No estamos en la pagina del carrito
    
    contenedorCarrito.innerHTML = '';
    let total = 0;
    
    const formateador = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = '<div style="text-align: center; padding: 3rem;"><div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div><h3>Tu carrito está vacío</h3><p>Parece que aún no has agregado productos.</p><a href="/catalogo" class="btn btn-primary mt-3">Ir al Catálogo</a></div>';
        totalElement.textContent = formateador.format(0);
        return;
    }
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        // Si no hay imagen, usar un SVG limpio en lugar de imágenes aleatorias de internet
        const svgPlaceholder = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f1f3f5%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2230%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%F0%9F%93%B8%3C%2Ftext%3E%3C%2Fsvg%3E";
        const imgSrc = (item.imagen_url && item.imagen_url.trim() !== '') ? item.imagen_url : svgPlaceholder;
        
        contenedorCarrito.innerHTML += `
            <div class="cart-item-card animate-fade-in-up" style="animation-delay: ${index * 50}ms">
                <img src="${imgSrc}" alt="${item.nombre}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.nombre}</h4>
                    <p class="cart-item-price">${formateador.format(item.precio)}</p>
                </div>
                <div class="cart-controls">
                    <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-color); padding: 0.2rem; border-radius: 20px;">
                        <button class="qty-btn" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span style="font-weight: 600; width: 25px; text-align: center;">${item.cantidad}</span>
                        <button class="qty-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                    <div style="font-weight: 700; width: 120px; text-align: right; color: var(--text-primary);">
                        ${formateador.format(subtotal)}
                    </div>
                    <button class="btn btn-sm btn-outline btn-danger" style="border-radius: 50%; width: 35px; height: 35px; padding: 0; display: flex; align-items: center; justify-content: center;" onclick="eliminarItem(${index})" title="Eliminar">🗑️</button>
                </div>
            </div>
        `;
    });
    
    totalElement.textContent = formateador.format(total);
}

// Funciones para la página del carrito
function cambiarCantidad(index, delta) {
    if (carrito[index]) {
        carrito[index].cantidad += delta;
        if (carrito[index].cantidad <= 0) {
            eliminarItem(index);
        } else {
            guardarYActualizar();
        }
    }
}

function eliminarItem(index) {
    carrito.splice(index, 1);
    guardarYActualizar();
}

function vaciarCarrito() {
    carrito = [];
    guardarYActualizar();
}

function guardarYActualizar() {
    localStorage.setItem('grifos_carrito', JSON.stringify(carrito));
    actualizarBadge();
    renderizarPaginaCarrito();
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarBadge();
    renderizarPaginaCarrito();
});
