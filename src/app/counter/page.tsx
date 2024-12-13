import Header from '@/components/Header';

import WordCounter from '@/app/counter/WordCounter';

export const dynamic = 'force-static';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col px-20 py-12 gap-12">
			<Header />
			<h1 className="font-semibold text-2xl mb-4 ">Counter</h1>
			<WordCounter />
		</main>
	);
}
