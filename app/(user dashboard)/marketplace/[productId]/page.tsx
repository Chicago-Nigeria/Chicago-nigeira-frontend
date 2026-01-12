"use client";
import {
	ArrowLeft,
	Box,
	Calendar,
	Clock,
	Eye,
	Flag,
	MapPin,
	MessageCircle,
	Phone,
	Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LikePost from "../../components/likePostContent";
import ShareButton from "../../components/shareButton";
import { redirect, useParams } from "next/navigation";
import { useGetListingById } from "@/app/hooks/useListing";
import formatDate from "@/app/libs/helper/date";

export default function Product() {
	const { productId } = useParams();

	const { data } = useGetListingById(productId as string);
	const product = data?.data?.data;
	const productCreatedDate = formatDate(product?.createdAt);
	// if (!product) {
	// 	redirect("/not-found");
	// }

	return (
		<main className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4 md:gap-12">
			<section className="space-y-4 pt-4">
				{/* Header Section - Mobile Optimized */}
				<Link href={"/marketplace"} className="flex items-center gap-4">
					<ArrowLeft />
					<div>
						<p>Back to marketplace</p>
						<p className="text-xl font-semibold">Product Details</p>
					</div>
				</Link>

				{/* Product Image Section */}
				<section className="bg-white rounded-xl overflow-hidden space-y-4">
					{/* Main Image */}
					<div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] bg-gray-100 relative">
						<Image
							className="object-cover object-center w-full h-full transition-transform duration-500 hover:scale-105"
							src={
								product?.photos[0] ?? "/image-placeholder.webp"
							}
							alt={product?.title ?? "Main product image"}
							fill
							priority
						/>
						<div className="absolute right-5 top-4 flex gap-2 items-center">
							<ShareButton title={productId as string} />
							<LikePost className="w-10 h-10" />
						</div>
					</div>

					{/* Other Images */}
					<div
						className="flex  gap-3 overflow-x-auto px-4 py-1 pb-4 scrollbar-thin scrollbar-thumb-gray-300
      scrollbar-track-transparent
    "
					>
						{(product?.photos.length
							? product?.photos
							: [
									"/image-placeholder.webp",
									"/image-placeholder.webp",
									"/image-placeholder.webp",
								]
						).map((src, index) => (
							<div
								key={index}
								className="
            relative
            flex-shrink-0
            w-32
            h-28
            sm:w-36
            sm:h-32
            rounded-lg
            overflow-hidden
            bg-gray-200
            cursor-pointer
            transition-all
            duration-300
          "
							>
								<Image
									src={src}
									alt={`Thumbnail ${index + 1}`}
									fill
									className="object-cover object-center transition-transform duration-300 hover:scale-105"
								/>
							</div>
						))}
					</div>
				</section>

				{/* post details section  */}
				<section className="bg-white p-4 rounded-xl">
					{/* post header  */}
					<div className="pb-4 border-b border-b-gray-400 text-sm space-y-4">
						<div className="flex gap-4 items-center ">
							<p className="text-xs p-1 px-2 border border-gray-400 rounded-lg">
								{product?.category}
							</p>
							<div className=" flex items-center gap-1 text-gray-400">
								<Eye className="w-5 h-5" />{" "}
								<p>{product?.ratings}</p>
							</div>
							<p className="text-[var(--primary-color)] ml-auto text-lg">
								{product?.currency === "USD"
									? "$"
									: product?.currency === "NGN"
										? "₦"
										: "$"}

								{product?.price}
							</p>
						</div>
						<h1 className="font-bold text-xl">{product?.title}</h1>
						<div className="flex md:text-sm text-xs gap-4 text-gray-400">
							<div className="flex items-center gap-1">
								<MapPin className="w-5 h-5" />
								<p>{product?.location}</p>
							</div>
							<div className="flex items-center gap-1">
								<Calendar className="w-5 h-5" />
								<p>{productCreatedDate}</p>
							</div>
						</div>
					</div>
					{/* post description  */}
					<div>
						<h2 className="font-semibold text-lg mt-2 mb-1">
							Description
						</h2>
						<div className="text-gray-500 [&>*:not(:first-child)]:pt-2 text-sm">
							<p>{product?.description}</p>

							{/*<ul className="list-disc list-inside">
								<li>Traditional A-line dresses </li>
								<li>Modern fitted designs</li>
								<li>Maxi and midi lengths</li>
								<li>Custom embellishments available </li>
							</ul>
							<p>
								All dresses come with matching headwrap.
								Turnaround time is 2-3 weeks. Free alterations
								within 30 days of delivery.
							</p>
							<p>
								Contact me to discuss your design preferences
								and measurements!
							</p>*/}
						</div>
					</div>
					{/* post details  */}
					{/*<section>
						<h2 className="font-semibold text-lg mt-4 mb-2">
							Details
						</h2>
						<div className="grid md:grid-cols-2 gap-4 md:ml-8 ">
							{[
								{
									type: "Material",
									description: "100% Cotton Ankara Fabric",
								},
								{
									type: "Material",
									description: "100% Cotton Ankara Fabric",
								},
								{
									type: "Material",
									description: "100% Cotton Ankara Fabric",
								},
								{
									type: "Material",
									description: "100% Cotton Ankara Fabric",
								},
							].map(({ type, description }, index) => (
								<div
									key={index}
									className="bg-gray-100 p-4 text-sm rounded-lg md:pr-8"
								>
									<p>{type}</p>
									<p className="font-semibold text-base">
										{description}
									</p>
								</div>
							))}
						</div>
						<p className="bg-gray-100 w-fit py-2 px-4 text-sm rounded-lg mt-4 md:ml-8">
							Delivery Time{" "}
							<span className=" font-semibold">2 - 3 weeks</span>
						</p>
					</section>*/}
					<section>
						<h2 className="font-semibold text-lg mt-4 mb-2">
							Tags
						</h2>
						<div className="flex gap-2 flex-wrap text-xs text-gray-600">
							{/* <p className="bg-gray-100 w-fit py-2 px-4 rounded-lg">Handmade</p>
              <p className="bg-gray-100 w-fit py-2 px-4 rounded-lg">Custom</p>
              <p className="bg-gray-100 w-fit py-2 px-4 rounded-lg">
                Nigerian Fashion
              </p>
              <p className="bg-gray-100 w-fit py-2 px-4 rounded-lg">
                Cultural wear
              </p> */}

							{product?.tags.map((tag) => (
								<p
									className="bg-gray-100 w-fit py-2 px-4 rounded-lg"
									key={`${Math.random()}${tag}`}
								>
									{tag}
								</p>
							))}
						</div>
					</section>
				</section>
				<section className="mt-8">
					<h2 className="text-lg font-semibold text-gray-800 mb-3">
						Related Listings
					</h2>

					<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
						{[
							{
								image: "/post-img-1.webp",
								itemName: "Nigerian Traditional...",
								price: 32,
								owner: "Royal Threads",
							},
							{
								image: "/post-img-1.webp",
								itemName: "Ankara Modern Dress",
								price: 40,
								owner: "Royal Threads",
							},
							{
								image: "/post-img-1.webp",
								itemName: "African Heritage Gown",
								price: 55,
								owner: "Kulture Studio",
							},
							{
								image: "/post-img-1.webp",
								itemName: "Classic Traditional Attire",
								price: 28,
								owner: "Naija Styles",
							},
						].map(({ itemName, price, image, owner }, index) => (
							<div
								key={index}
								className=" sm:min-w-0 sm:w-auto bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300  cursor-pointer  snap-center flex-shrink-0 mb-8"
							>
								<div className="w-30 md:w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
									<Image
										src={image}
										alt={itemName}
										width={300}
										height={400}
										className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
									/>
								</div>

								<p className="text-sm font-medium text-gray-800 truncate max-w-30 md:max-w-none">
									{itemName}
								</p>
								<p className="text-[var(--primary-color)] font-semibold">
									${price}
								</p>
								<p className="text-xs text-gray-500">{owner}</p>
							</div>
						))}
					</div>
				</section>
			</section>

			{/* Right Sidebar - Hidden on Mobile */}
			<section className="mt-4 space-y-8 sticky top-0 h-fit pt-4 hidden md:block">
				<section className="bg-white p-4 rounded-xl">
					<section className="grid place-items-center ">
						<div className="flex items-center justify-center w-20 aspect-square rounded-full bg-[var(--primary-color)] text-white">
							<p className="font-semibold text-xl">
								{product?.user?.firstName
									.charAt(0)
									.toUpperCase()}{" "}
								{product?.user?.lastName
									.charAt(0)
									.toUpperCase()}
							</p>
						</div>
						<p className="capitalize">
							{" "}
							{product?.user?.firstName || " "}{" "}
							{product?.user?.lastName || " "}
						</p>
						<div>
							<div className="flex gap-1">
								<Star className="stroke-yellow-300 w-4 fill-yellow-300" />
								<Star className="stroke-yellow-300 w-4 fill-yellow-300" />
								<Star className="stroke-yellow-300 w-4 fill-yellow-300" />
								<Star className="stroke-yellow-300 w-4 fill-yellow-300" />
								<Star className="stroke-gray-300 w-4 fill-gray-300" />
							</div>
						</div>
						<p className="text-xs text-gray-600">
							{product?.comments?.length} Reviews
						</p>
					</section>
					<section className="border-y border-y-gray-200 my-4 py-4 space-y-4 text-xs">
						<div className="flex gap-2">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--blue-color)]/10 grid place-items-center">
								<Clock className="w-5 stroke-[var(--blue-color)]" />
							</div>
							<div>
								<p className="font-semibold">Response Time</p>
								<p className="text-gray-400">
									Usually responds withing 2 hours
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--primary-color)]/10 grid place-items-center">
								<Calendar className="w-5 stroke-[var(--primary-color)]" />
							</div>
							<div>
								<p className="font-semibold">Member Since</p>
								<p className="text-gray-400">March 2022</p>
							</div>
						</div>
						<div className="flex gap-2">
							<div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--purple-color)]/10 grid place-items-center">
								<Box className="w-5 stroke-[var(--purple-color)]" />
							</div>
							<div>
								<p className="font-semibold">Total Sales</p>
								<p className="text-gray-400">March 2022</p>
							</div>
						</div>
					</section>
					<section className="border-b border-b-gray-200 pb-4 mb-4">
						<h3 className="font-semibold">About the Seller</h3>
						<p className="text-sm text-gray-400 ">
							{product?.user?.bio}
						</p>
					</section>
					<section className="grid grid-cols-2 gap-2 text-sm text-gray-600">
						<Link
							className="col-span-2 flex items center justify-center gap-1 rounded-lg text-white bg-[var(--primary-color)] p-3"
							href={"/"}
						>
							<MessageCircle className="w-5 h-5" /> Message Seller
						</Link>
						<Link
							className="flex items items-center justify-center gap-1 rounded-lg p-3 border border-gray-200"
							href={`tel:${product?.user?.phone}`}
						>
							<Phone className="w-4 h-4" />
							Call
						</Link>
						<Link
							className="flex items items-center justify-center gap-1 rounded-lg p-3 border border-gray-200"
							href={`wa.me/${product?.user?.phone}`}
						>
							<Phone className="w-4 h-4 shrink-0" /> Whatsapp
						</Link>
						<Link
							className="col-span-2 flex items center justify-center gap-1 rounded-lg p-2"
							href={"/"}
						>
							<Flag className="w-5" />
							Report this Listing
						</Link>
					</section>
				</section>
			</section>
		</main>
	);
}
