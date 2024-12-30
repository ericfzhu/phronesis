'use client';

import { IconCopy, IconDownload } from '@tabler/icons-react';
import { useCallback, useRef, useState } from 'react';

const codeFileExtensions = [
	'js',
	'jsx',
	'ts',
	'tsx',
	'json',
	'py',
	'java',
	'c',
	'cpp',
	'html',
	'css',
	'scss',
	'md',
	'txt',
	'sh',
	'yml',
	'yaml',
	'xml',
	'go',
	'rs',
	'rb',
	'php',
	'kt',
];

export default function CodeAggregatorComponent() {
	const [isProcessing, setIsProcessing] = useState(false);
	const [aggregatedContent, setAggregatedContent] = useState('');
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const handleFolderSelect = useCallback(async () => {
		if (!(window as any).showDirectoryPicker) {
			alert('Your browser does not support the File System Access API. Please use a compatible browser like Chrome or Edge.');
			return;
		}
		try {
			const directoryHandle = await (window as any).showDirectoryPicker();
			setIsProcessing(true);
			const content = await processFiles(directoryHandle);
			setAggregatedContent(content);
		} catch (error) {
			console.error('Error accessing files:', error);
			alert('An error occurred while accessing the files.');
		} finally {
			setIsProcessing(false);
		}
	}, []);

	const isCodeFile = (fileName: string) => {
		const parts = fileName.split('.');
		if (parts.length < 2) return false;
		const extension = parts.pop()?.toLowerCase();
		return extension && codeFileExtensions.includes(extension);
	};

	const processFiles = async (dirHandle: FileSystemDirectoryHandle, path: string = '', accumulatedContent: string = ''): Promise<string> => {
		try {
			for await (const [name, handle] of (dirHandle as any).entries()) {
				const fullPath = `${path}/${name}`;
				if (handle.kind === 'file') {
					if (isCodeFile(name)) {
						try {
							const fileData = await handle.getFile();
							const text = await fileData.text();
							accumulatedContent += `// File: ${fullPath}\n\n${text}\n\n`;
						} catch (fileError) {
							console.error('Error reading file:', name, fileError);
						}
					}
				} else if (handle.kind === 'directory') {
					accumulatedContent = await processFiles(handle as FileSystemDirectoryHandle, fullPath, accumulatedContent);
				}
			}
		} catch (error) {
			console.error('Error reading directory:', dirHandle.name, error);
		}
		return accumulatedContent;
	};

	const handleCopy = useCallback(() => {
		if (aggregatedContent) {
			navigator.clipboard.writeText(aggregatedContent).then(() => {
				// alert('Content copied to clipboard.');
			});
		}
	}, [aggregatedContent]);

	const handleDownload = useCallback(() => {
		if (aggregatedContent) {
			const blob = new Blob([aggregatedContent], { type: 'text/plain' });
			const link = document.createElement('a');
			link.download = 'aggregated-code.txt';
			link.href = URL.createObjectURL(blob);
			link.click();
		}
	}, [aggregatedContent]);

	return (
		<div className="flex flex-col gap-4 w-full max-w-3xl mx-auto p-4">
			<div className="border-2 border-dashed p-4 text-center border-zinc-300">
				<button onClick={handleFolderSelect} className="bg-zinc-200 hover:bg-zinc-300 py-2 px-4">
					Select Folder
				</button>
				<p className="mt-2 text-sm text-zinc-600">Select a folder to aggregate code files</p>
			</div>

			{isProcessing && <div className="text-center text-zinc-600">Processing files...</div>}

			{aggregatedContent && (
				<div className="flex flex-col gap-2">
					<textarea ref={textAreaRef} value={aggregatedContent} readOnly className="w-full h-96 p-2 border border-zinc-300 rounded-sm" />
					<div className="flex gap-2">
						<button
							onClick={handleCopy}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white p-2 rounded-sm flex items-center justify-center gap-2"
							aria-label="Copy aggregated content">
							<IconCopy size={20} />
							<span>Copy</span>
						</button>
						<button
							onClick={handleDownload}
							className="w-full bg-zinc-500 hover:bg-zinc-700 text-white p-2 rounded-sm flex items-center justify-center gap-2"
							aria-label="Download aggregated content">
							<IconDownload size={20} />
							<span>Download</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
