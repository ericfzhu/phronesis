'use client';

import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface Position {
	x: number;
	y: number;
}

interface CursorState {
	position: Position;
	path: Position[];
	isPressed: boolean;
	isHovering: boolean;
	hoverText: string;
	isInvertHover: boolean;
}

export default function CustomCursor() {
	const [cursor, setCursor] = useState<CursorState>({
		position: { x: -100, y: -100 },
		path: [],
		isPressed: false,
		isHovering: false,
		hoverText: '',
		isInvertHover: false,
	});

	const TRAIL_1_INDEX = 10;
	const TRAIL_2_INDEX = 20;
	const PATH_LENGTH = 50;

	useEffect(() => {
		let isActive = true;

		const updateCursorPosition = (e: MouseEvent): void => {
			if (!isActive) return;
			const newPosition = { x: e.clientX, y: e.clientY };
			setCursor((prev) => ({
				...prev,
				position: newPosition,
				path: [newPosition, ...prev.path].slice(0, PATH_LENGTH),
			}));
		};

		const handleMouseDown = (): void => {
			if (!isActive) return;
			setCursor((prev) => ({ ...prev, isPressed: true }));
		};

		const handleMouseUp = (): void => {
			if (!isActive) return;
			setCursor((prev) => ({ ...prev, isPressed: false }));
		};

		const handleMouseInteraction = (e: MouseEvent) => {
			if (!isActive) return;

			// Get all elements under the cursor
			const elements = document.elementsFromPoint(e.clientX, e.clientY);

			// Find all windows and icons at the current position
			const windows = elements.filter((el) => el.classList.contains('draggable-window'));
			const icons = elements.filter((el) => el.classList.contains('icon'));

			// Get the topmost window (first in the elements array) if any exists
			const topmostWindow = windows[0];

			// If there's a window present, only look for cursor effects in the topmost window
			if (topmostWindow) {
				// Check if any icons appear before the topmost window
				const firstIconIndex = icons.length ? elements.indexOf(icons[0]) : -1;
				const windowIndex = elements.indexOf(topmostWindow);

				// If there's an icon above the window, process the icon's cursor effects
				if (firstIconIndex !== -1 && firstIconIndex < windowIndex) {
					const icon = icons[0];
					const hoverText = icon.getAttribute('data-cursor-text') || '';
					const isInvertCursor = icon.hasAttribute('data-cursor-invert') || icon.classList.contains('cursor-invert');

					setCursor((prev) => ({
						...prev,
						isHovering: Boolean(hoverText.trim()),
						hoverText: hoverText,
						isInvertHover: isInvertCursor,
					}));
					return;
				}

				// Otherwise, only look for cursor effects within the topmost window
				const targetElement = elements.find((el) => {
					// Check if the element is the window itself or a descendant of the window
					let current = el;
					while (current && current !== document.body) {
						if (current === topmostWindow) {
							return (
								el.hasAttribute('data-cursor-text') || el.hasAttribute('data-cursor-invert') || el.classList.contains('cursor-invert')
							);
						}
						current = current.parentElement!;
					}
					return false;
				});

				if (targetElement) {
					const hoverText = targetElement.getAttribute('data-cursor-text') || '';
					const isInvertCursor = targetElement.hasAttribute('data-cursor-invert') || targetElement.classList.contains('cursor-invert');

					setCursor((prev) => ({
						...prev,
						isHovering: Boolean(hoverText.trim()),
						hoverText: hoverText,
						isInvertHover: isInvertCursor,
					}));
					return;
				}
			} else {
				// No windows present, look for cursor effects on icons or other elements
				const targetElement = elements.find(
					(el) => el.hasAttribute('data-cursor-text') || el.hasAttribute('data-cursor-invert') || el.classList.contains('cursor-invert'),
				);

				if (targetElement) {
					const hoverText = targetElement.getAttribute('data-cursor-text') || '';
					const isInvertCursor = targetElement.hasAttribute('data-cursor-invert') || targetElement.classList.contains('cursor-invert');

					setCursor((prev) => ({
						...prev,
						isHovering: Boolean(hoverText.trim()),
						hoverText: hoverText,
						isInvertHover: isInvertCursor,
					}));
					return;
				}
			}

			// Reset cursor state if no relevant elements found
			setCursor((prev) => ({
				...prev,
				isHovering: false,
				hoverText: '',
				isInvertHover: false,
			}));
		};

		// Set up continuous update for smooth animation
		const forceContinuousUpdate = () => {
			if (!isActive) return;
			setCursor((prev) => ({
				...prev,
				path: [prev.position, ...prev.path].slice(0, PATH_LENGTH),
			}));
			requestAnimationFrame(forceContinuousUpdate);
		};

		// Start continuous updates
		forceContinuousUpdate();

		// Add event listeners
		document.addEventListener('mousemove', updateCursorPosition, { passive: true });
		document.addEventListener('mousemove', handleMouseInteraction, { passive: true });
		document.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			isActive = false;
			document.removeEventListener('mousemove', updateCursorPosition);
			document.removeEventListener('mousemove', handleMouseInteraction);
			document.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, []);

	const getTrailPosition = (index: number): Position => {
		return cursor.path[index] || cursor.position;
	};

	const renderCircle = (position: Position, opacity: number = 1) => (
		<div
			className="fixed pointer-events-none z-50"
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
				transform: 'translate(-50%, -50%)',
				opacity,
				willChange: 'transform, left, top',
				display: cursor.isHovering ? 'none' : 'block',
				mixBlendMode: cursor.isInvertHover ? 'difference' : 'normal',
			}}>
			<div
				className={cn(
					'w-6 h-6 rounded-full border-1 border-black',
					cursor.isPressed ? 'bg-black' : 'bg-transparent',
					cursor.isInvertHover ? 'bg-white border-white' : 'bg-transparent',
				)}
			/>
		</div>
	);

	const trail1Position = getTrailPosition(TRAIL_1_INDEX);
	const trail2Position = getTrailPosition(TRAIL_2_INDEX);

	return (
		<>
			{!cursor.isHovering && !cursor.isPressed && (
				<>
					{renderCircle(trail2Position, 1)}
					{renderCircle(trail1Position, 1)}
				</>
			)}

			<div
				className="fixed pointer-events-none z-50"
				style={{
					left: `${cursor.position.x}px`,
					top: `${cursor.position.y}px`,
					transform: 'translate(-50%, -50%)',
					willChange: 'transform, left, top',
					mixBlendMode: cursor.isInvertHover ? 'difference' : 'normal',
				}}>
				{cursor.isHovering ? (
					<div
						className={cn(
							'origin-center border-1 border-black bg-black rounded-full px-2 h-6 flex items-center justify-center transition-all duration-300 ease-out',
							cursor.isPressed ? 'bg-white scale-90' : 'bg-white scale-100',
						)}>
						<span className={cn('text-sm font-medium whitespace-nowrap transition-colors duration-300 text-black uppercase')}>
							{cursor.hoverText}
						</span>
					</div>
				) : (
					<div
						className={cn(
							'w-6 h-6 rounded-full border-1 border-black transition-all duration-300 ease-out',
							cursor.isInvertHover ? 'bg-white border-white' : 'bg-transparent',
							cursor.isPressed && !cursor.isInvertHover ? 'bg-black border-black' : '',
							cursor.isPressed ? 'scale-90' : 'scale-100',
						)}
					/>
				)}
			</div>
		</>
	);
}
