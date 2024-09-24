'use client';

import { IconDownload } from '@tabler/icons-react';
import Image from 'next/image';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

export default function ASCIIArtConverter() {
	const [originalImage, setOriginalImage] = useState<string | null>(null);
	const [convertedAscii, setConvertedAscii] = useState<string | null>(null);
	const [width, setWidth] = useState<number>(100);
	const [comparePosition, setComparePosition] = useState<number>(50);
	const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const compareContainerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const asciiRef = useRef<HTMLDivElement>(null);

	const ASCII_CHARS = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.'];

	const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			processFile(file);
		}
	}, []);

	const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
		const file = event.dataTransfer.files[0];
		if (file) {
			processFile(file);
		}
	}, []);

	const handleWidthChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setWidth(Number(event.target.value));
	}, []);

	const convertToAscii = useCallback(() => {
		if (!originalImage || !canvasRef.current) return;

		const img = new window.Image();
		img.onload = () => {
			const canvas = canvasRef.current!;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const aspectRatio = img.height / img.width;
			const height = Math.round(width * aspectRatio);

			canvas.width = width;
			canvas.height = height;
			setImageDimensions({ width: img.width, height: img.height });

			ctx.drawImage(img, 0, 0, width, height);
			const imageData = ctx.getImageData(0, 0, width, height);
			const asciiArt: string[] = [];

			for (let y = 0; y < height; y++) {
				let row = '';
				for (let x = 0; x < width; x++) {
					const pixelIndex = (y * width + x) * 4;
					const r = imageData.data[pixelIndex];
					const g = imageData.data[pixelIndex + 1];
					const b = imageData.data[pixelIndex + 2];
					const brightness = (r + g + b) / 3;
					const charIndex = Math.floor(brightness / 25);
					const char = ASCII_CHARS[charIndex];
					row += `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
				}
				asciiArt.push(row);
			}

			setConvertedAscii(asciiArt.join('<br>'));
		};
		img.src = originalImage;
	}, [originalImage, width]);

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

	const handleDownload = useCallback(() => {
		if (convertedAscii && asciiRef.current) {
			const asciiElement = asciiRef.current;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const scaleFactor = 2; // Increase this for higher resolution
			canvas.width = asciiElement.offsetWidth * scaleFactor;
			canvas.height = asciiElement.offsetHeight * scaleFactor;

			ctx.scale(scaleFactor, scaleFactor);
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${asciiElement.offsetWidth}" height="${asciiElement.offsetHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: monospace; font-size: 5px; line-height: 5px;">
            ${convertedAscii}
          </div>
        </foreignObject>
      </svg>`;

			const img = new window.Image();
			img.onload = () => {
				ctx.drawImage(img, 0, 0);
				canvas.toBlob((blob) => {
					if (blob) {
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = 'ascii-art.png';
						a.click();
						URL.revokeObjectURL(url);
					}
				}, 'image/png');
			};
			img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
		}
	}, [convertedAscii]);

	function processFile(file: File) {
		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setOriginalImage(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	}

	useEffect(() => {
		if (originalImage) {
			convertToAscii();
		}
	}, [originalImage, width, convertToAscii]);

	return (
		<div className="space-y-4">
			<div
				className={`border-2 border-dashed p-4 text-center ${isDragging ? 'border-zinc-500 bg-zinc-100' : 'border-zinc-300'}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}>
				<input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
				<button
					onClick={() => fileInputRef.current?.click()}
					className="bg-zinc-200 hover:bg-zinc-300 transition duration-300 font-bold py-2 px-4 rounded">
					Select Image
				</button>
				<p className="mt-2 text-sm text-zinc-600">or drag and drop an image here</p>
			</div>
			<div className="flex items-center space-x-2">
				<label htmlFor="width" className="text-zinc-700">
					ASCII Width: {width} characters
				</label>
				<input type="range" id="width" value={width} onChange={handleWidthChange} min="20" max="200" className="w-full accent-zinc-500" />
			</div>
			{originalImage && convertedAscii && imageDimensions && (
				<div className="flex flex-col items-center space-y-4">
					<div
						className="relative"
						ref={compareContainerRef}
						style={{
							width: imageDimensions.width >= imageDimensions.height ? '50vw' : 'auto',
							height: imageDimensions.height > imageDimensions.width ? '50vw' : 'auto',
							maxWidth: '100%',
							maxHeight: '50vw',
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
						<div
							ref={asciiRef}
							className="absolute top-0 left-0 select-none pointer-events-none object-contain"
							style={{
								clipPath: `inset(0 0 0 ${comparePosition}%)`,
								fontFamily: 'monospace',
								fontSize: '5px',
								lineHeight: '5px',
								whiteSpace: 'pre',
							}}
							dangerouslySetInnerHTML={{ __html: convertedAscii }}
						/>
						<div
							className="absolute top-0 w-1 h-full bg-white cursor-ew-resize"
							style={{ left: `${comparePosition}%` }}
							onMouseDown={handleSliderDrag}
						/>
					</div>
					<button
						onClick={handleDownload}
						className="bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2 rounded transition duration-300"
						aria-label="Download ASCII art">
						<IconDownload size={24} />
					</button>
				</div>
			)}
			<canvas ref={canvasRef} className="hidden" />
		</div>
	);
}
