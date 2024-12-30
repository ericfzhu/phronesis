'use client';

import { IconDownload } from '@tabler/icons-react';
import Image from 'next/image';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

interface ImageDimensions {
	width: number;
	height: number;
}

interface CanvasContextProps extends CanvasRenderingContext2D {
	getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
	putImageData(imagedata: ImageData, dx: number, dy: number): void;
}

type DownloadType = 'txt' | 'jpg-bw' | 'jpg-color' | 'webp-bw' | 'webp-color';

interface AsciiChar {
	char: string;
	color: {
		r: number;
		g: number;
		b: number;
	};
}

export default function AsciiArtComponent() {
	const [originalImage, setOriginalImage] = useState<string | null>(null);
	const [asciiData, setAsciiData] = useState<AsciiChar[][]>([]);
	const [comparePosition, setComparePosition] = useState<number>(50);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [fontSize, setFontSize] = useState<number>(12);
	const [maxFontSize, setMaxFontSize] = useState<number>(24);
	const [charsPerRow, setCharsPerRow] = useState<number>(0);
	const [charsPerColumn, setCharsPerColumn] = useState<number>(0);
	const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [isColor, setIsColor] = useState<boolean>(true);

	const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const compareContainerRef = useRef<HTMLDivElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	// Grayscale ramp
	const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
	const rampLength = grayRamp.length;

	// Convert RGB to grayscale
	const toGrayScale = useCallback((r: number, g: number, b: number): number => 0.21 * r + 0.72 * g + 0.07 * b, []);

	// Get character dimensions using canvas
	const getCharacterDimensions = useCallback((): {
		charWidth: number;
		charHeight: number;
	} => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return { charWidth: fontSize / 2, charHeight: fontSize };
		}
		ctx.font = `${fontSize}px monospace`;
		const metrics = ctx.measureText('X');
		const charWidth = metrics.width || fontSize / 2; // Ensure non-zero
		const charHeight = fontSize; // Approximate line height
		return { charWidth, charHeight };
	}, [fontSize]);

	// Map grayscale to corresponding character
	const getCharacterForGrayScale = useCallback((grayScale: number): string => grayRamp[Math.ceil(((rampLength - 1) * grayScale) / 255)], []);

	// Handle image upload via file input
	const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			processFile(file);
		}
	}, []);

	// Process the uploaded file
	const processFile = useCallback((file: File) => {
		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				const result = e.target?.result;
				if (typeof result === 'string') {
					const img = new window.Image();
					img.onload = () => {
						setImageDimensions({ width: img.width, height: img.height });
						setOriginalImage(result);

						// Set maxFontSize to 15% of image width
						const newMaxFontSize = Math.max(10, Math.floor(img.width * 0.15));
						setMaxFontSize(newMaxFontSize);

						// Reset fontSize if it exceeds new max
						setFontSize((prevFontSize) => (prevFontSize > newMaxFontSize ? newMaxFontSize : prevFontSize));
					};
					img.src = result;
				}
			};
			reader.readAsDataURL(file);
		}
	}, []);

	// Handle drag over event
	const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(true);
	}, []);

	// Handle drag leave event
	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Handle drop event
	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			setIsDragging(false);
			const file = event.dataTransfer.files[0];
			if (file) {
				processFile(file);
			}
		},
		[processFile],
	);

	// Handle slider drag for comparison
	const handleSliderDrag = useCallback(() => {
		setIsDragging(true); // To indicate dragging has started
	}, []);

	// Handle mouse move and mouse up events for slider
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging || !compareContainerRef.current) return;

			const containerRect = compareContainerRef.current.getBoundingClientRect();
			const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
			setComparePosition(Math.min(Math.max(newPosition, 0), 100));
		};

		const handleMouseUp = () => {
			if (isDragging) setIsDragging(false);
		};

		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging]);

	// Generate ASCII art based on current settings
	const generateAscii = useCallback(() => {
		if (!originalImage || !imageDimensions) return;

		setIsGenerating(true);

		const img = new window.Image();
		img.onload = () => {
			const { width: imgWidth, height: imgHeight } = imageDimensions;

			const { charWidth, charHeight } = getCharacterDimensions();

			// Calculate number of characters per row and column
			const charsPerRow = Math.max(1, Math.floor(imgWidth / charWidth));
			const charsPerColumn = Math.max(1, Math.floor(imgHeight / charHeight));

			const hiddenCanvas = hiddenCanvasRef.current;
			if (!hiddenCanvas) return;
			const ctx = hiddenCanvas.getContext('2d') as CanvasContextProps | null;
			if (!ctx) return;

			// Set hidden canvas size to charsPerRow x charsPerColumn
			hiddenCanvas.width = charsPerRow;
			hiddenCanvas.height = charsPerColumn;

			// Draw the image scaled to hidden canvas size
			ctx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
			ctx.drawImage(img, 0, 0, charsPerRow, charsPerColumn);

			const imageData = ctx.getImageData(0, 0, charsPerRow, charsPerColumn).data;

			const asciiGrid: AsciiChar[][] = [];

			for (let y = 0; y < charsPerColumn; y++) {
				const row: AsciiChar[] = [];
				for (let x = 0; x < charsPerRow; x++) {
					const idx = (y * charsPerRow + x) * 4;
					const r = imageData[idx];
					const g = imageData[idx + 1];
					const b = imageData[idx + 2];

					const gray = toGrayScale(r, g, b);
					const char = getCharacterForGrayScale(gray);
					row.push({ char, color: { r, g, b } });
				}
				asciiGrid.push(row);
			}

			setAsciiData(asciiGrid);
			setCharsPerRow(charsPerRow);
			setCharsPerColumn(charsPerColumn);
			setIsGenerating(false);
		};
		img.src = originalImage;
	}, [originalImage, imageDimensions, getCharacterDimensions, toGrayScale, getCharacterForGrayScale]);

	// Render ASCII data onto the display canvas
	const renderAsciiToCanvas = useCallback(() => {
		const displayCanvas = displayCanvasRef.current;
		const container = compareContainerRef.current;
		if (!displayCanvas || asciiData.length === 0 || !imageDimensions || !container) return;

		const ctx = displayCanvas.getContext('2d');
		if (!ctx) return;

		// Get the actual displayed size of the container
		const containerRect = container.getBoundingClientRect();

		// Set canvas dimensions to match container size
		displayCanvas.width = containerRect.width;
		displayCanvas.height = containerRect.height;

		ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

		// Calculate the scale factor to maintain aspect ratio
		const scale = Math.min(containerRect.width / imageDimensions.width, containerRect.height / imageDimensions.height);

		// Calculate the actual displayed dimensions
		const displayWidth = imageDimensions.width * scale;
		const displayHeight = imageDimensions.height * scale;

		// Center the content
		const offsetX = (containerRect.width - displayWidth) / 2;
		const offsetY = (containerRect.height - displayHeight) / 2;

		// Calculate scaled character dimensions
		const charWidth = displayWidth / charsPerRow;
		const charHeight = displayHeight / charsPerColumn;

		// Set font size based on scaled dimensions
		ctx.font = `${charHeight}px monospace`;
		ctx.textBaseline = 'top';

		// Draw the ASCII art with proper scaling and centering
		for (let y = 0; y < asciiData.length; y++) {
			for (let x = 0; x < asciiData[y].length; x++) {
				const { char, color } = asciiData[y][x];
				if (isColor) {
					ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
				} else {
					const gray = toGrayScale(color.r, color.g, color.b);
					ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
				}
				ctx.fillText(char, offsetX + x * charWidth, offsetY + y * charHeight);
			}
		}
	}, [asciiData, imageDimensions, charsPerRow, charsPerColumn, isColor, toGrayScale]);

	// Call renderAsciiToCanvas whenever asciiData or color mode changes
	useEffect(() => {
		renderAsciiToCanvas();
	}, [asciiData, renderAsciiToCanvas, isColor]);

	useEffect(() => {
		const container = compareContainerRef.current;
		if (!container) return;

		const observer = new ResizeObserver(() => {
			renderAsciiToCanvas();
		});

		observer.observe(container);

		return () => {
			observer.disconnect();
		};
	}, [renderAsciiToCanvas]);

	// Handle download of ASCII art
	const handleDownload = useCallback(
		(type: DownloadType) => {
			if (type === 'txt') {
				// Download as TXT
				const ascii = asciiData.map((row) => row.map((cell) => cell.char).join('')).join('\n');
				const blob = new Blob([ascii], { type: 'text/plain' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = 'ascii-art.txt';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
				return;
			}

			// For image downloads
			const colored = type.includes('color');
			const canvas = createAsciiImage(colored);
			if (!canvas) return;

			const format = type.startsWith('webp') ? 'image/webp' : 'image/jpeg';
			canvas.toBlob(
				(blob) => {
					if (!blob) return;
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = `ascii-art.${type.startsWith('webp') ? 'webp' : 'jpg'}`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);
				},
				format,
				0.95,
			);
		},
		[asciiData],
	);

	// Create ASCII image canvas for downloads
	const createAsciiImage = useCallback(
		(colored: boolean = false) => {
			if (asciiData.length === 0 || !imageDimensions) return null;

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return null;

			// Set canvas size to match original image
			canvas.width = imageDimensions.width;
			canvas.height = imageDimensions.height;

			// Background
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Calculate scaled character dimensions
			const charWidth = imageDimensions.width / charsPerRow;
			const charHeight = imageDimensions.height / charsPerColumn;

			ctx.font = `${charHeight}px monospace`;
			ctx.textBaseline = 'top';

			asciiData.forEach((row, y) => {
				row.forEach(({ char, color }, x) => {
					if (colored) {
						ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
					} else {
						const gray = toGrayScale(color.r, color.g, color.b);
						ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
					}
					ctx.fillText(char, x * charWidth, y * charHeight);
				});
			});

			return canvas;
		},
		[asciiData, charsPerRow, charsPerColumn, imageDimensions, toGrayScale],
	);

	// Automatically generate ASCII art when image dimensions or font size change
	useEffect(() => {
		if (originalImage && imageDimensions) {
			generateAscii();
		}
	}, [originalImage, imageDimensions, fontSize, generateAscii]);

	// Handle font size change
	const handleFontSizeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const newFontSize = Number(e.target.value);
		setFontSize(newFontSize);
	}, []);

	return (
		<div className="flex flex-col md:flex-row gap-4">
			{/* Sidebar for controls */}
			<div className="w-full md:w-64 space-y-4">
				{/* Image Upload Area */}
				<div
					className={`border-2 border-dashed p-4 text-center ${isDragging ? 'border-zinc-500 bg-zinc-100' : 'border-zinc-300'}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}>
					<input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
					<button onClick={() => fileInputRef.current?.click()} className="bg-zinc-200 hover:bg-zinc-300 py-2 px-4">
						Select Image
					</button>
					<p className="mt-2 text-sm text-zinc-600">or drag and drop an image here</p>
				</div>

				{/* Font Size Slider */}
				{imageDimensions && (
					<div className="space-y-2">
						<label htmlFor="fontSize" className="block">
							Font Size: {fontSize}px
						</label>
						<input
							type="range"
							id="fontSize"
							value={fontSize}
							onChange={handleFontSizeChange}
							min="10"
							max={maxFontSize}
							className="w-full accent-zinc-500"
						/>
					</div>
				)}

				{/* Generate Button */}
				{originalImage && (
					<div className="space-y-2">
						<button
							onClick={generateAscii}
							disabled={isGenerating}
							className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50">
							{isGenerating ? 'Generating...' : 'Generate ASCII Art'}
						</button>
					</div>
				)}

				{/* Color Mode Toggle */}
				{asciiData.length > 0 && (
					<div className="flex space-x-2 mt-4">
						<button
							onClick={() => setIsColor(true)}
							className={`flex-1 ${isColor ? 'bg-blue-500' : 'bg-zinc-500'} hover:bg-blue-700 text-white font-bold p-2 rounded-sm`}>
							Color
						</button>
						<button
							onClick={() => setIsColor(false)}
							className={`flex-1 ${!isColor ? 'bg-blue-500' : 'bg-zinc-500'} hover:bg-blue-700 text-white font-bold p-2 rounded-sm`}>
							B&W
						</button>
					</div>
				)}

				{/* Download Buttons */}
				{asciiData.length > 0 && (
					<div className="space-y-2">
						<button
							onClick={() => handleDownload('txt')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>TXT</span>
						</button>
						<button
							onClick={() => handleDownload('jpg-bw')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>JPG (B&W)</span>
						</button>
						<button
							onClick={() => handleDownload('jpg-color')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>JPG (Color)</span>
						</button>
						<button
							onClick={() => handleDownload('webp-bw')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>WebP (B&W)</span>
						</button>
						<button
							onClick={() => handleDownload('webp-color')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>WebP (Color)</span>
						</button>
					</div>
				)}
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col items-center">
				{/* Placeholder when no image is uploaded */}
				{!originalImage ? (
					<div className="flex-1 flex items-center justify-center">
						<div className="border-2 border-dashed border-zinc-300 rounded-sm w-[70vw] h-[70vh] flex items-center justify-center text-zinc-500">
							Upload an image to get started
						</div>
					</div>
				) : (
					originalImage &&
					imageDimensions && (
						<div
							className="relative"
							ref={compareContainerRef}
							style={{
								width: imageDimensions.width >= imageDimensions.height ? '70vw' : 'auto',
								height: imageDimensions.height > imageDimensions.width ? '70vw' : 'auto',
								maxWidth: '100%',
								maxHeight: '70vh',
								aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
							}}>
							{/* Original Image */}
							<Image
								src={originalImage}
								alt="Original"
								className="absolute top-0 left-0 select-none pointer-events-none object-contain"
								style={{
									clipPath: `inset(0 ${100 - comparePosition}% 0 0)`,
								}}
								fill
								sizes="50vw"
							/>

							{/* ASCII Art Canvas */}
							<canvas
								ref={displayCanvasRef}
								className="absolute top-0 left-0 select-none pointer-events-none object-contain"
								style={{
									clipPath: `inset(0 0 0 ${comparePosition}%)`,
								}}
							/>

							{/* Slider Handle */}
							<div
								style={{
									position: 'absolute',
									top: 0,
									left: `${comparePosition}%`,
									width: '4px',
									height: '100%',
									backgroundColor: 'rgba(255, 255, 255, 0.8)',
									cursor: 'ew-resize',
									zIndex: 10,
								}}
								onMouseDown={handleSliderDrag}
							/>
						</div>
					)
				)}

				{/* Hidden Canvas for Processing */}
				<canvas ref={hiddenCanvasRef} className="hidden" />
			</div>
		</div>
	);
}
