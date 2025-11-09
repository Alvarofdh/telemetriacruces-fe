import { useEffect, useState, useRef } from 'react'

/**
 * Hook para debounce de valores
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos
 * @returns {any} Valor debounced
 */
export const useDebounce = (value, delay = 300) => {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}

/**
 * Hook para debounce de funciones
 * @param {Function} func - Función a debounce
 * @param {number} delay - Delay en milisegundos
 * @returns {Function} Función debounced
 */
export const useDebouncedCallback = (func, delay = 300) => {
	const timeoutRef = useRef(null)

	const debouncedFunc = (...args) => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = setTimeout(() => {
			func(...args)
		}, delay)
	}

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	return debouncedFunc
}

