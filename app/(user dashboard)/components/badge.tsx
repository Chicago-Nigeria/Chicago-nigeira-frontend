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
			} flex items-center justify-center font-bold text-[10px] h-5 px-2 rounded-full ml-auto text-white bg-red-500 ${
				className ?? ""
			}`}
			{...props}>
			{value > 9 ? "9+" : value}
		</span>
	);
}
