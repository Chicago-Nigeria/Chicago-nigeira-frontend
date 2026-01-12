"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "@/app/store/useAuthModal";
import SignInModalContent from "./SignInModalContent";
import SignUpModalContent from "./SignUpModalContent";

export default function AuthModal() {
	const { isOpen, mode, context } = useAuthModal((state) => ({
		isOpen: state.isOpen,
		mode: state.mode,
		context: state.context,
	}));
	const { closeModal } = useAuthModal((state) => state.actions);

	// Handle escape key and body scroll
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				closeModal();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			// Prevent body scroll when modal is open
			document.body.style.overflow = "hidden";
			document.body.style.position = "fixed";
			document.body.style.width = "100%";
			document.body.style.top = `-${window.scrollY}px`;
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			const scrollY = document.body.style.top;
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.style.top = "";
			window.scrollTo(0, parseInt(scrollY || "0") * -1);
		};
	}, [isOpen, closeModal]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={closeModal}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
					/>

					{/* Modal Container */}
					<div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 sm:p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, y: 100 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 100 }}
							transition={{
								duration: 0.3,
								ease: [0.4, 0, 0.2, 1],
							}}
							className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto pointer-events-auto"
						>
							{/* Close Button */}
							<button
								onClick={closeModal}
								className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
								aria-label="Close modal"
							>
								<X className="w-5 h-5 text-gray-500" />
							</button>

							{/* Drag indicator for mobile */}
							<div className="sm:hidden flex justify-center pt-3">
								<div className="w-10 h-1 bg-gray-300 rounded-full" />
							</div>

							{/* Modal Content */}
							<div className="p-5 sm:p-8">
								{/* Render appropriate modal content based on mode */}
								<AnimatePresence mode="wait">
									{mode === "signin" ? (
										<motion.div
											key="signin"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											transition={{ duration: 0.2 }}
										>
											<SignInModalContent />
										</motion.div>
									) : (
										<motion.div
											key="signup"
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -20 }}
											transition={{ duration: 0.2 }}
										>
											<SignUpModalContent />
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
