import { TOOLS } from '@/data/tools';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col px-20 py-12 gap-12">
			<h1 className="uppercase text-xl font-semibold">Toolbox</h1>

			<div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
				{TOOLS.map((tool) => (
					<Link key={tool.name} className="group flex flex-col h-full" href={tool.href}>
						<div className="flex-grow flex items-end">
							{' '}
							{/* This div will create space above the image */}
							<div className="w-full">
								<Image src={tool.preview} alt={tool.name} width={400} height={400} className="w-full h-auto object-contain" />
							</div>
						</div>
						<div className="mt-2">
							<p className="text-2xl leading-relaxed">
								<span className="font-semibold">{tool.name}</span>{' '}
								<span className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									{tool.description}
								</span>
							</p>
						</div>
					</Link>
				))}
			</div>
		</main>
	);
}
