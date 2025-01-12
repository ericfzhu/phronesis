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
		description: 'Generate Lorem Ipsum',
		component: tools.LoremIpsumComponent,
	},
	{
		name: 'Gaussian Blur',
		href: '/blur',
		preview: 'previews/blur.jpg',
		description: 'Apply a blur effect',
		component: tools.GaussianBlurComponent,
	},
	{
		name: 'Colors & Palettes',
		href: '/colorpalette',
		preview: 'previews/colorpalette.webp',
		description: 'Pick colors and palettes',
		component: tools.ColorPickerComponent,
	},
	{
		name: 'square.jpg',
		href: '/square',
		preview: 'previews/square.jpg',
		description: 'Generate a square',
		component: tools.SquareIconComponent,
	},
	{
		name: 'Counter',
		href: '/counter',
		preview: 'previews/counter.jpg',
		description: 'Count words and characters',
		component: tools.WordCounterComponent,
	},
	{
		name: 'Image Converter',
		href: '/converter',
		preview: 'previews/imageconverter.jpg',
		description: 'Change image format and size',
		component: tools.ImageConverterComponent,
	},
	{
		name: 'String Sanitizer',
		href: '/sanitizer',
		preview: 'previews/sanitizer.webp',
		description: 'Escapes string for compatibility',
		component: tools.StringEscapeComponent,
	},
	{
		name: 'ASCII Art',
		href: '/ascii',
		preview: 'previews/ascii.webp',
		description: 'Convert an image to ASCII',
		component: tools.AsciiArtComponent,
	},
	{
		name: 'Flatpack',
		href: '/flatpack',
		preview: 'previews/flatpack.webp',
		description: 'Convert a folder into a single text file for prompting',
		component: tools.FlatpackComponent,
	},
	{
		name: 'grouping',
		href: '/grouping',
		preview: 'previews/grouping.webp',
		description: 'Group things together based on tag',
		component: tools.ItemGrouping,
	},
];

export function getToolByPath(path: string): Tool | undefined {
	return TOOLS.find((tool) => tool.href === `/${path}`);
}
