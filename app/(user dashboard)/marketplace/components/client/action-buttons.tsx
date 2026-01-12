"use client";

import { Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ActionButtons() {
	const [showActions, setShowActions] = useState<boolean>(false);
	const dropdownRef = useRef<HTMLButtonElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// If dropdown is open and click target is not inside the dropdown
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowActions(false);
			}
			// Add event listener
		};
		document.addEventListener("mousedown", handleClickOutside);

		// Cleanup listener when component unmounts
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);
	return (
		<>
			<button className="cursor-pointer w-8 h-8 grid place-items-center border rounded-md border-gray-200"
				ref={dropdownRef}
				onClick={() => setShowActions((prev) => !prev)}
			>
				<Zap className="w-4 h-4 text-gray-600" />
			</button>

			{showActions && (
				<ul className="absolute z-50 -bottom-22 -right-18 bg-white w-30 rounded-md space-y-1 overflow-clip">
					{[
						{
							id: 1,
							actionName: "Action 1",
						},
						{
							id: 2,
							actionName: "Action 2",
						},
						{
							id: 3,
							actionName: "Action 3",
						},
					].map(({ id, actionName }) => (
						<li
							key={id}
							className="pl-4 pr-8 py-2 hover:bg-gray-100 transition-colors duration-300 ease-in-out cursor-pointer"
						>
							{actionName}
						</li>
					))}
				</ul>
			)}
		</>
	);
}
