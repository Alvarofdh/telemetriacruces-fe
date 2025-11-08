import React, { useState } from 'react'
import { useData } from '../contexts/DataContext'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function ExportData() {
	const { cruces, stats, logs } = useData()
	const [isExporting, setIsExporting] = useState(false)
	const [selectedFormat, setSelectedFormat] = useState('csv')
	const [selectedData, setSelectedData] = useState('cruces')

	// Exportar a CSV
	const exportToCSV = (data, filename) => {
		if (!data || data.length === 0) {
			toast.error('No hay datos para exportar')
			return
		}

		const headers = Object.keys(data[0]).join(',')
		const rows = data.map(row => 
			Object.values(row).map(val => {
				// Escapar comillas y comas en los valores
				if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
					return `"${val.replace(/"/g, '""')}"`
				}
				return val
			}).join(',')
		).join('\n')

		const csv = `${headers}\n${rows}`
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		const url = URL.createObjectURL(blob)
		
		link.setAttribute('href', url)
		link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	// Exportar a JSON
	const exportToJSON = (data, filename) => {
		if (!data) {
			toast.error('No hay datos para exportar')
			return
		}

		const json = JSON.stringify(data, null, 2)
		const blob = new Blob([json], { type: 'application/json' })
		const link = document.createElement('a')
		const url = URL.createObjectURL(blob)
		
		link.setAttribute('href', url)
		link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	// Exportar a PDF
	const exportToPDF = () => {
		const doc = new jsPDF()
		const pageWidth = doc.internal.pageSize.getWidth()
		
		// Título
		doc.setFontSize(20)
		doc.setTextColor(37, 99, 235)
		doc.text('Sistema de Monitoreo de Cruces Ferroviarios', pageWidth / 2, 20, { align: 'center' })
		
		// Fecha del reporte
		doc.setFontSize(10)
		doc.setTextColor(100)
		doc.text(`Reporte generado: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, 28, { align: 'center' })
		
		// Línea separadora
		doc.setDrawColor(200)
		doc.line(20, 32, pageWidth - 20, 32)

		let yPos = 40

		// Sección de Estadísticas Generales
		doc.setFontSize(14)
		doc.setTextColor(0)
		doc.text('📊 Estadísticas Generales', 20, yPos)
		yPos += 10

		const statsData = [
			['Total de Cruces', stats.totalCruces.toString()],
			['Cruces Activos', stats.activos.toString()],
			['En Mantenimiento', stats.mantenimiento.toString()],
			['Cruces Inactivos', stats.inactivos.toString()],
			['Alertas de Batería', stats.alertasBateria.toString()],
			['Promedio de Batería', `${stats.promedioBateria}%`],
			['Total de Sensores', stats.sensoresTotal.toString()]
		]

		doc.autoTable({
			startY: yPos,
			head: [['Métrica', 'Valor']],
			body: statsData,
			theme: 'grid',
			headStyles: { fillColor: [37, 99, 235] },
			margin: { left: 20, right: 20 }
		})

		yPos = doc.lastAutoTable.finalY + 15

		// Sección de Cruces
		if (yPos > 250) {
			doc.addPage()
			yPos = 20
		}

		doc.setFontSize(14)
		doc.text('🚆 Detalle de Cruces', 20, yPos)
		yPos += 5

		const crucesData = cruces.map(cruce => [
			cruce.nombre,
			cruce.estado,
			`${cruce.bateria}%`,
			`${cruce.sensoresActivos}/4`,
			cruce.ubicacion,
			cruce.responsable || 'N/A'
		])

		doc.autoTable({
			startY: yPos + 5,
			head: [['Nombre', 'Estado', 'Batería', 'Sensores', 'Ubicación', 'Responsable']],
			body: crucesData,
			theme: 'striped',
			headStyles: { fillColor: [37, 99, 235] },
			margin: { left: 20, right: 20 },
			styles: { fontSize: 8 },
			columnStyles: {
				0: { cellWidth: 30 },
				1: { cellWidth: 25 },
				2: { cellWidth: 20 },
				3: { cellWidth: 20 },
				4: { cellWidth: 40 },
				5: { cellWidth: 30 }
			}
		})

		yPos = doc.lastAutoTable.finalY + 15

		// Sección de Alertas
		const alertas = cruces.filter(c => 
			c.bateria < 50 || c.estado !== 'ACTIVO' || c.sensoresActivos < 2
		)

		if (alertas.length > 0) {
			if (yPos > 250) {
				doc.addPage()
				yPos = 20
			}

			doc.setFontSize(14)
			doc.setTextColor(220, 38, 38)
			doc.text('⚠️ Alertas Activas', 20, yPos)
			yPos += 5

			const alertasData = alertas.map(cruce => {
				const problemas = []
				if (cruce.bateria < 50) problemas.push(`Batería baja: ${cruce.bateria}%`)
				if (cruce.estado !== 'ACTIVO') problemas.push(`Estado: ${cruce.estado}`)
				if (cruce.sensoresActivos < 2) problemas.push(`Sensores limitados: ${cruce.sensoresActivos}/4`)
				
				return [
					cruce.nombre,
					problemas.join(', ')
				]
			})

			doc.autoTable({
				startY: yPos + 5,
				head: [['Cruce', 'Problemas Detectados']],
				body: alertasData,
				theme: 'grid',
				headStyles: { fillColor: [220, 38, 38] },
				margin: { left: 20, right: 20 },
				styles: { fontSize: 9 }
			})
		}

		// Pie de página
		const pageCount = doc.internal.getNumberOfPages()
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i)
			doc.setFontSize(8)
			doc.setTextColor(150)
			doc.text(
				`Página ${i} de ${pageCount} | Sistema de Cruces Ferroviarios`,
				pageWidth / 2,
				doc.internal.pageSize.getHeight() - 10,
				{ align: 'center' }
			)
		}

		// Guardar PDF
		doc.save(`reporte_cruces_${new Date().toISOString().split('T')[0]}.pdf`)
	}

	// Manejar exportación
	const handleExport = async () => {
		setIsExporting(true)

		try {
			let dataToExport
			let filename

			switch (selectedData) {
				case 'cruces':
					dataToExport = cruces.map(c => ({
						ID: c.id_cruce,
						Nombre: c.nombre,
						Estado: c.estado,
						Batería: `${c.bateria}%`,
						Voltaje: c.voltage || 'N/A',
						Temperatura: c.temperature ? `${c.temperature}°C` : 'N/A',
						'Sensores Activos': c.sensoresActivos,
						Ubicación: c.ubicacion,
						'Última Actividad': c.ultimaActividad,
						Responsable: c.responsable || 'N/A',
						Teléfono: c.telefono || 'N/A'
					}))
					filename = 'cruces'
					break

				case 'stats':
					dataToExport = [{
						'Total Cruces': stats.totalCruces,
						'Activos': stats.activos,
						'Mantenimiento': stats.mantenimiento,
						'Inactivos': stats.inactivos,
						'Alertas Batería': stats.alertasBateria,
						'Promedio Batería': `${stats.promedioBateria}%`,
						'Total Sensores': stats.sensoresTotal
					}]
					filename = 'estadisticas'
					break

				case 'logs':
					dataToExport = logs.map(log => ({
						ID: log.id,
						Fecha: log.fecha,
						Usuario: log.usuario,
						Acción: log.accion,
						Detalle: log.detalle,
						IP: log.ip
					}))
					filename = 'logs'
					break

				case 'alertas':
					dataToExport = cruces
						.filter(c => c.bateria < 50 || c.estado !== 'ACTIVO' || c.sensoresActivos < 2)
						.map(c => ({
							Cruce: c.nombre,
							Estado: c.estado,
							Batería: `${c.bateria}%`,
							Sensores: `${c.sensoresActivos}/4`,
							Ubicación: c.ubicacion,
							Responsable: c.responsable || 'N/A'
						}))
					filename = 'alertas'
					break

				default:
					dataToExport = cruces
					filename = 'datos'
			}

			if (selectedFormat === 'pdf') {
				exportToPDF()
			} else if (selectedFormat === 'csv') {
				exportToCSV(dataToExport, filename)
			} else if (selectedFormat === 'json') {
				exportToJSON(dataToExport, filename)
			}

			toast.success(`✅ Datos exportados correctamente en formato ${selectedFormat.toUpperCase()}`, {
				duration: 3000,
				icon: '📥'
			})
		} catch (error) {
			console.error('Error al exportar:', error)
			toast.error('❌ Error al exportar los datos')
		} finally {
			setIsExporting(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
					📥 Exportación de Datos
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Selección de datos */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
							¿Qué datos deseas exportar?
						</label>
						<div className="space-y-2">
							{[
								{ value: 'cruces', label: '🚆 Información de Cruces', desc: 'Todos los datos de los cruces' },
								{ value: 'stats', label: '📊 Estadísticas Generales', desc: 'Resumen de métricas del sistema' },
								{ value: 'logs', label: '📝 Logs del Sistema', desc: 'Historial de actividades' },
								{ value: 'alertas', label: '⚠️ Alertas Activas', desc: 'Cruces con problemas detectados' }
							].map((option) => (
								<label
									key={option.value}
									className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
										selectedData === option.value
											? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
											: 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
									}`}
								>
									<input
										type="radio"
										name="data"
										value={option.value}
										checked={selectedData === option.value}
										onChange={(e) => setSelectedData(e.target.value)}
										className="mt-1 mr-3"
									/>
									<div>
										<p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
									</div>
								</label>
							))}
						</div>
					</div>

					{/* Selección de formato */}
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
							Formato de exportación
						</label>
						<div className="space-y-2">
							{[
								{ value: 'csv', label: '📄 CSV', desc: 'Excel, Google Sheets' },
								{ value: 'json', label: '🔧 JSON', desc: 'APIs, desarrollo' },
								{ value: 'pdf', label: '📕 PDF', desc: 'Reportes imprimibles' }
							].map((option) => (
								<label
									key={option.value}
									className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
										selectedFormat === option.value
											? 'border-green-500 bg-green-50 dark:bg-green-900/20'
											: 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
									}`}
								>
									<input
										type="radio"
										name="format"
										value={option.value}
										checked={selectedFormat === option.value}
										onChange={(e) => setSelectedFormat(e.target.value)}
										className="mt-1 mr-3"
									/>
									<div>
										<p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
									</div>
								</label>
							))}
						</div>
					</div>
				</div>

				{/* Botón de exportación */}
				<div className="mt-6 flex justify-center">
					<button
						onClick={handleExport}
						disabled={isExporting}
						className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
							isExporting
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-blue-600 hover:bg-blue-700 active:scale-95'
						}`}
					>
						{isExporting ? (
							<span className="flex items-center space-x-2">
								<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span>Exportando...</span>
							</span>
						) : (
							<span className="flex items-center space-x-2">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								<span>Exportar Datos</span>
							</span>
						)}
					</button>
				</div>
			</div>

			{/* Información adicional */}
			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">ℹ️ Información sobre la exportación</h3>
				<ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
					<li>• <strong>CSV:</strong> Ideal para análisis en Excel o Google Sheets</li>
					<li>• <strong>JSON:</strong> Formato estructurado para integración con otras aplicaciones</li>
					<li>• <strong>PDF:</strong> Reporte completo con estadísticas y tablas, listo para imprimir</li>
					<li>• Los archivos incluyen la fecha de generación en el nombre</li>
				</ul>
			</div>

			{/* Estadísticas de exportación */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
					<p className="text-sm text-gray-600 dark:text-gray-400">Cruces disponibles</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">{cruces.length}</p>
				</div>
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
					<p className="text-sm text-gray-600 dark:text-gray-400">Logs registrados</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">{logs.length}</p>
				</div>
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
					<p className="text-sm text-gray-600 dark:text-gray-400">Alertas activas</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">
						{cruces.filter(c => c.bateria < 50 || c.estado !== 'ACTIVO').length}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
					<p className="text-sm text-gray-600 dark:text-gray-400">Formatos disponibles</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
				</div>
			</div>
		</div>
	)
}

