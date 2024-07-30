// app/gaussian-blur/page.tsx
'use client';

import { IconAdjustments, IconDownload, IconPhotoUp } from '@tabler/icons-react';
import Image from 'next/image';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

// app/gaussian-blur/page.tsx

// app/gaussian-blur/page.tsx

// app/gaussian-blur/page.tsx

// app/gaussian-blur/page.tsx

// app/gaussian-blur/page.tsx

// app/gaussian-blur/page.tsx

// app/gaussian-blur/page.tsx

interface ImageDimensions {
	width: number;
	height: number;
}

function gaussianBlur(imgData: ImageData, r: number, sigma: number): ImageData {
	const width: number = imgData.width;
	const height: number = imgData.height;
	const data: Uint8ClampedArray = imgData.data;
	const kernelSize: number = 2 * Math.max(1, Math.floor(r)) + 1;
	const kernel: number[][] = Array.from({ length: kernelSize }, () => Array(kernelSize).fill(0));

	// Generate Gaussian kernel
	let sum: number = 0;
	for (let y = 0; y < kernelSize; y++) {
		for (let x = 0; x < kernelSize; x++) {
			const rx = x - (kernelSize - 1) / 2;
			const ry = y - (kernelSize - 1) / 2;
			const value: number = Math.exp(-(rx * rx + ry * ry) / (2 * sigma * sigma));
			kernel[y][x] = value;
			sum += value;
		}
	}

	// Normalize kernel
	for (let y = 0; y < kernelSize; y++) {
		for (let x = 0; x < kernelSize; x++) {
			kernel[y][x] /= sum;
		}
	}

	// Apply convolution
	const result: Uint8ClampedArray = new Uint8ClampedArray(data.length);
	const halfKernel = Math.floor(kernelSize / 2);

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let r = 0,
				g = 0,
				b = 0,
				a = 0;
			for (let ky = 0; ky < kernelSize; ky++) {
				for (let kx = 0; kx < kernelSize; kx++) {
					const ix = Math.min(Math.max(x + kx - halfKernel, 0), width - 1);
					const iy = Math.min(Math.max(y + ky - halfKernel, 0), height - 1);
					const i = (iy * width + ix) * 4;
					const weight = kernel[ky][kx];
					r += data[i] * weight;
					g += data[i + 1] * weight;
					b += data[i + 2] * weight;
					a += data[i + 3] * weight;
				}
			}
			const i = (y * width + x) * 4;
			result[i] = r;
			result[i + 1] = g;
			result[i + 2] = b;
			result[i + 3] = a;
		}
	}

	return new ImageData(result, width, height);
}

export default function GaussianBlurPage(): JSX.Element {
	const [r, setR] = useState<number>(2);
	const [sigma, setSigma] = useState<number>(5);
	const [originalImage, setOriginalImage] = useState<string | null>(null);
	const [blurredImage, setBlurredImage] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [comparePosition, setComparePosition] = useState<number>(50);
	const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const compareContainerRef = useRef<HTMLDivElement>(null);
	const sliderRef = useRef<HTMLDivElement>(null);

	const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
		const file: File | undefined = e.target.files?.[0];
		if (file) {
			const reader: FileReader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>): void => {
				if (typeof e.target?.result === 'string') {
					setOriginalImage(e.target.result);
					const img = new window.Image();
					img.onload = () => {
						setImageDimensions({ width: img.width, height: img.height });
					};
					img.src = e.target.result;
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const applyBlur = useCallback((): void => {
		if (!originalImage) return;

		setIsProcessing(true);
		const img = new window.Image();
		img.onload = (): void => {
			const canvas: HTMLCanvasElement | null = canvasRef.current;
			if (canvas) {
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(img, 0, 0);
					const imageData: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

					try {
						const blurredData: ImageData = gaussianBlur(imageData, r, sigma);
						ctx.putImageData(blurredData, 0, 0);
						setBlurredImage(canvas.toDataURL());
					} catch (error) {
						console.error('Error applying blur:', error);
						// Handle the error, maybe set an error state or show a message to the user
					}
				}
			}
			setIsProcessing(false);
		};
		img.src = originalImage;
	}, [originalImage, r, sigma]);

	useEffect(() => {
		if (originalImage) applyBlur();
	}, [originalImage, applyBlur]);

	const handleSliderChange = (e: ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number>>) => {
		setter(parseFloat(e.target.value));
	};

	const handleSliderRelease = () => {
		applyBlur();
	};

	const handleSliderDrag = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault();
			const container = compareContainerRef.current;
			if (!container) return;

			const startX = e.clientX;
			const startPosition = comparePosition;

			const handleMouseMove = (e: MouseEvent) => {
				const deltaX = e.clientX - startX;
				const deltaPercent = (deltaX / container.offsetWidth) * 100;
				setComparePosition(Math.max(0, Math.min(100, startPosition + deltaPercent)));
			};

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		},
		[comparePosition],
	);

	const handleDownload = () => {
		if (blurredImage) {
			const link = document.createElement('a');
			link.href = blurredImage;
			link.download = 'blurred_image.png';
			link.click();
		}
	};

	return (
		<div className="container mx-auto p-4">
			<div className="space-y-4">
				<input
					type="file"
					accept="image/*"
					onChange={handleImageUpload}
					className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
				/>
				<div className="flex items-center space-x-2">
					<label htmlFor="r">Radius (r): {r.toFixed(1)}</label>
					<input
						type="range"
						id="r"
						value={r}
						onChange={(e) => handleSliderChange(e, setR)}
						onMouseUp={handleSliderRelease}
						onTouchEnd={handleSliderRelease}
						min="0.5"
						max="10"
						step="0.1"
						className="w-full"
					/>
				</div>
				<div className="flex items-center space-x-2">
					<label htmlFor="sigma">Sigma: {sigma.toFixed(1)}</label>
					<input
						type="range"
						id="sigma"
						value={sigma}
						onChange={(e) => handleSliderChange(e, setSigma)}
						onMouseUp={handleSliderRelease}
						onTouchEnd={handleSliderRelease}
						min="0.1"
						max="10"
						step="0.1"
						className="w-full"
					/>
				</div>
				{originalImage && blurredImage && imageDimensions && (
					<div className="flex flex-col items-center space-y-4">
						<div
							className="relative"
							ref={compareContainerRef}
							style={{
								width: `min(50vw, ${imageDimensions.width}px)`,
								height: `min(50vw, ${imageDimensions.height}px)`,
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
							<Image
								src={blurredImage}
								alt="Blurred"
								className="absolute top-0 left-0 select-none pointer-events-none object-contain"
								style={{
									clipPath: `inset(0 0 0 ${comparePosition}%)`,
								}}
								fill
								sizes="50vw"
							/>
							<div
								ref={sliderRef}
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
						<button
							onClick={handleDownload}
							className="bg-zinc-500 hover:bg-zinc-700 text-white font-bold p-2"
							aria-label="Download blurred image">
							<IconDownload size={24} />
						</button>
					</div>
				)}
				<canvas ref={canvasRef} style={{ display: 'none' }} />
			</div>
		</div>
	);
}
