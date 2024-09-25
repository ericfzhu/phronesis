// app/page.tsx
'use client';

import { IconCopy, IconDownload, IconRefresh, IconUpload } from '@tabler/icons-react';
import { Courier_Prime } from 'next/font/google';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

// app/page.tsx

// app/page.tsx

// app/page.tsx

// app/page.tsx

// app/page.tsx

// app/page.tsx

// app/page.tsx

const courier_prime = Courier_Prime({ subsets: ['latin'], weight: '400' });

const ASCIIArtConverter: React.FC = () => {
	const [image, setImage] = useState<string | null>(null);
	const [asciiArt, setAsciiArt] = useState<string>('');
	const [sharpness, setSharpness] = useState<number>(100);
	const [colorization, setColorization] = useState<number>(100);
	const [blackPoint, setBlackPoint] = useState<number>(15);
	const [whitePoint, setWhitePoint] = useState<number>(85);
	const [fontSize, setFontSize] = useState<number>(12);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const previewRef = useRef<HTMLDivElement>(null);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setImage(e.target?.result as string);
				generateASCIIArt(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const generateASCIIArt = useCallback(
		(imageData: string) => {
			const img = new Image();
			img.onload = () => {
				const canvas = canvasRef.current;
				if (!canvas) return;

				const ctx = canvas.getContext('2d');
				if (!ctx) return;

				const aspectRatio = img.width / img.height;
				const newWidth = Math.min(200, img.width);
				const newHeight = Math.round(newWidth / aspectRatio);

				canvas.width = newWidth;
				canvas.height = newHeight;
				ctx.drawImage(img, 0, 0, newWidth, newHeight);

				const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
				const data = imageData.data;

				const asciiChars = ' .:-=+*#%@';
				const blockChars = '▀▁▂▃▄▅▆▇█';
				const allChars = asciiChars + blockChars;

				const charWidth = 1;
				const charHeight = 2;

				let result = '';
				for (let y = 0; y < newHeight; y += charHeight) {
					for (let x = 0; x < newWidth; x += charWidth) {
						let r = 0,
							g = 0,
							b = 0,
							brightness = 0,
							count = 0;

						for (let dy = 0; dy < charHeight && y + dy < newHeight; dy++) {
							for (let dx = 0; dx < charWidth && x + dx < newWidth; dx++) {
								const idx = ((y + dy) * newWidth + (x + dx)) * 4;
								r += data[idx];
								g += data[idx + 1];
								b += data[idx + 2];
								brightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
								count++;
							}
						}

						r = Math.round(r / count);
						g = Math.round(g / count);
						b = Math.round(b / count);
						brightness = brightness / count;

						const adjusted = Math.max(0, Math.min(255, (brightness - blackPoint * 2.55) / ((whitePoint - blackPoint) * 0.0255)));

						const charIndex = Math.floor((adjusted / 255) * (allChars.length - 1) * (sharpness / 100 + 0.5));
						const char = allChars[charIndex];

						const colorFactor = colorization / 100;
						const colorR = Math.round(r * colorFactor + (1 - colorFactor) * adjusted);
						const colorG = Math.round(g * colorFactor + (1 - colorFactor) * adjusted);
						const colorB = Math.round(b * colorFactor + (1 - colorFactor) * adjusted);

						result += `<span style="color: rgb(${colorR},${colorG},${colorB})">${char}</span>`;
					}
					result += '<br>';
				}

				setAsciiArt(result);
			};
			img.src = imageData;
		},
		[sharpness, colorization, blackPoint, whitePoint],
	);

	const handleRegenerate = () => {
		if (image) {
			generateASCIIArt(image);
		}
	};

	const handleDownload = () => {
		if (!previewRef.current) return;

		const element = previewRef.current;
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) return;

		const scale = 2;
		canvas.width = element.offsetWidth * scale;
		canvas.height = element.offsetHeight * scale;
		context.scale(scale, scale);

		context.fillStyle = 'white';
		context.fillRect(0, 0, canvas.width, canvas.height);

		const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${element.offsetWidth}" height="${element.offsetHeight}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: '${courier_prime.className}'; font-size: ${fontSize}px; line-height: 1;">
          ${asciiArt}
        </div>
      </foreignObject>
    </svg>`;

		const img = new Image();
		img.onload = () => {
			context.drawImage(img, 0, 0);
			canvas.toBlob((blob) => {
				if (blob) {
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.download = 'ascii_art.png';
					link.href = url;
					link.click();
					URL.revokeObjectURL(url);
				}
			});
		};
		img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
	};

	const handleCopy = () => {
		const textAsciiArt = asciiArt.replace(/<[^>]*>/g, '');
		navigator.clipboard.writeText(textAsciiArt);
	};

	useEffect(() => {
		const fitTextToContainer = () => {
			if (!previewRef.current) return;
			const container = previewRef.current;
			const containerWidth = container.offsetWidth;
			const containerHeight = container.offsetHeight;

			let low = 1;
			let high = 100;
			let bestFit = 12;

			while (low <= high) {
				const mid = Math.floor((low + high) / 2);
				container.style.fontSize = `${mid}px`;

				if (container.scrollWidth <= containerWidth && container.scrollHeight <= containerHeight) {
					bestFit = mid;
					low = mid + 1;
				} else {
					high = mid - 1;
				}
			}

			setFontSize(bestFit);
			container.style.fontSize = `${bestFit}px`;
		};

		fitTextToContainer();
		window.addEventListener('resize', fitTextToContainer);

		return () => window.removeEventListener('resize', fitTextToContainer);
	}, [asciiArt]);

	return (
		<div className={`container mx-auto p-4 ${courier_prime.className}`}>
			<h1 className="text-2xl font-bold mb-4">ASCII Art Converter</h1>

			<div className="mb-4">
				<label className="block mb-2">
					<IconUpload className="inline mr-2" />
					Upload Image
				</label>
				<input
					type="file"
					onChange={handleImageUpload}
					accept="image/*"
					className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
        "
				/>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-4">
				<div>
					<label className="block mb-2">Sharpness</label>
					<input
						type="range"
						min="0"
						max="100"
						value={sharpness}
						onChange={(e) => setSharpness(Number(e.target.value))}
						className="w-full"
					/>
				</div>
				<div>
					<label className="block mb-2">Colorization</label>
					<input
						type="range"
						min="0"
						max="100"
						value={colorization}
						onChange={(e) => setColorization(Number(e.target.value))}
						className="w-full"
					/>
				</div>
			</div>

			<div className="mb-4">
				<label className="block mb-2">Black and White Points</label>
				<input
					type="range"
					min="0"
					max="100"
					value={blackPoint}
					onChange={(e) => setBlackPoint(Number(e.target.value))}
					className="w-full mb-2"
				/>
				<input type="range" min="0" max="100" value={whitePoint} onChange={(e) => setWhitePoint(Number(e.target.value))} className="w-full" />
			</div>

			<div className="flex space-x-2 mb-4">
				<button onClick={handleRegenerate} className="bg-blue-500 text-white px-4 py-2 rounded">
					<IconRefresh className="inline mr-2" />
					Regenerate
				</button>
				<button onClick={handleDownload} className="bg-green-500 text-white px-4 py-2 rounded">
					<IconDownload className="inline mr-2" />
					Download PNG
				</button>
				<button onClick={handleCopy} className="bg-yellow-500 text-white px-4 py-2 rounded">
					<IconCopy className="inline mr-2" />
					Copy Text
				</button>
			</div>

			<div
				ref={previewRef}
				className={cn('border p-4 h-96 overflow-hidden text-xs whitespace-pre bg-white', courier_prime.className)}
				dangerouslySetInnerHTML={{ __html: asciiArt }}
				style={{ lineHeight: 1 }}></div>

			<canvas ref={canvasRef} className="hidden" />
		</div>
	);
};

export default ASCIIArtConverter;
