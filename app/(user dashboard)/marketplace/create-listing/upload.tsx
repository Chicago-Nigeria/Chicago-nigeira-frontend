"use client";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Image as ImageIcon, Upload, X } from "lucide-react";

type CustomPhotoInputProps = {
	name: string;
	label?: string;
	multiple?: boolean;
};

export function CustomPhotoInput({ name, label, multiple = false }: CustomPhotoInputProps) {
	const { setValue, watch } = useFormContext(); // Remove register
	const [fileNames, setFileNames] = useState<string[]>([]);

	const files = watch(name) as FileList | null;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		console.log("Files selected:", selectedFiles); // Debug log
		
		if (selectedFiles && selectedFiles.length > 0) {
			const names = Array.from(selectedFiles).map(file => file.name);
			setFileNames(names);
			
			// Update form value - THIS IS WHAT MATTERS
			setValue(name, selectedFiles, { shouldValidate: true, shouldDirty: true });
			console.log("Form value set for:", name, selectedFiles.length, "files"); // Debug log
		}
	};

	const handleRemoveFile = (index: number) => {
		if (files) {
			const dt = new DataTransfer();
			const fileArray = Array.from(files);
			
			fileArray.splice(index, 1);
			fileArray.forEach(file => dt.items.add(file));
			
			const newFiles = dt.files;
			setValue(name, newFiles, { shouldValidate: true });
			
			const newFileNames = fileNames.filter((_, i) => i !== index);
			setFileNames(newFileNames);
		}
	};

	const handleClearAll = () => {
		setValue(name, null, { shouldValidate: true });
		setFileNames([]);
	};

	return (
		<div className="w-full">
			{label && (
				<div className="flex justify-between items-center mb-2">
					<p className="text-sm md:text-base font-semibold">{label}</p>
					{fileNames.length > 0 && (
						<button
							type="button"
							onClick={handleClearAll}
							className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
						>
							<X size={12} />
							Clear all
						</button>
					)}
				</div>
			)}

			<label
				htmlFor={name}
				className="group cursor-pointer flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100 hover:bg-gray-200 transition-all duration-200 py-8"
			>
				<div className="text-gray-500 group-hover:text-[var(--primary-color)] transition-colors">
					<ImageIcon size={36} />
				</div>

				<div className="text-gray-600 text-center">
					{fileNames.length > 0 ? (
						<div className="space-y-2">
							<p className="font-medium text-[var(--primary-color)]">
								{fileNames.length} file{fileNames.length > 1 ? 's' : ''} selected
							</p>
							<div className="max-h-20 overflow-y-auto">
								{fileNames.map((fileName, index) => (
									<div key={index} className="flex items-center justify-between gap-2 text-xs">
										<span className="truncate max-w-[200px]">{fileName}</span>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleRemoveFile(index);
											}}
											className="text-red-500 hover:text-red-700 flex-shrink-0"
										>
											<X size={12} />
										</button>
									</div>
								))}
							</div>
						</div>
					) : (
						<>
							<span className="block font-medium">Click to upload</span>
							<span className="text-sm text-gray-400">
								{multiple ? "PNG, JPG, GIF up to 10MB each" : "PNG, JPG, GIF up to 10MB"}
							</span>
							{multiple && (
								<span className="text-xs text-gray-400 block mt-1">
									You can select multiple files
								</span>
							)}
						</>
					)}
				</div>

				<button
					type="button"
					className="mt-3 inline-flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-color)]/90 transition"
				>
					<Upload size={16} />
					Choose File{multiple ? 's' : ''}
				</button>

				{/* FIXED: Remove register, only use onChange */}
				<input
					type="file"
					id={name}
					onChange={handleChange} // Only this handler
					className="hidden"
					accept="image/*"
					multiple={multiple}
				/>
			</label>

			<p className="text-xs text-gray-500 mt-2">
				Supported formats: PNG, JPG, JPEG, GIF • Max size: 10MB per file
				{multiple && " • Maximum 8 files"}
			</p>
		</div>
	);
}