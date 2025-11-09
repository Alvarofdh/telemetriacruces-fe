import { useEffect } from 'react'

/**
 * Hook para actualizar meta tags dinámicamente por ruta
 * @param {Object} meta - Objeto con meta tags
 * @param {string} meta.title - Título de la página
 * @param {string} meta.description - Descripción de la página
 * @param {string} meta.keywords - Keywords
 * @param {string} meta.image - URL de imagen para Open Graph
 */
export const useMetaTags = ({ title, description, keywords, image }) => {
	useEffect(() => {
		// Actualizar título
		if (title) {
			document.title = title
		}

		// Actualizar o crear meta description
		let metaDescription = document.querySelector('meta[name="description"]')
		if (!metaDescription) {
			metaDescription = document.createElement('meta')
			metaDescription.setAttribute('name', 'description')
			document.head.appendChild(metaDescription)
		}
		if (description) {
			metaDescription.setAttribute('content', description)
		}

		// Actualizar o crear meta keywords
		if (keywords) {
			let metaKeywords = document.querySelector('meta[name="keywords"]')
			if (!metaKeywords) {
				metaKeywords = document.createElement('meta')
				metaKeywords.setAttribute('name', 'keywords')
				document.head.appendChild(metaKeywords)
			}
			metaKeywords.setAttribute('content', keywords)
		}

		// Actualizar Open Graph tags
		if (title) {
			let ogTitle = document.querySelector('meta[property="og:title"]')
			if (!ogTitle) {
				ogTitle = document.createElement('meta')
				ogTitle.setAttribute('property', 'og:title')
				document.head.appendChild(ogTitle)
			}
			ogTitle.setAttribute('content', title)
		}

		if (description) {
			let ogDescription = document.querySelector('meta[property="og:description"]')
			if (!ogDescription) {
				ogDescription = document.createElement('meta')
				ogDescription.setAttribute('property', 'og:description')
				document.head.appendChild(ogDescription)
			}
			ogDescription.setAttribute('content', description)
		}

		if (image) {
			let ogImage = document.querySelector('meta[property="og:image"]')
			if (!ogImage) {
				ogImage = document.createElement('meta')
				ogImage.setAttribute('property', 'og:image')
				document.head.appendChild(ogImage)
			}
			ogImage.setAttribute('content', image)
		}

		// Cleanup: restaurar título original al desmontar
		return () => {
			document.title = 'Viametrica - Sistema de Monitoreo de Cruces Ferroviarios'
		}
	}, [title, description, keywords, image])
}

