/**
 * Utilidades para optimización de imágenes
 */

/**
 * Lazy loading de imágenes
 * @param {HTMLImageElement} img - Elemento de imagen
 */
export const lazyLoadImage = (img) => {
	if ('loading' in HTMLImageElement.prototype) {
		// Navegador soporta lazy loading nativo
		img.loading = 'lazy'
	} else {
		// Fallback con Intersection Observer
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const img = entry.target
					img.src = img.dataset.src
					img.classList.remove('lazy')
					observer.unobserve(img)
				}
			})
		})
		observer.observe(img)
	}
}

/**
 * Convertir imagen a WebP si el navegador lo soporta
 * @param {string} src - URL de la imagen
 * @returns {string} URL optimizada
 */
export const getOptimizedImageUrl = (src) => {
	// Verificar soporte de WebP
	const supportsWebP = document.createElement('canvas')
		.toDataURL('image/webp')
		.indexOf('data:image/webp') === 0

	if (supportsWebP && src.match(/\.(jpg|jpeg|png)$/i)) {
		return src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
	}

	return src
}

/**
 * Comprimir imagen antes de subir
 * @param {File} file - Archivo de imagen
 * @param {number} maxWidth - Ancho máximo
 * @param {number} quality - Calidad (0-1)
 * @returns {Promise<Blob>} Imagen comprimida
 */
export const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = (event) => {
			const img = new Image()
			img.src = event.target.result
			img.onload = () => {
				const canvas = document.createElement('canvas')
				let width = img.width
				let height = img.height

				if (width > maxWidth) {
					height = (height * maxWidth) / width
					width = maxWidth
				}

				canvas.width = width
				canvas.height = height

				const ctx = canvas.getContext('2d')
				ctx.drawImage(img, 0, 0, width, height)

				canvas.toBlob(
					(blob) => resolve(blob),
					'image/jpeg',
					quality
				)
			}
			img.onerror = reject
		}
		reader.onerror = reject
	})
}

/**
 * Precargar imágenes críticas
 * @param {string[]} urls - URLs de imágenes
 */
export const preloadImages = (urls) => {
	urls.forEach(url => {
		const link = document.createElement('link')
		link.rel = 'preload'
		link.as = 'image'
		link.href = url
		document.head.appendChild(link)
	})
}

