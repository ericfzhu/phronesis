import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
	return (
		<Link href="/" className="uppercase text-xl font-semibold w-fit flex gap-2 items-center">
			<Image src="icon.jpg" alt="icon" width={400} height={400} className="w-8 h-8" />
			Toolbox
		</Link>
	);
}
