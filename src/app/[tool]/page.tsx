// src/app/[tool]/page.tsx
import { TOOLS, getToolByPath } from '@/data/tools';
import { notFound } from 'next/navigation';

import ToolLayout from '@/components/ToolLayout';

export const dynamic = 'force-static';

interface Props {
	params: {
		tool: string;
	};
}

export default function ToolPage({ params }: Props) {
	const tool = getToolByPath(params.tool);

	if (!tool) {
		notFound();
	}

	const ToolComponent = tool.component;

	return (
		<ToolLayout title={tool.name}>
			<ToolComponent />
		</ToolLayout>
	);
}

export function generateStaticParams() {
	return TOOLS.map((tool) => ({
		tool: tool.href.replace('/', ''),
	}));
}
