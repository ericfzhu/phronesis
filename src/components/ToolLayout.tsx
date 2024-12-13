import Header from '@/components/Header';

interface ToolLayoutProps {
	title: string;
	children: React.ReactNode;
}

export default function ToolLayout({ title, children }: ToolLayoutProps) {
	return (
		<main className="flex min-h-screen flex-col px-20 py-12 gap-12">
			<Header />
			<h1 className="font-semibold text-2xl mb-4">{title}</h1>
			{children}
		</main>
	);
}
