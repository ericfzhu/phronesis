'use client';

import { IconPilcrow, IconTextPlus } from '@tabler/icons-react';
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
	const sentenceCount = Math.floor(Math.random() * 10) + 3;
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

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="w-full space-y-4 flex flex-col items-center">
				<div className="flex items-center space-x-2 max-w-lg w-full">
					<input
						type="number"
						value={count}
						onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
						className="p-2 border rounded"
					/>
					<div className="flex space-x-2">
						<label className="flex items-center space-x-2">
							<input type="radio" value="paragraphs" checked={unit === 'paragraphs'} onChange={() => setUnit('paragraphs')} />
							<span>Paragraphs</span>
						</label>
						<label className="flex items-center space-x-2">
							<input type="radio" value="words" checked={unit === 'words'} onChange={() => setUnit('words')} />
							<span>Words</span>
						</label>
					</div>
				</div>
				<button onClick={handleGenerate} className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors max-w-lg">
					Generate
				</button>
				<div className="mt-4 p-4 bg-zinc-100 rounded-md">
					<p className="whitespace-pre-wrap">{output}</p>
				</div>
			</div>
		</div>
	);
}
