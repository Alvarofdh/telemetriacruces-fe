/**
 * Utilidades para monitorear y mejorar el rendimiento
 */

/**
 * Medir tiempo de ejecución de una función
 */
export const measurePerformance = (name, fn) => {
	return async (...args) => {
		const start = performance.now()
		const result = await fn(...args)
		const end = performance.now()
		
		if (import.meta.env.DEV) {
			console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`)
		}
		
		return result
	}
}

/**
 * Reportar métricas de Web Vitals
 */
export const reportWebVitals = (onPerfEntry) => {
	if (onPerfEntry && onPerfEntry instanceof Function) {
		import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
			getCLS(onPerfEntry)
			getFID(onPerfEntry)
			getFCP(onPerfEntry)
			getLCP(onPerfEntry)
			getTTFB(onPerfEntry)
		}).catch(() => {
			// web-vitals no instalado
		})
	}
}

/**
 * Detectar conexión lenta
 */
export const isSlowConnection = () => {
	if ('connection' in navigator) {
		const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
		return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
	}
	return false
}

/**
 * Optimizar imágenes según la conexión
 */
export const getOptimalImageQuality = () => {
	if (isSlowConnection()) {
		return 'low'
	}
	return 'high'
}

/**
 * Throttle para eventos de scroll/resize
 */
export const throttle = (func, limit) => {
	let inThrottle
	return function(...args) {
		if (!inThrottle) {
			func.apply(this, args)
			inThrottle = true
			setTimeout(() => inThrottle = false, limit)
		}
	}
}

/**
 * Detectar si el usuario prefiere reducir animaciones
 */
export const prefersReducedMotion = () => {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Monitorear uso de memoria (solo Chrome)
 */
export const monitorMemory = () => {
	if (performance.memory) {
		const used = performance.memory.usedJSHeapSize / 1048576
		const total = performance.memory.totalJSHeapSize / 1048576
		const limit = performance.memory.jsHeapSizeLimit / 1048576
		
		if (import.meta.env.DEV) {
			console.log(`💾 Memoria: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB (límite: ${limit.toFixed(2)}MB)`)
		}
		
		return { used, total, limit }
	}
	return null
}

