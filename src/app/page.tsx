import { TOOLS } from '@/data/tools';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col px-20 py-12 gap-12">
			<h1 className="uppercase text-xl font-semibold">Toolbox</h1>
			<Image src="icon.jpg" alt="icon" width={400} height={400} className="absolute top-12 right-20 h-10 w-10" />

			<div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
				{TOOLS.map((tool) => (
					<Link key={tool.name} className="group flex flex-col" href={tool.href}>
						<div className="w-full flex items-end mb-4 flex-grow">
							<Image src={tool.preview} alt={tool.name} width={400} height={400} className="w-full h-auto object-contain" />
						</div>
						<p className="text-2xl h-20">
							<span className="font-semibold">{tool.name}</span>{' '}
							<span className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								{tool.description}
							</span>
						</p>
					</Link>
				))}
			</div>
		</main>
	);
}
