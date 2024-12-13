import Header from '@/components/Header';

interface ToolLayoutProps {
	title: string;
	description: string;
	children: React.ReactNode;
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
	return (
		<main className="flex min-h-screen flex-col px-20 py-12 gap-12">
			<Header />
			<div className="mb-4">
				<h1 className="font-semibold text-2xl">{title}</h1>
				<h2 className="text-zinc-500 text-xl">{description}</h2>
			</div>
			{children}
		</main>
	);
}
