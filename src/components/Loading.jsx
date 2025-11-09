import React from 'react'

/**
 * Componente de carga reutilizable
 * @param {Object} props
 * @param {string} [props.message] - Mensaje personalizado
 * @param {string} [props.size] - Tamaño del spinner (sm, md, lg)
 * @param {boolean} [props.fullScreen] - Si debe ocupar toda la pantalla
 */
export function Loading({ message = 'Cargando...', size = 'md', fullScreen = false }) {
	const sizeClasses = {
		sm: 'w-6 h-6 border-2',
		md: 'w-12 h-12 border-4',
		lg: 'w-16 h-16 border-4',
	}

	const spinnerSize = sizeClasses[size] || sizeClasses.md

	if (fullScreen) {
		return (
			<div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
				<div className="text-center">
					<div
						className={`${spinnerSize} border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4`}
					></div>
					<p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center justify-center p-8">
			<div
				className={`${spinnerSize} border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4`}
			></div>
			<p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
		</div>
	)
}

/**
 * Skeleton loader para contenido
 */
export function Skeleton({ className = '', lines = 1 }) {
	return (
		<div className={className}>
			{Array.from({ length: lines }).map((_, index) => (
				<div
					key={index}
					className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"
					style={{
						width: index === lines - 1 ? '75%' : '100%',
					}}
				></div>
			))}
		</div>
	)
}

/**
 * Skeleton para tarjetas
 */
export function CardSkeleton() {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
			<div className="flex items-center justify-between mb-4">
				<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
				<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
			</div>
			<div className="space-y-3">
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
			</div>
		</div>
	)
}

