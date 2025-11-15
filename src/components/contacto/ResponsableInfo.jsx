const ResponsableInfo = ({ cruce }) => {
	if (!cruce.responsable_nombre && !cruce.responsable_telefono && !cruce.responsable_email) {
		return (
			<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center text-gray-500 dark:text-gray-400">
				No hay información de contacto disponible
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
				<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
				Información de Contacto del Responsable
			</h3>

			<div className="space-y-4">
				{cruce.responsable_nombre && (
					<div className="flex items-start">
						<svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
							<p className="font-medium text-gray-900 dark:text-white">{cruce.responsable_nombre}</p>
						</div>
					</div>
				)}

				{cruce.responsable_empresa && (
					<div className="flex items-start">
						<svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Empresa</p>
							<p className="font-medium text-gray-900 dark:text-white">{cruce.responsable_empresa}</p>
						</div>
					</div>
				)}

				{cruce.responsable_telefono && (
					<div className="flex items-start">
						<svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
						</svg>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
							<a href={`tel:${cruce.responsable_telefono}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
								{cruce.responsable_telefono}
							</a>
						</div>
					</div>
				)}

				{cruce.responsable_email && (
					<div className="flex items-start">
						<svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
							<a href={`mailto:${cruce.responsable_email}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
								{cruce.responsable_email}
							</a>
						</div>
					</div>
				)}

				{cruce.responsable_horario && (
					<div className="flex items-start">
						<svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Horario de Atención</p>
							<p className="font-medium text-gray-900 dark:text-white">{cruce.responsable_horario}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ResponsableInfo;

