'use client';

import { Plus, Table, X } from 'lucide-react';
import React, { useState } from 'react';

interface Item {
	id: number;
	name: string;
	tags: string[];
}

interface Position {
	row: number;
	col: number;
}

interface TagGroup {
	tag: string;
	items: Item[];
	position?: Position;
}

const ItemGrouping = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [tableData, setTableData] = useState<(Item | null)[][]>([]);
	const [rows, setRows] = useState(7);
	const [cols, setCols] = useState(7);
	const [error, setError] = useState<string>('');

	// Handle JSON file upload
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = JSON.parse(e.target.result as string);
				if (!Array.isArray(content)) {
					throw new Error('File must contain an array of items');
				}

				// Validate each item has required structure
				const validItems = content.every(
					(item) =>
						typeof item === 'object' &&
						typeof item.name === 'string' &&
						Array.isArray(item.tags) &&
						item.tags.every((tag) => typeof tag === 'string'),
				);

				if (!validItems) {
					throw new Error('Invalid item format. Each item must have a name (string) and tags (array of strings)');
				}

				// Add IDs to items
				const itemsWithIds = content.map((item) => ({
					...item,
					id: Date.now() + Math.random(),
				}));

				setItems(itemsWithIds);
				setError('');
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Error parsing JSON');
			}
		};
		reader.onerror = () => {
			setError('Error reading file');
		};
		reader.readAsText(file);
	};

	// Add new item
	const addItem = () => {
		setItems([...items, { id: Date.now(), name: 'New Item', tags: [] }]);
	};

	// Update item name
	const updateItemName = (id: number, newName: string) => {
		setItems(items.map((item) => (item.id === id ? { ...item, name: newName } : item)));
	};

	// Add tag to item
	const addTag = (itemId: number) => {
		setItems(items.map((item) => (item.id === itemId ? { ...item, tags: [...item.tags, ''] } : item)));
	};

	// Update tag
	const updateTag = (itemId: number, tagIndex: number, value: string) => {
		setItems(
			items.map((item) =>
				item.id === itemId
					? {
							...item,
							tags: item.tags.map((tag, i) => (i === tagIndex ? value : tag)),
						}
					: item,
			),
		);
	};

	// Remove tag
	const removeTag = (itemId: number, tagIndex: number) => {
		setItems(
			items.map((item) =>
				item.id === itemId
					? {
							...item,
							tags: item.tags.filter((_, i) => i !== tagIndex),
						}
					: item,
			),
		);
	};

	// Remove item
	const removeItem = (id: number) => {
		setItems(items.filter((item) => item.id !== id));
	};

	// Generate table layout
	const generateTable = () => {
		// Create empty grid
		const grid = Array(rows)
			.fill(null)
			.map(() => Array(cols).fill(null));

		// Get unique tags and create tag groups
		const allTags = Array.from(new Set(items.flatMap((item) => item.tags)));

		// Prioritize main categories
		const mainCategories = ['sneaker', 'dad', 'leather', 'canvas'];
		const sortedTags = [...mainCategories.filter((tag) => allTags.includes(tag)), ...allTags.filter((tag) => !mainCategories.includes(tag))];

		const tagGroups: TagGroup[] = sortedTags.map((tag) => ({
			tag,
			items: items.filter((item) => item.tags.includes(tag)),
		}));

		// Sort tag groups by size (larger groups first)
		tagGroups.sort((a, b) => {
			// Prioritize main categories
			const aMain = mainCategories.includes(a.tag);
			const bMain = mainCategories.includes(b.tag);
			if (aMain && !bMain) return -1;
			if (!aMain && bMain) return 1;
			// Then sort by size
			return b.items.length - a.items.length;
		});

		// Helper to check if position is valid and empty
		const isValidAndEmpty = (pos: Position): boolean => {
			return pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols && grid[pos.row][pos.col] === null;
		};

		// Helper to get center position
		const getCenterPosition = (): Position => ({
			row: Math.floor(rows / 2),
			col: Math.floor(cols / 2),
		});

		// Place first group in the center
		let currentPos = getCenterPosition();
		const placeItem = (item: Item, pos: Position) => {
			if (isValidAndEmpty(pos)) {
				grid[pos.row][pos.col] = item;
				return true;
			}
			return false;
		};

		// Function to get available positions around a point
		const getAdjacentPositions = (pos: Position): Position[] => {
			return [
				{ row: pos.row - 1, col: pos.col }, // up
				{ row: pos.row + 1, col: pos.col }, // down
				{ row: pos.row, col: pos.col - 1 }, // left
				{ row: pos.row, col: pos.col + 1 }, // right
			].filter(isValidAndEmpty);
		};

		// Prioritize placement by tag groups
		const placedItems = new Set<number>();

		// Helper to find next empty position in spiral pattern from center
		const getNextEmptyPosition = (startPos: Position): Position | null => {
			const visited = new Set<string>();
			const queue: Position[] = [startPos];
			visited.add(`${startPos.row},${startPos.col}`);

			while (queue.length > 0) {
				const pos = queue.shift()!;
				if (isValidAndEmpty(pos)) {
					return pos;
				}

				// Add adjacent positions in spiral pattern
				const directions = [
					{ row: -1, col: 0 }, // up
					{ row: 0, col: 1 }, // right
					{ row: 1, col: 0 }, // down
					{ row: 0, col: -1 }, // left
				];

				for (const dir of directions) {
					const newPos = {
						row: pos.row + dir.row,
						col: pos.col + dir.col,
					};
					const key = `${newPos.row},${newPos.col}`;
					if (!visited.has(key) && newPos.row >= 0 && newPos.row < rows && newPos.col >= 0 && newPos.col < cols) {
						visited.add(key);
						queue.push(newPos);
					}
				}
			}
			return null;
		};

		// First place items with multiple main category tags
		items.forEach((item) => {
			const mainCategoryTags = item.tags.filter((tag) => mainCategories.includes(tag));
			if (mainCategoryTags.length > 1) {
				const pos = getNextEmptyPosition(currentPos);
				if (pos && placeItem(item, pos)) {
					placedItems.add(item.id);
				}
			}
		});

		// Then place remaining items by tag groups
		for (const group of tagGroups) {
			const groupItems = group.items.filter((item) => !placedItems.has(item.id));
			let lastPlacedPos = currentPos;

			for (const item of groupItems) {
				// Try to place near items with same tag
				let placed = false;
				for (let r = 0; r < rows && !placed; r++) {
					for (let c = 0; c < cols && !placed; c++) {
						if (grid[r][c] && grid[r][c]?.tags.includes(group.tag)) {
							const adjacent = getAdjacentPositions({ row: r, col: c });
							if (adjacent.length > 0) {
								placed = placeItem(item, adjacent[0]);
								if (placed) {
									lastPlacedPos = adjacent[0];
									placedItems.add(item.id);
								}
							}
						}
					}
				}

				// If not placed, find next available position
				if (!placed) {
					const pos = getNextEmptyPosition(lastPlacedPos);
					if (pos && placeItem(item, pos)) {
						lastPlacedPos = pos;
						placedItems.add(item.id);
					}
				}
			}
		}

		// Place any remaining unplaced items
		const remainingItems = items.filter((item) => !placedItems.has(item.id));
		for (const item of remainingItems) {
			const pos = getNextEmptyPosition(currentPos);
			if (pos) {
				placeItem(item, pos);
			}
		}

		setTableData(grid);
	};

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<div className="mb-6 space-y-4">
				{/* File Upload */}
				<div>
					<label className="block mb-2">
						<span className="text-gray-700">Upload JSON File</span>
						<input
							type="file"
							accept=".json"
							onChange={handleFileUpload}
							className="block w-full text-sm text-gray-500 mt-1
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
						/>
					</label>
					{error && <div className="text-red-500 text-sm mt-1">{error}</div>}
				</div>

				<div className="flex items-center gap-4">
					<button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						<Plus size={16} />
						Add Item
					</button>
				</div>
			</div>

			{/* Item List */}
			<div className="space-y-4 mb-6 grid grid-cols-6 gap-2">
				{items.map((item) => (
					<div key={item.id} className="p-4 border rounded">
						<div className="flex items-center gap-4 mb-4">
							<input
								type="text"
								value={item.name}
								onChange={(e) => updateItemName(item.id, e.target.value)}
								className="px-2 py-1 border rounded"
							/>
							<button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600">
								<X size={16} />
							</button>
						</div>

						<div className="space-y-2">
							{item.tags.map((tag, index) => (
								<div key={index} className="flex items-center gap-2">
									<input
										type="text"
										value={tag}
										onChange={(e) => updateTag(item.id, index, e.target.value)}
										placeholder="Tag"
										className="px-2 py-1 border rounded"
									/>
									<button onClick={() => removeTag(item.id, index)} className="text-red-500 hover:text-red-600">
										<X size={16} />
									</button>
								</div>
							))}
							<button
								onClick={() => addTag(item.id)}
								className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
								<Plus size={14} />
								Add Tag
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Table Size Controls */}
			<div className="flex items-center gap-4 mb-4">
				<div>
					<label className="block text-sm mb-1">Rows:</label>
					<input
						type="number"
						value={rows}
						onChange={(e) => setRows(Math.max(1, parseInt(e.target.value)))}
						className="px-2 py-1 border rounded w-20"
						min="1"
					/>
				</div>
				<div>
					<label className="block text-sm mb-1">Columns:</label>
					<input
						type="number"
						value={cols}
						onChange={(e) => setCols(Math.max(1, parseInt(e.target.value)))}
						className="px-2 py-1 border rounded w-20"
						min="1"
					/>
				</div>
			</div>

			{/* Generate Button */}
			<button onClick={generateTable} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4">
				<Table size={16} />
				Generate Table
			</button>

			{/* Generated Table */}
			{tableData.length > 0 && (
				<div className="overflow-x-auto">
					<table className="border-collapse">
						<tbody>
							{tableData.map((row, i) => (
								<tr key={i}>
									{row.map((cell, j) => (
										<td key={j} className="border p-4 min-w-32">
											{cell ? (
												<div>
													<div className="font-medium">{cell.name}</div>
													<div className="text-sm text-gray-500">{cell.tags.filter(Boolean).join(', ')}</div>
												</div>
											) : null}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default ItemGrouping;
