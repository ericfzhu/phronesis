'use client';

import { IconCopy, IconDownload } from '@tabler/icons-react';
import React, { useState } from 'react';

function escapeString(str: string): string {
	return str.replace(/[\\\n\r\t"'\b\f\v\0`\$\{\}<>&\x00-\x1F\u2028\u2029]|[\ud800-\udbff][\udc00-\udfff]/g, (match) => {
		// Handle surrogate pairs (including emojis)
		if (match.length === 2) {
			const codePoint = (match.charCodeAt(0) - 0xd800) * 0x400 + (match.charCodeAt(1) - 0xdc00) + 0x10000;
			return `\\u{${codePoint.toString(16)}}`;
		}

		const escapeChars: { [key: string]: string } = {
			// Basic escapes
			'\\': '\\\\', // Backslash
			'\n': '\\n', // New line
			'\r': '\\r', // Carriage return
			'\t': '\\t', // Tab
			'"': '\\"', // Double quote
			"'": "\\'", // Single quote
			'\b': '\\b', // Backspace
			'\f': '\\f', // Form feed
			'\v': '\\v', // Vertical tab
			'\0': '\\0', // Null character

			// Template literal special characters
			'`': '\\`', // Backtick
			'${': '\\${', // Template literal interpolation

			// Line terminators
			'\u2028': '\\u2028', // Line separator
			'\u2029': '\\u2029', // Paragraph separator

			// HTML/XML special characters
			'<': '&lt;', // Less than
			'>': '&gt;', // Greater than
			'&': '&amp;', // Ampersand
		};

		if (escapeChars[match]) {
			return escapeChars[match];
		}

		// Handle control characters (0x00-0x1F)
		const code = match.charCodeAt(0);
		if (code <= 0x1f) {
			return `\\x${code.toString(16).padStart(2, '0')}`;
		}

		return match;
	});
}

export default function StringEscapeComponent() {
	const [input, setInput] = useState('');
	const [escaped, setEscaped] = useState('');

	function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
		const newInput = e.target.value;
		setInput(newInput);
		setEscaped(escapeString(newInput));
	}

	async function handleCopy() {
		if (escaped) {
			await navigator.clipboard.writeText(escaped);
		}
	}

	function handleDownload() {
		if (escaped) {
			const blob = new Blob([escaped], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'escaped_string.txt';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	}

	return (
		<div className="p-6 space-y-4">
			<div className="flex gap-4">
				<textarea
					className="flex-1 p-4 border border-zinc-300 rounded-sm overflow-auto h-[calc(100vh-30rem)] resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500"
					placeholder="Type or paste your text here..."
					value={input}
					onChange={handleInputChange}
				/>

				<div className="flex-1 relative">
					<textarea
						className="w-full p-4 border border-zinc-300 rounded-sm overflow-auto h-[calc(100vh-30rem)] resize-none bg-zinc-50"
						value={escaped}
						readOnly
					/>

					<div className="absolute bottom-4 right-4 flex space-x-2">
						<button
							onClick={handleCopy}
							className={`p-2 border rounded-sm flex items-center justify-center ${
								escaped ? 'bg-zinc-500 hover:bg-zinc-700 text-white' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
							}`}
							disabled={!escaped}>
							<IconCopy size={16} />
						</button>

						<button
							onClick={handleDownload}
							className={`p-2 border rounded-sm flex items-center justify-center ${
								escaped ? 'bg-zinc-500 hover:bg-zinc-700 text-white' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
							}`}
							disabled={!escaped}>
							<IconDownload size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
