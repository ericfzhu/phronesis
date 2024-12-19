import * as tools from '@/components/tools';

export interface Tool {
	name: string;
	href: string;
	preview: string;
	description: string;
	component: React.ComponentType;
}

export const TOOLS: Tool[] = [
	{
		name: 'Dot Patterns',
		href: '/dotpattern',
		preview: 'previews/dotpattern.jpg',
		description: 'Convert an image to a dot pattern',
		component: tools.DotPatternComponent,
	},
	{
		name: 'Lorem Ipsum',
		href: '/loremipsum',
		preview: 'previews/loremipsum.jpg',
		description: 'Generate Lorem Ipsum text',
		component: tools.LoremIpsumComponent,
	},
	{
		name: 'Gaussian Blur',
		href: '/blur',
		preview: 'previews/blur.jpg',
		description: 'Apply a blur effect to an image',
		component: tools.GaussianBlurComponent,
	},
	{
		name: 'Colors & Palettes',
		href: '/colorpalette',
		preview: 'previews/colorpalette.webp',
		description: 'Pick colors and palettes from an image',
		component: tools.ColorPickerComponent,
	},
	{
		name: 'square.jpg',
		href: '/square',
		preview: 'previews/square.jpg',
		description: 'Generate a solid square',
		component: tools.SquareIconComponent,
	},
	{
		name: 'Counter',
		href: '/counter',
		preview: 'previews/counter.jpg',
		description: 'Count words and characters in a text',
		component: tools.WordCounterComponent,
	},
	{
		name: 'Image Converter',
		href: '/converter',
		preview: 'previews/imageconverter.jpg',
		description: 'Change image formats and sizes',
		component: tools.ImageConverterComponent,
	},
	{
		name: 'String Sanitizer',
		href: '/sanitizer',
		preview: 'previews/sanitizer.webp',
		description: 'Escapes string for JavaScript compatibility',
		component: tools.StringEscapeComponent,
	},
	// {
	// 	name: 'ASCII Art',
	// 	href: '/ascii',
	// 	preview: 'previews/ascii.jpg',
	// 	description: 'Convert an image to ASCII art',
	// },
];

export function getToolByPath(path: string): Tool | undefined {
	return TOOLS.find((tool) => tool.href === `/${path}`);
}
