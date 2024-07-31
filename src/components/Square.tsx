'use client';

import { IconDownload } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

export default function ColorSquareGenerator() {
	const [color, setColor] = useState('#FF0000');
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const colorInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		generateImage();
	}, [color]);

	const generateImage = () => {
		const canvas = canvasRef.current;
		if (canvas) {
			const ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, 10, 10);
			}
		}
	};

	const downloadImage = () => {
		const canvas = canvasRef.current;
		if (canvas) {
			const dataUrl = canvas.toDataURL('image/jpeg');
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = 'square.jpg';
			link.click();
		}
	};

	const handleSquareClick = () => {
		if (colorInputRef.current) {
			colorInputRef.current.click();
		}
	};

	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setColor(e.target.value);
	};

	const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = e.target.value;
		if (/^#[0-9A-F]{6}$/i.test(newColor)) {
			setColor(newColor);
		}
	};

	return (
		<div className="flex flex-col items-center space-y-4 p-4">
			<div className="relative w-80 h-80 cursor-pointer" onClick={handleSquareClick}>
				<canvas ref={canvasRef} width={10} height={10} className="border border-zinc-300 w-full h-full" />
				<input
					ref={colorInputRef}
					type="color"
					value={color}
					onChange={handleColorChange}
					className="opacity-0 absolute inset-0 w-full h-full"
				/>
			</div>

			<input type="text" value={color} onChange={handleHexChange} className="p-2 border border-zinc-300  text-center uppercase" maxLength={7} />

			<button
				onClick={downloadImage}
				className="flex items-center space-x-2 px-4 py-2 bg-zinc-500 text-white  hover:bg-zinc-600 transition-colors">
				<IconDownload size={18} />
				<span>Download</span>
			</button>
		</div>
	);
}
