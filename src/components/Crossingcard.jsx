// src/components/CrossingCard.jsx
import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';

function CrossingCardComponent({ 
	nombre, 
	estado, 
	bateria, 
	sensores, 
	ubicacion, 
	ultimaActividad, 
	tipoTren, 
	velocidadPromedio,
	id_cruce 
}) {
	const [showDetails, setShowDetails] = useState(false);
	const navigate = useNavigate();

	// Función para obtener estilos del estado
	const getEstadoStyles = (estado) => {
		switch (estado) {
			case 'ACTIVO':
				return {
					badge: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700',
					header: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800',
					indicator: 'bg-green-500',
					icon: 'text-green-600 dark:text-green-400'
				};
			case 'MANTENIMIENTO':
				return {
					badge: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700',
					header: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800',
					indicator: 'bg-yellow-500',
					icon: 'text-yellow-600 dark:text-yellow-400'
				};
			case 'INACTIVO':
				return {
					badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700',
					header: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800',
					indicator: 'bg-red-500',
					icon: 'text-red-600 dark:text-red-400'
				};
			default:
				return {
					badge: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
					header: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 border-gray-200 dark:border-gray-600',
					indicator: 'bg-gray-500',
					icon: 'text-gray-600 dark:text-gray-400'
				};
		}
	};

	// Función para obtener color de la batería
	const getBateriaColor = (nivel) => {
		if (nivel >= 70) return 'text-green-600 dark:text-green-400';
		if (nivel >= 30) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	};

	const getBateriaBarColor = (nivel) => {
		if (nivel >= 70) return 'bg-green-500';
		if (nivel >= 30) return 'bg-yellow-500';
		return 'bg-red-500';
	};

	// Función para obtener icono del estado
	const getEstadoIcon = (estado) => {
		const styles = getEstadoStyles(estado);
		switch (estado) {
			case 'ACTIVO':
				return (
					<svg className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			case 'MANTENIMIENTO':
				return (
					<svg className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				);
			case 'INACTIVO':
				return (
					<svg className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			default:
				return null;
		}
	};

	// Función para formatear fecha
	const formatearFecha = (fecha) => {
		const date = new Date(fecha);
		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Función para navegar a la página de detalle
	const navegarADetalle = () => {
		navigate(`/cruce/${id_cruce}`);
	};

	// Función para manejar el clic en la tarjeta
	const handleCardClick = (e) => {
		// Si el clic es en un botón, no navegar
		if (e.target.closest('button')) {
			return;
		}
		navegarADetalle();
	};

	const estadoStyles = getEstadoStyles(estado);

	return (
		<article 
			className="group bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.02] overflow-hidden cursor-pointer"
			onClick={handleCardClick}
			role="button"
			tabIndex={0}
			aria-label={`Ver detalles de ${nombre}`}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					handleCardClick(e)
				}
			}}
		>
			{/* Header de la tarjeta */}
			<header className={`${estadoStyles.header} px-4 sm:px-5 py-3 sm:py-4 border-b-2`}>
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">
							{nombre}
						</h3>
						<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-tight flex items-center gap-1">
							<svg className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							<span className="truncate">{ubicacion}</span>
						</p>
					</div>
					<div className="flex flex-col items-end gap-1.5 shrink-0">
						{getEstadoIcon(estado)}
						<span className={`px-2.5 py-1 text-xs font-semibold rounded-full border-2 whitespace-nowrap ${estadoStyles.badge}`}>
							{estado}
						</span>
					</div>
				</div>
			</header>

			{/* Contenido principal */}
			<div className="p-4 sm:p-5 space-y-4">
				{/* Información principal en grid */}
				<div className="grid grid-cols-2 gap-4">
					{/* Batería */}
					<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
						<div className="flex items-center gap-2 mb-2">
							<svg className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							<span className="text-xs font-medium text-gray-600 dark:text-gray-400">Batería</span>
						</div>
						<p className={`text-2xl font-bold ${getBateriaColor(bateria)}`}>
							{bateria}%
						</p>
						<div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
							<div 
								className={`h-full rounded-full transition-all duration-500 ${getBateriaBarColor(bateria)}`}
								style={{ width: `${Math.max(bateria, 0)}%` }}
							></div>
						</div>
					</div>

					{/* Sensores */}
					<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
						<div className="flex items-center gap-2 mb-2">
							<svg className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
							<span className="text-xs font-medium text-gray-600 dark:text-gray-400">Sensores</span>
						</div>
						<p className="text-2xl font-bold text-gray-900 dark:text-white">
							{sensores}<span className="text-lg text-gray-500 dark:text-gray-400">/4</span>
						</p>
						<div className="mt-2 flex gap-1">
							{[...Array(4)].map((_, i) => (
								<div 
									key={i} 
									className={`flex-1 h-2 rounded-full ${i < sensores ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Información adicional */}
				{showDetails && (
					<div className="space-y-3 pt-3 border-t-2 border-gray-100 dark:border-gray-700 fade-in">
						<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600 dark:text-gray-400 font-medium">Última actividad:</span>
								<span className="font-semibold text-gray-900 dark:text-white">
									{formatearFecha(ultimaActividad)}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600 dark:text-gray-400 font-medium">Tipo de tren:</span>
								<span className="font-semibold text-gray-900 dark:text-white">{tipoTren}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600 dark:text-gray-400 font-medium">Velocidad promedio:</span>
								<span className="font-semibold text-gray-900 dark:text-white">{velocidadPromedio} km/h</span>
							</div>
						</div>
					</div>
				)}

				{/* Botones de acción */}
				<div className="flex flex-col sm:flex-row gap-2">
					<button
						onClick={(e) => {
							e.stopPropagation();
							setShowDetails(!showDetails);
						}}
						className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{showDetails ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							)}
						</svg>
						{showDetails ? 'Ocultar detalles' : 'Ver más'}
					</button>
					
					<button 
						onClick={(e) => {
							e.stopPropagation();
							navegarADetalle();
						}}
						className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
					>
						<span>Ver detalle completo</span>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</button>
				</div>
			</div>

			{/* Indicador de estado en el borde inferior */}
			<div className={`h-1.5 w-full ${estadoStyles.indicator}`}></div>
		</article>
	);
}

// Memoizar componente para evitar re-renders innecesarios
export const CrossingCard = memo(CrossingCardComponent, (prevProps, nextProps) => {
	// Solo re-renderizar si cambian estas props importantes
	return (
		prevProps.id_cruce === nextProps.id_cruce &&
		prevProps.estado === nextProps.estado &&
		prevProps.bateria === nextProps.bateria &&
		prevProps.sensores === nextProps.sensores &&
		prevProps.ultimaActividad === nextProps.ultimaActividad
	)
})
