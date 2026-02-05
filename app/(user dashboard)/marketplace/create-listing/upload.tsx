import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Image as ImageIcon, Upload, X, Plus } from "lucide-react";
import Image from "next/image";

type CustomPhotoInputProps = {
	name: string;
	label?: string;
	multiple?: boolean;
	className?: string;
};

export function CustomPhotoInput({ name, label, multiple = false, className }: CustomPhotoInputProps) {
	const { setValue, watch } = useFormContext();
	const [previews, setPreviews] = useState<string[]>([]);
	const files = watch(name) as FileList | File[] | null;

	// Create previews when files change
	useEffect(() => {
		if (!files || files.length === 0) {
			setPreviews([]);
			return;
		}

		const fileArray = Array.from(files as Iterable<File>);
		const objectUrls = fileArray.map((file) => URL.createObjectURL(file));
		setPreviews(objectUrls);

		// Cleanup
		return () => {
			objectUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [files]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (selectedFiles && selectedFiles.length > 0) {
			const newFiles = Array.from(selectedFiles);

			if (multiple) {
				const existingFiles = files ? Array.from(files as Iterable<File>) : [];
				const combinedFiles = [...existingFiles, ...newFiles];

				// Limit to 8 files
				const slicedFiles = combinedFiles.slice(0, 8);

				if (slicedFiles.length > 8) {
					// Optional: Toast warning? For now just slice. 
					// Ideally we should warn user.
				}

				setValue(name, slicedFiles, { shouldValidate: true, shouldDirty: true });
			} else {
				setValue(name, selectedFiles, { shouldValidate: true, shouldDirty: true });
			}
		}

		// Reset input so same file can be selected again if needed
		e.target.value = "";
	};

	const handleRemoveFile = (index: number) => {
		if (files) {
			const dt = new DataTransfer();
			const fileArray = Array.from(files as Iterable<File>);

			fileArray.splice(index, 1);
			fileArray.forEach(file => dt.items.add(file));

			const newFiles = dt.files;
			setValue(name, newFiles, { shouldValidate: true, shouldDirty: true });
		}
	};

	const handleClearAll = () => {
		setValue(name, null, { shouldValidate: true });
	};

	return (
		<div className={`w-full ${className || ""}`}>
			{label && (
				<div className="flex justify-between items-center mb-2">
					<p className="text-sm md:text-base font-semibold">{label}</p>
					{previews.length > 0 && (
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
				onClick={(e) => {
					const isLimitReached = multiple && previews.length >= 8;
					if (isLimitReached) {
						e.preventDefault();
					}
				}}
				className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all duration-200 py-8 min-h-[200px] ${multiple && previews.length >= 8 ? "cursor-default opacity-75" : "cursor-pointer hover:bg-gray-100"
					}`}
			>
				{previews.length > 0 ? (
					<div className={`w-full px-4 grid gap-4 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 max-w-sm'}`}>
						{previews.map((url, index) => (
							<div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm group/image">
								<Image
									src={url}
									alt={`Preview ${index + 1}`}
									fill
									className="object-cover"
									unoptimized
								/>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleRemoveFile(index);
									}}
									className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors shadow-sm opacity-100 md:opacity-0 md:group-hover/image:opacity-100"
								>
									<X size={14} />
								</button>
							</div>
						))}

						{multiple && previews.length < 8 && (
							<div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] hover:bg-gray-50 transition-all cursor-pointer bg-white">
								<Plus size={24} />
								<span className="text-xs font-medium">Add Photo</span>
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center p-4">
						<div className="text-gray-400 group-hover:text-[var(--primary-color)] transition-colors mb-3">
							<ImageIcon size={48} strokeWidth={1.5} />
						</div>

						<div className="text-gray-600 text-center space-y-1">
							<p className="font-semibold text-gray-700 group-hover:text-[var(--primary-color)] transition-colors">
								Click to upload image{multiple ? 's' : ''}
							</p>
							<p className="text-sm text-gray-400">
								{multiple ? "PNG, JPG, GIF (Max 10MB each)" : "PNG, JPG, GIF (Max 10MB)"}
							</p>
						</div>

						<div
							className="mt-6 inline-flex items-center gap-2 bg-[var(--primary-color)] text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-[var(--primary-color)]/90 transition-all transform group-hover:scale-105"
						>
							<Upload size={18} />
							Choose Files
						</div>
					</div>
				)}

				<input
					type="file"
					id={name}
					onChange={handleChange}
					className="hidden"
					accept="image/*"
					multiple={multiple}
					disabled={multiple && previews.length >= 8}
				/>
			</label>
		</div>
	);
}