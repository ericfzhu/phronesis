'use client';

import { IconDownload } from '@tabler/icons-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ImageDimensions {
	width: number;
	height: number;
}

interface CanvasContextProps extends CanvasRenderingContext2D {
	getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
	putImageData(imagedata: ImageData, dx: number, dy: number): void;
}

type DownloadType = 'txt' | 'jpg-bw' | 'jpg-color' | 'webp-bw' | 'webp-color';

export default function AsciiArtComponent() {
	const [originalImage, setOriginalImage] = useState<string | null>(null);
	const [asciiOutput, setAsciiOutput] = useState<string>('');
	const [comparePosition, setComparePosition] = useState<number>(50);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [fontSize, setFontSize] = useState<number>(12);
	const [charsPerRow, setCharsPerRow] = useState<number>(0);
	const [charsPerColumn, setCharsPerColumn] = useState<number>(0);
	const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const asciiCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const compareContainerRef = useRef<HTMLDivElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const preRef = useRef<HTMLPreElement | null>(null);

	const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';

	const toGrayScale = useCallback((r: number, g: number, b: number): number => 0.21 * r + 0.72 * g + 0.07 * b, []);

	const getFontRatio = useCallback((): number => {
		const pre = document.createElement('pre');
		pre.style.display = 'inline';
		pre.textContent = ' ';
		document.body.appendChild(pre);
		const { width, height } = pre.getBoundingClientRect();
		document.body.removeChild(pre);
		return height / width;
	}, []);

	const getCharacterDimensions = useCallback((): { charWidth: number; charHeight: number } => {
		const pre = document.createElement('pre');
		pre.style.fontFamily = 'monospace';
		pre.style.fontSize = `${fontSize}px`;
		pre.style.lineHeight = '1';
		pre.textContent = 'X';
		document.body.appendChild(pre);
		const { width, height } = pre.getBoundingClientRect();
		document.body.removeChild(pre);
		return { charWidth: width, charHeight: height };
	}, [fontSize]);

	const calculateCharsNeeded = useCallback(
		(containerWidth: number, containerHeight: number) => {
			const { charWidth, charHeight } = getCharacterDimensions();
			const chars = Math.floor(containerWidth / charWidth);
			const rows = Math.floor(containerHeight / charHeight);
			return { chars, rows };
		},
		[getCharacterDimensions],
	);

	const getCharacterForGrayScale = useCallback((grayScale: number): string => {
		const rampLength = grayRamp.length;
		return grayRamp[Math.ceil(((rampLength - 1) * grayScale) / 255)];
	}, []);

	const convertToGrayScales = useCallback(
		(context: CanvasContextProps, width: number, height: number): number[] => {
			const imageData = context.getImageData(0, 0, width, height);
			const grayScales: number[] = [];

			for (let i = 0; i < imageData.data.length; i += 4) {
				const r = imageData.data[i];
				const g = imageData.data[i + 1];
				const b = imageData.data[i + 2];

				const grayScale = toGrayScale(r, g, b);
				grayScales.push(grayScale);
			}

			return grayScales;
		},
		[toGrayScale],
	);

	const drawAscii = useCallback(
		(grayScales: number[], width: number): void => {
			const ascii = grayScales.reduce((asciiImage: string, grayScale: number, index: number) => {
				let nextChars = getCharacterForGrayScale(grayScale);
				if ((index + 1) % width === 0) {
					nextChars += '\n';
				}
				return asciiImage + nextChars;
			}, '');

			setAsciiOutput(ascii);
		},
		[getCharacterForGrayScale],
	);

	const createAsciiImage = useCallback(
		(colored: boolean = false) => {
			if (!asciiOutput || !preRef.current) return null;

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return null;

			const { width, height } = preRef.current.getBoundingClientRect();
			canvas.width = width;
			canvas.height = height;

			// Set background
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, width, height);

			// Draw ASCII text
			ctx.font = `${fontSize}px monospace`;
			ctx.fillStyle = colored ? '#333' : 'black';

			const lines = asciiOutput.split('\n');
			const lineHeight = fontSize;

			lines.forEach((line, i) => {
				ctx.fillText(line, 0, (i + 1) * lineHeight);
			});

			return canvas;
		},
		[asciiOutput, fontSize],
	);

	const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			processFile(file);
		}
	}, []);

	const processFile = useCallback((file: File) => {
		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				const result = e.target?.result;
				if (typeof result === 'string') {
					setOriginalImage(result);
				}
			};
			reader.readAsDataURL(file);
		}
	}, []);

	const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

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

	const handleSliderDrag = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const container = compareContainerRef.current;
			if (!container || !imageDimensions) return;

			const containerRect = container.getBoundingClientRect();

			const handleDrag = (e: MouseEvent) => {
				const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
				setComparePosition(Math.min(Math.max(newPosition, 0), 100));
			};

			const handleDragEnd = () => {
				document.removeEventListener('mousemove', handleDrag);
				document.removeEventListener('mouseup', handleDragEnd);
			};

			document.addEventListener('mousemove', handleDrag);
			document.addEventListener('mouseup', handleDragEnd);
		},
		[imageDimensions],
	);

	const handleDownload = useCallback(
		(type: DownloadType) => {
			if (!asciiOutput) return;

			if (type === 'txt') {
				const blob = new Blob([asciiOutput], { type: 'text/plain' });
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

			const canvas = createAsciiImage(type.includes('color'));
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
		[asciiOutput, createAsciiImage],
	);

	useEffect(() => {
		if (originalImage && imageDimensions) {
			const containerWidth = imageDimensions.width >= imageDimensions.height ? window.innerWidth * 0.7 : 'auto';
			const containerHeight = imageDimensions.height > imageDimensions.width ? window.innerWidth * 0.7 : 'auto';

			const { chars, rows } = calculateCharsNeeded(
				typeof containerWidth === 'number' ? containerWidth : imageDimensions.width,
				typeof containerHeight === 'number' ? containerHeight : imageDimensions.height,
			);

			setCharsPerRow(chars);
			setCharsPerColumn(rows);

			const img = new window.Image();
			img.onload = () => {
				const canvas = canvasRef.current;
				if (!canvas) return;

				const ctx = canvas.getContext('2d') as CanvasContextProps | null;
				if (!ctx) return;

				canvas.width = chars;
				canvas.height = rows;

				ctx.drawImage(img, 0, 0, chars, rows);
				const grayScales = convertToGrayScales(ctx, chars, rows);
				drawAscii(grayScales, chars);
			};
			img.src = originalImage;
		}
	}, [originalImage, imageDimensions, fontSize, calculateCharsNeeded, convertToGrayScales, drawAscii]);

	return (
		<div className="flex gap-4">
			<div className="w-64 space-y-4">
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

				<div className="space-y-2">
					<label htmlFor="fontSize" className="block">
						Font Size: {fontSize}px
					</label>
					<input
						type="range"
						id="fontSize"
						value={fontSize}
						onChange={(e) => setFontSize(Number(e.target.value))}
						min="8"
						max="24"
						className="w-full accent-zinc-500"
					/>
				</div>

				<div className="space-y-2">
					{/* <label htmlFor="maxWidth" className="block">
						Max Width: {maxWidth} chars
					</label>
					<input
						type="range"
						id="maxWidth"
						value={maxWidth}
						onChange={(e) => setMaxWidth(Number(e.target.value))}
						min="40"
						max="200"
						className="w-full accent-zinc-500"
					/> */}
				</div>

				{asciiOutput && (
					<div className="space-y-2">
						<button
							onClick={() => handleDownload('txt')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>Download as TXT</span>
						</button>
						<button
							onClick={() => handleDownload('jpg-bw')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>Download as JPG (B&W)</span>
						</button>
						<button
							onClick={() => handleDownload('jpg-color')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>Download as JPG (Color)</span>
						</button>
						<button
							onClick={() => handleDownload('webp-bw')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>Download as WebP (B&W)</span>
						</button>
						<button
							onClick={() => handleDownload('webp-color')}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded-sm flex items-center justify-center gap-2">
							<IconDownload size={20} />
							<span>Download as WebP (Color)</span>
						</button>
					</div>
				)}
			</div>

			{!originalImage ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="border-2 border-dashed border-zinc-300 rounded-sm w-[70vw] h-[70vh] flex items-center justify-center text-zinc-500">
						Upload an image to get started
					</div>
				</div>
			) : (
				originalImage &&
				imageDimensions && (
					<div className="flex-1 flex flex-col items-center">
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
							<pre
								ref={preRef}
								className="absolute top-0 left-0 select-none pointer-events-none font-mono whitespace-pre"
								style={{
									clipPath: `inset(0 0 0 ${comparePosition}%)`,
									fontSize: `${fontSize}px`,
									lineHeight: 1,
								}}>
								{asciiOutput}
							</pre>
							<div
								style={{
									position: 'absolute',
									top: 0,
									left: `${comparePosition}%`,
									width: '4px',
									height: '100%',
									backgroundColor: 'white',
									cursor: 'ew-resize',
								}}
								onMouseDown={handleSliderDrag}
							/>
						</div>
					</div>
				)
			)}
			<canvas ref={canvasRef} className="hidden" />
			<canvas ref={asciiCanvasRef} className="hidden" />
		</div>
	);
}
