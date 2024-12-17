'use client';

import { IconDownload } from '@tabler/icons-react';
import React, { useRef, useState } from 'react';

export default function SquareIconComponent() {
	const [color, setColor] = useState('#BF5CFF');
	const [inputValue, setInputValue] = useState('#BF5CFF');
	const colorInputRef = useRef<HTMLInputElement>(null);

	function downloadImage() {
		const canvas = document.createElement('canvas');
		canvas.width = 10;
		canvas.height = 10;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, 10, 10);
			const dataUrl = canvas.toDataURL('image/jpeg');
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = 'square.jpg';
			link.click();
		}
	}

	function handleColorInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newValue = e.target.value;
		setInputValue(newValue);

		// Allow typing in the input field regardless of validity
		const isValidHex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
		const isValidHsl = /^hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)$/;

		// Update color only if it's a valid format
		if (isValidHex.test(newValue)) {
			// Ensure hex color has # prefix
			const formattedColor = newValue.startsWith('#') ? newValue : `#${newValue}`;
			setColor(formattedColor);
		} else if (isValidHsl.test(newValue)) {
			setColor(newValue);
		}
	}

	function handleColorPickerChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newColor = e.target.value;
		setColor(newColor);
		setInputValue(newColor);
	}

	return (
		<div className="flex items-center justify-center mt-20">
			<div className="space-y-6 w-64">
				<div className="space-y-2">
					<input
						type="text"
						value={inputValue}
						onChange={handleColorInputChange}
						className="w-full p-2 border border-zinc-300 rounded-sm"
						placeholder="Enter color (hex, rgb, hsl)"
					/>
				</div>

				<div className="space-y-2">
					<div className="relative w-64 h-64 border border-zinc-200 rounded-sm overflow-hidden">
						<input
							ref={colorInputRef}
							type="color"
							value={color}
							onChange={handleColorPickerChange}
							className="absolute inset-0 w-full h-full cursor-pointer"
						/>
					</div>
				</div>

				<button
					onClick={downloadImage}
					className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2"
					aria-label="Download square icon">
					<IconDownload size={20} />
					<span>Download</span>
				</button>
			</div>
		</div>
	);
}
