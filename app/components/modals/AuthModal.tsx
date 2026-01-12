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

	// Handle escape key
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
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
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
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{
								duration: 0.3,
								ease: [0.4, 0, 0.2, 1],
							}}
							className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto"
						>
							{/* Close Button */}
							<button
								onClick={closeModal}
								className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
								aria-label="Close modal"
							>
								<X className="w-5 h-5 text-gray-500" />
							</button>

							{/* Modal Content */}
							<div className="p-6 sm:p-8">
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
