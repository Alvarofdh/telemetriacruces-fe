import { useEffect, useRef, useState } from 'react'

/**
 * Hook para detectar cuando un elemento es visible en el viewport
 * Útil para lazy loading y animaciones
 */
export const useIntersectionObserver = (options = {}) => {
	const [isIntersecting, setIsIntersecting] = useState(false)
	const [hasIntersected, setHasIntersected] = useState(false)
	const targetRef = useRef(null)

	useEffect(() => {
		const target = targetRef.current
		if (!target) return

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsIntersecting(entry.isIntersecting)
				if (entry.isIntersecting && !hasIntersected) {
					setHasIntersected(true)
				}
			},
			{
				threshold: 0.1,
				rootMargin: '50px',
				...options
			}
		)

		observer.observe(target)

		return () => {
			if (target) {
				observer.unobserve(target)
			}
		}
	}, [options, hasIntersected])

	return { targetRef, isIntersecting, hasIntersected }
}

/**
 * Hook para lazy loading de componentes
 */
export const useLazyLoad = () => {
	const { targetRef, hasIntersected } = useIntersectionObserver({
		threshold: 0,
		rootMargin: '200px'
	})

	return { ref: targetRef, shouldLoad: hasIntersected }
}

