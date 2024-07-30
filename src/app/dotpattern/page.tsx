import Link from 'next/link';

import DotPatternConverter from '@/components/DotPatternConverter';

export const dynamic = 'force-static';

// app/page.tsx

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col px-20 py-12">
			<Link href="/" className="uppercase text-xl font-semibold mb-2">
				Toolbox
			</Link>
			<h1 className="text-2xl mb-4">Dot Patterns</h1>
			<DotPatternConverter />
		</main>
	);
}
