'use client';

import { IconChevronDown, IconChevronUp, IconCopy, IconDownload, IconPalette, IconX } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

interface Color {
	rgb: string;
	hex: string;
	hsl: string;
}

interface ColorWithPalette extends Color {
	palette: string[];
	showPalette: boolean;
}

export default function ColorPickerComponent() {
	const [image, setImage] = useState<string | null>(null);
	const [selectedColors, setSelectedColors] = useState<ColorWithPalette[]>([]);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith('image/')) {
			processFile(file);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			processFile(file);
		}
	};

	const processFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			setImage(e.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	const rgbToHex = (r: number, g: number, b: number): string => {
		return (
			'#' +
			[r, g, b]
				.map((x) => {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				})
				.join('')
		);
	};

	const hexToRgb = (hex: string): [number, number, number] => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
	};

	const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		let h = 0,
			s,
			l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return [h * 360, s! * 100, l * 100];
	};

	const colorDistance = (color1: [number, number, number], color2: [number, number, number]): number => {
		return Math.sqrt(Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2));
	};

	const getPalette = (imageData: ImageData, colorCount: number = 5, quality: number = 10): [number, number, number][] => {
		const pixels: [number, number, number][] = [];
		for (let i = 0; i < imageData.data.length; i += 4 * quality) {
			pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
		}

		// Initialize centroids randomly
		let centroids: [number, number, number][] = pixels.slice(0, colorCount);

		for (let iteration = 0; iteration < 20; iteration++) {
			// Assign pixels to centroids
			const clusters: [number, number, number][][] = Array.from({ length: colorCount }, () => []);
			for (const pixel of pixels) {
				let nearestCentroidIndex = 0;
				let minDistance = Infinity;
				for (let i = 0; i < centroids.length; i++) {
					const distance = colorDistance(pixel, centroids[i]);
					if (distance < minDistance) {
						minDistance = distance;
						nearestCentroidIndex = i;
					}
				}
				clusters[nearestCentroidIndex].push(pixel);
			}

			// Update centroids
			const newCentroids: [number, number, number][] = centroids.map((_, i) => {
				if (clusters[i].length === 0) return centroids[i];
				const sum = clusters[i].reduce((acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]]);
				return [Math.round(sum[0] / clusters[i].length), Math.round(sum[1] / clusters[i].length), Math.round(sum[2] / clusters[i].length)];
			});

			// Check for convergence
			if (JSON.stringify(newCentroids) === JSON.stringify(centroids)) {
				break;
			}
			centroids = newCentroids;
		}

		return centroids;
	};

	const handleImageClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const imageData = ctx.getImageData(x, y, 1, 1);
		const [r, g, b] = Array.from(imageData.data.slice(0, 3));

		const color: ColorWithPalette = {
			rgb: `rgb(${r}, ${g}, ${b})`,
			hex: rgbToHex(r, g, b),
			hsl: `hsl(${rgbToHsl(r, g, b)
				.map((v, i) => (i === 0 ? Math.round(v) : Math.round(v) + '%'))
				.join(', ')})`,
			palette: [],
			showPalette: false,
		};

		setSelectedColors((prevColors) => [...prevColors, color]);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	const generatePalette = async (index: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const palette = getPalette(imageData, 20);

		const selectedColor = selectedColors[index];
		const selectedRgb = hexToRgb(selectedColor.hex);

		// Sort colors by their distance from the selected color
		const sortedPalette = palette
			.map((color) => ({ color, distance: colorDistance(selectedRgb, color) }))
			.sort((a, b) => a.distance - b.distance);

		// Select 4 colors: closest, farthest, and two in between
		const harmonicPalette = [
			selectedRgb,
			sortedPalette[1].color,
			sortedPalette[Math.floor(sortedPalette.length / 3)].color,
			sortedPalette[Math.floor((2 * sortedPalette.length) / 3)].color,
			sortedPalette[sortedPalette.length - 1].color,
		];

		const hexPalette = harmonicPalette.map((color) => rgbToHex(...color));

		setSelectedColors((prevColors) => prevColors.map((color, i) => (i === index ? { ...color, palette: hexPalette, showPalette: true } : color)));
	};

	const togglePalette = (index: number) => {
		setSelectedColors((prevColors) => prevColors.map((color, i) => (i === index ? { ...color, showPalette: !color.showPalette } : color)));
	};

	useEffect(() => {
		if (image && canvasRef.current) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const img = new Image();
			img.onload = () => {
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
				setImageDimensions({ width: img.width, height: img.height });
			};
			img.src = image;
		}
	}, [image]);

	const downloadImageWithPalette = (palette: string[]) => {
		if (!imageDimensions) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Create a new canvas
		const newCanvas = document.createElement('canvas');
		const newCtx = newCanvas.getContext('2d');
		if (!newCtx) return;

		const squareSize = Math.floor(imageDimensions.width / 5); // Size of each color square
		const paletteHeight = squareSize; // Height of the palette area

		newCanvas.width = imageDimensions.width;
		newCanvas.height = imageDimensions.height + paletteHeight;

		// Draw the original image
		newCtx.drawImage(canvas, 0, 0);

		// Draw the palette
		palette.forEach((color, index) => {
			newCtx.fillStyle = color;
			newCtx.fillRect(index * squareSize, imageDimensions.height, squareSize, squareSize);
		});

		// Create a download link
		const link = document.createElement('a');
		link.download = 'image-with-palette.png';
		link.href = newCanvas.toDataURL('image/png');
		link.click();
	};

	return (
		<div className="flex h-full">
			<div className="w-1/2 p-4 flex flex-col">
				<div
					className={`border-2 border-dashed p-4 text-center mb-4 ${isDragging ? 'border-zinc-500 bg-zinc-100' : 'border-zinc-300'}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}>
					<input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
					<button
						onClick={() => fileInputRef.current?.click()}
						className="bg-zinc-500 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded">
						Select Image
					</button>
					<p className="mt-2 text-sm text-zinc-600">or drag and drop an image here</p>
				</div>
				{image && (
					<>
						<canvas
							ref={canvasRef}
							onClick={handleImageClick}
							className="cursor-crosshair"
							style={{ maxWidth: '100%', height: 'auto' }}
						/>
						<img ref={imageRef} src={image} alt="Uploaded" className="hidden" crossOrigin="anonymous" />
					</>
				)}
			</div>
			<div className="w-1/2 p-4 bg-gray-100 overflow-y-auto">
				{selectedColors.map((color, index) => (
					<div key={index} className="mb-4 bg-white p-4 rounded shadow">
						<div className="flex justify-between items-center mb-2 relative">
							<div className="w-full h-20 rounded" style={{ backgroundColor: color.rgb }}></div>
							<button
								onClick={() => setSelectedColors((colors) => colors.filter((_, i) => i !== index))}
								className="absolute right-2 top-2 p-2 bg-zinc-500 text-white rounded hover:bg-zinc-600 transition-colors"
								aria-label="Remove color">
								<IconX size={16} />
							</button>
						</div>
						<div className="space-y-2">
							{['rgb', 'hex', 'hsl'].map((format) => (
								<button
									key={format}
									className="flex items-center w-full text-left"
									onClick={() => copyToClipboard(color[format as keyof Color])}>
									<span className="w-12 uppercase">{format}:</span>
									<span className="flex-grow">{color[format as keyof Color]}</span>
									<IconCopy size={16} className="text-gray-500" />
								</button>
							))}
						</div>
						<div className="mt-4">
							<button
								onClick={() => (color.palette.length ? togglePalette(index) : generatePalette(index))}
								className="bg-zinc-500 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded flex items-center transition-colors">
								<IconPalette size={20} className="mr-2" />
								{color.palette.length ? (color.showPalette ? 'Hide' : 'Show') : 'Generate'} Palette
								{color.palette.length > 0 &&
									(color.showPalette ? (
										<IconChevronUp size={20} className="ml-2" />
									) : (
										<IconChevronDown size={20} className="ml-2" />
									))}
							</button>
						</div>
						{color.showPalette && (
							<div className="mt-4">
								<h4 className="text-sm font-bold mb-2">Color Palette</h4>
								<div className="flex space-x-2 mb-4">
									{color.palette.map((paletteColor, i) => (
										<button
											key={i}
											className="w-8 h-8 rounded cursor-pointer transition-transform hover:scale-110"
											style={{ backgroundColor: paletteColor }}
											title={`Click to copy: ${paletteColor}`}
											onClick={() => copyToClipboard(paletteColor)}
										/>
									))}
								</div>
								<button
									onClick={() => downloadImageWithPalette(color.palette)}
									className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center transition-colors">
									<IconDownload size={20} className="mr-2" />
									Download Image with Palette
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
