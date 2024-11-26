import { USERS } from '@/data/users';
import { IconBriefcase, IconMail, IconMapPin, IconPhone, IconWorld } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';

import CustomCursor from '@/components/Cursor';
import { courierPrime } from '@/components/Fonts';

export default function UserPage() {
	return (
		<main className={`min-h-screen bg-white ${courierPrime.className}`}>
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				<h1 className="text-3xl font-bold uppercase">Users</h1>
			</div>

			<div className="mx-auto max-w-7xl px-6 py-8">
				<div className="space-y-2">
					{USERS.map((user) => (
						<div key={user.id} className="w-full transform border transition-all duration-300 ease-in-out">
							<div className="p-6">
								<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
									<div className="flex items-center space-x-4">
										<div>
											<h3 className="text-xl font-semibold">{user.name}</h3>
											<p className="text-gray-500">@{user.username}</p>
										</div>
									</div>

									<div className="space-y-2">
										<h4 className="text-sm font-medium uppercase tracking-wider text-gray-500">Contact</h4>
										<div className="flex items-center space-x-3">
											<IconMail className="h-5 w-5 text-gray-500" />
											<Link href={`mailto:${user.email}`} className="cursor-invert  transition-colors hover:text-blue-600">
												{user.email}
											</Link>
										</div>
										<div className="flex items-center space-x-3">
											<IconPhone className="h-5 w-5 text-gray-500" />
											<Link href={`tel:${user.phone}`} className="cursor-invert  transition-colors hover:text-blue-600">
												{user.phone}
											</Link>
										</div>
										<div className="flex items-center space-x-3">
											<IconWorld className="h-5 w-5 text-gray-500" />
											<Link
												href={`https://${user.website}`}
												target="_blank"
												rel="noopener noreferrer"
												className="cursor-invert  transition-colors hover:text-blue-600">
												{user.website}
											</Link>
										</div>
									</div>

									<div className="space-y-2">
										<h4 className="text-sm font-medium uppercase tracking-wider text-gray-500">Location</h4>
										<div className="flex items-start space-x-3">
											<IconMapPin className="mt-1 h-5 w-5 text-gray-500" />
											<Link
												href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
													`${user.address.street} ${user.address.suite} ${user.address.city} ${user.address.zipcode}`,
												)}`}
												target="_blank"
												rel="noopener noreferrer"
												className="cursor-invert  transition-colors hover:text-blue-600">
												<div>
													<p>{user.address.street}</p>
													<p>{user.address.suite}</p>
													<p>
														{user.address.city}, {user.address.zipcode}
													</p>
													<p className="mt-1 text-sm text-gray-500">
														{user.address.geo.lat}, {user.address.geo.lng}
													</p>
												</div>
											</Link>
										</div>
									</div>

									<div className="space-y-2">
										<h4 className="text-sm font-medium uppercase tracking-wider text-gray-500">Company</h4>
										<div className="flex items-start space-x-3">
											<IconBriefcase className="mt-1 h-5 w-5 text-gray-500" />
											<div>
												<p>{user.company.name}</p>
												<p className="text-sm italic text-gray-500">{user.company.catchPhrase}</p>
												<p className="text-sm text-gray-500">{user.company.bs}</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
