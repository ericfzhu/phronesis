'use client';

import { IconCopy, IconDownload } from '@tabler/icons-react';
import React, { useState } from 'react';

function escapeString(str: string): string {
	return str.replace(/[\\\n\r\t"]/g, (match) => {
		const escapeChars: { [key: string]: string } = {
			'\\': '\\\\',
			'\n': '\\n',
			'\r': '\\r',
			'\t': '\\t',
			'"': '\\"',
		};
		return escapeChars[match] || match;
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

	function copyToClipboard() {
		navigator.clipboard
			.writeText(escaped)
			.then(() => {
				alert('Copied to clipboard!');
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
			});
	}

	function downloadEscaped() {
		const element = document.createElement('a');
		const file = new Blob([escaped], { type: 'text/plain' });
		element.href = URL.createObjectURL(file);
		element.download = 'escaped_string.txt';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	return (
		<div className="flex space-x-4">
			<div className="flex-1">
				<textarea
					className="w-full p-2 resize-none h-[80vh]"
					placeholder="Type or paste your text here..."
					value={input}
					onChange={handleInputChange}
				/>
			</div>
			<div className="flex-1 flex flex-col">
				<textarea className="w-full flex-grow p-2 resize-none h-[80vh]" value={escaped} readOnly />
				<div className="flex justify-end space-x-2 mt-2">
					<button onClick={copyToClipboard} className="p-1 hover:bg-gray-200 rounded">
						<IconCopy size={20} />
					</button>
					<button onClick={downloadEscaped} className="p-1 hover:bg-gray-200 rounded">
						<IconDownload size={20} />
					</button>
				</div>
			</div>
		</div>
	);
}
