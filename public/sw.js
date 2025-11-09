// Service Worker para PWA
const CACHE_NAME = 'viametrica-v1'
const urlsToCache = [
	'/',
	'/index.html',
	'/manifest.json',
	'/vite.svg'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('Cache abierto')
				return cache.addAll(urlsToCache)
			})
	)
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						console.log('Eliminando cache antiguo:', cacheName)
						return caches.delete(cacheName)
					}
				})
			)
		})
	)
})

// Intercepción de peticiones
self.addEventListener('fetch', (event) => {
	// Solo cachear peticiones GET
	if (event.request.method !== 'GET') {
		return
	}

	// No cachear peticiones a la API
	if (event.request.url.includes('/api/')) {
		return
	}

	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				// Cache hit - devolver respuesta del cache
				if (response) {
					return response
				}

				// Cache miss - hacer fetch y cachear
				return fetch(event.request).then((response) => {
					// Verificar que la respuesta es válida
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response
					}

					// Clonar la respuesta
					const responseToCache = response.clone()

					caches.open(CACHE_NAME)
						.then((cache) => {
							cache.put(event.request, responseToCache)
						})

					return response
				})
			})
	)
})

