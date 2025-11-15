const CruceDeleteModal = ({ cruce, onConfirm, onCancel }) => {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
				<h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Confirmar Eliminación</h3>
				<p className="mb-4 text-gray-700 dark:text-gray-300">
					¿Estás seguro de que deseas eliminar el cruce <strong className="text-gray-900 dark:text-white">{cruce.nombre}</strong>?
				</p>
				<p className="text-sm text-red-600 dark:text-red-400 mb-4">
					Esta acción no se puede deshacer.
				</p>
				<div className="flex justify-end space-x-3">
					<button
						onClick={onCancel}
						className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
					>
						Cancelar
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
					>
						Eliminar
					</button>
				</div>
			</div>
		</div>
	);
};

export default CruceDeleteModal;

