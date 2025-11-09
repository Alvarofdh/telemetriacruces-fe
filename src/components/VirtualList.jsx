import React, { useState, useRef, memo } from 'react'

/**
 * Componente de lista virtual para renderizar eficientemente listas largas
 * Solo renderiza los elementos visibles en el viewport
 */
function VirtualListComponent({ 
	items, 
	renderItem, 
	itemHeight = 100, 
	containerHeight = 600,
	overscan = 3 
}) {
	const [scrollTop, setScrollTop] = useState(0)
	const containerRef = useRef(null)

	// Calcular qué elementos son visibles
	const visibleRange = React.useMemo(() => {
		const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
		const endIndex = Math.min(
			items.length - 1,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
		)
		return { startIndex, endIndex }
	}, [scrollTop, itemHeight, containerHeight, items.length, overscan])

	// Manejar scroll
	const handleScroll = (e) => {
		setScrollTop(e.target.scrollTop)
	}

	// Altura total del contenedor
	const totalHeight = items.length * itemHeight

	// Elementos visibles
	const visibleItems = items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)

	return (
		<div
			ref={containerRef}
			onScroll={handleScroll}
			style={{
				height: containerHeight,
				overflow: 'auto',
				position: 'relative'
			}}
		>
			<div style={{ height: totalHeight, position: 'relative' }}>
				{visibleItems.map((item, index) => {
					const actualIndex = visibleRange.startIndex + index
					return (
						<div
							key={item.id || actualIndex}
							style={{
								position: 'absolute',
								top: actualIndex * itemHeight,
								left: 0,
								right: 0,
								height: itemHeight
							}}
						>
							{renderItem(item, actualIndex)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export const VirtualList = memo(VirtualListComponent)

