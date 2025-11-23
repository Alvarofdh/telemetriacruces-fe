import { useMemo } from 'react'

/**
 * Hook para calcular estadísticas del sistema
 * @param {Array} cruces - Lista de cruces
 * @param {Array} usuarios - Lista de usuarios
 * @param {Object} configuracion - Configuración del sistema
 * @returns {Object} Estadísticas calculadas
 */
export const useStats = (cruces = [], usuarios = [], configuracion = {}) => {
	return useMemo(() => {
		const umbralBateriaBaja = configuracion.umbral_bateria_baja || 50
		
		return {
			// Estadísticas de cruces
			totalCruces: cruces.length,
			activos: cruces.filter(c => c.estado === 'ACTIVO').length,
			mantenimiento: cruces.filter(c => c.estado === 'MANTENIMIENTO').length,
			inactivos: cruces.filter(c => c.estado === 'INACTIVO').length,
			alertasBateria: cruces.filter(c => c.bateria < umbralBateriaBaja).length,
			promedioBateria: cruces.length > 0 
				? Math.round(cruces.reduce((acc, c) => acc + (c.bateria || 0), 0) / cruces.length) 
				: 0,
			sensoresTotal: cruces.reduce((acc, c) => acc + (c.sensoresActivos || 0), 0),
			
			// Estadísticas de usuarios
			totalUsuarios: usuarios.length,
			usuariosActivos: usuarios.filter(u => u.estado === 'ACTIVO' || u.is_active).length,
		}
	}, [cruces, usuarios, configuracion])
}


