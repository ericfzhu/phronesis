import Link from 'next/link';

import LoremIpsum from '@/components/LoremIpsum';

export const dynamic = 'force-static';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col px-20 py-12">
			<Link href="/" className="uppercase text-xl font-semibold mb-2">
				Toolbox
			</Link>
			<h1 className="font-semibold text-2xl mb-4">Lorem Ipsum</h1>
			<LoremIpsum />
		</main>
	);
}
