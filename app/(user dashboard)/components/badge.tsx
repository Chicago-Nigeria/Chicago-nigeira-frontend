"use client";

import { HTMLAttributes } from "react";

type BadgeProps = {
	value: number;
} & HTMLAttributes<HTMLSpanElement>;

export default function Badge({ value, className, ...props }: BadgeProps) {
	
	return (
		<span
			className={`${
				value === 0 ? "hidden" : ""
			} flex items-center justify-center text-[10px] h-5 px-1 rounded-md ml-auto text-white bg-red-500 ${
				className ?? ""
			}`}
			{...props}>
			{value > 99 ? "99+" : value}
		</span>
	);
}
