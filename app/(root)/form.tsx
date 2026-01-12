"use client";
import { div } from "framer-motion/client";
import { useState } from "react";

export default function Form() {
	const [step, setStep] = useState(0);
	const next = () => setStep((current) => current + 1);
	const prev = () => setStep((current) => current - 1);
	return (
		<>
			{step === 1 && (
				<div>
					<button onClick={next}>next step</button>
					<p>Step 1</p>
				</div>
			)}
			{step === 2 && (
				<div>
					<button onClick={next}>next step</button>
					<p>Step 2</p>
				</div>
			)}
			{step === 3 && (
				<div>
					<button onClick={next}>next step</button>
					<p>Step 3</p>
				</div>
			)}
			{step === 4 && (
				<div>
					<button onClick={next}>next step</button>
					<p>Step 4</p>
				</div>
			)}
			{step === 5 && (
				<div>
					<button onClick={next}>next step</button>
					<p>Step 5</p>
				</div>
			)}
		</>
	);
}
