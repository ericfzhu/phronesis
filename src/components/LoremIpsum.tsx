'use client';

import { IconCheck, IconCopy, IconDownload } from '@tabler/icons-react';
import { useState } from 'react';

const words = [
	'lorem',
	'ipsum',
	'dolor',
	'sit',
	'amet',
	'consectetur',
	'adipiscing',
	'elit',
	'sed',
	'do',
	'eiusmod',
	'tempor',
	'incididunt',
	'ut',
	'labore',
	'et',
	'dolore',
	'magna',
	'aliqua',
	'enim',
	'ad',
	'minim',
	'veniam',
	'quis',
	'nostrud',
	'exercitation',
	'ullamco',
	'laboris',
	'nisi',
	'aliquip',
	'ex',
	'ea',
	'commodo',
	'consequat',
	'duis',
	'aute',
	'irure',
	'in',
	'reprehenderit',
	'voluptate',
	'velit',
	'esse',
	'cillum',
	'eu',
	'fugiat',
	'nulla',
	'pariatur',
	'excepteur',
	'sint',
	'occaecat',
	'cupidatat',
	'non',
	'proident',
	'sunt',
	'culpa',
	'qui',
	'officia',
	'deserunt',
	'mollit',
	'anim',
	'id',
	'est',
	'laborum',
];

const generateSentence = () => {
	const length = Math.floor(Math.random() * 10) + 5;
	return capitalize(Array.from({ length }, () => words[Math.floor(Math.random() * words.length)]).join(' ')) + '.';
};

const generateParagraph = () => {
	const sentenceCount = Math.floor(Math.random() * 8) + 4;
	return Array.from({ length: sentenceCount }, generateSentence).join(' ');
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function Home() {
	const [output, setOutput] = useState('');
	const [count, setCount] = useState(1);
	const [unit, setUnit] = useState('paragraphs');

	const handleGenerate = () => {
		if (unit === 'paragraphs') {
			setOutput(Array.from({ length: count }, generateParagraph).join('\n\n'));
		} else {
			const generatedWords = Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]);
			setOutput(capitalize(generatedWords.join(' ')) + '.');
		}
	};

	const [copySuccess, setCopySuccess] = useState(false);

	function handleCopy() {
		navigator.clipboard.writeText(output).then(() => {
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		});
	}

	function handleDownload() {
		const element = document.createElement('a');
		const file = new Blob([output], { type: 'text/plain' });
		element.href = URL.createObjectURL(file);
		element.download = 'loremipsum.txt';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="w-full space-y-4 flex flex-col items-center max-w-3xl">
				<div className="flex items-center space-x-2 max-w-lg w-full">
					<input
						type="number"
						value={count}
						onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
						className="p-2 border rounded"
					/>
					<div className="flex space-x-2">
						<label className="flex items-center space-x-2 accent-zinc-500">
							<input type="radio" value="paragraphs" checked={unit === 'paragraphs'} onChange={() => setUnit('paragraphs')} />
							<span>Paragraphs</span>
						</label>
						<label className="flex items-center space-x-2 accent-zinc-500">
							<input type="radio" value="words" checked={unit === 'words'} onChange={() => setUnit('words')} />
							<span>Words</span>
						</label>
					</div>
				</div>
				<button onClick={handleGenerate} className="w-full p-2 bg-zinc-500 text-white hover:bg-zinc-600 transition-colors max-w-lg">
					Generate
				</button>
				{output && (
					<div className="bg-zinc-100">
						<div className="bg-zinc-300 flex justify-end items-center p-2 gap-2">
							<button
								onClick={handleCopy}
								className=" hover:opacity-50 p-1 transition duration-200"
								title={copySuccess ? 'Copied!' : 'Copy text'}>
								{copySuccess ? <IconCheck size={20} /> : <IconCopy size={20} />}
							</button>
							<button onClick={handleDownload} className=" hover:opacity-50 p-1 transition duration-200" title="Download text">
								<IconDownload size={20} />
							</button>
						</div>
						<p className="whitespace-pre-wrap p-4">{output}</p>
					</div>
				)}
			</div>
		</div>
	);
}
