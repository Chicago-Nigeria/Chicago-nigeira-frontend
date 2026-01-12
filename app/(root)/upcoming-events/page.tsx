"use client";

import { useRef, useState } from "react";
import {
	Calendar,
	Clock,
	MapPin,
	Users,
	Facebook,
	Twitter,
	Linkedin,
	Instagram,
	TrendingUp,
	Share2Icon,
	Ticket,
	Star,
} from "lucide-react";
import Image from "next/image";

const ticketIframes = {
	regular: {
		src: "https://links.chicagonigerians.com/widget/form/L6TgvC0AbAiVXlYz4caX",
		id: "inline-L6TgvC0AbAiVXlYz4caX",
		formId: "L6TgvC0AbAiVXlYz4caX",
		title: "Nigeria @ 65 Registration - General",
		height: "1111",
	},
	vendor: {
		src: "https://links.chicagonigerians.com/widget/form/G5bDpvqKYmrXKUWPBNxz",
		id: "inline-G5bDpvqKYmrXKUWPBNxz",
		formId: "G5bDpvqKYmrXKUWPBNxz",
		title: "Nigeria @ 65 Registration - Vendor",
		height: "1034",
	},
	vip: {
		src: "https://links.chicagonigerians.com/widget/form/g8A8SgU18q10ceOVz76P",
		id: "inline-g8A8SgU18q10ceOVz76P",
		formId: "g8A8SgU18q10ceOVz76P",
		title: "Nigeria @ 65 Registration - VIP",
		height: "1032",
	},
};
type TicketType = "vendor" | "regular" | "vip";
export default function EventPage() {
	const [selectedTicket, setSelectedTicket] = useState<TicketType>("vendor"); // "regular" | "vendor" | "vip"

	const formRef = useRef<HTMLDivElement | null>(null);

	const handleTicketSelect = (ticketType: TicketType) => {
		setSelectedTicket(ticketType);

		// Scroll only on mobile (width <= 768px)
		if (window.innerWidth <= 768 && formRef.current) {
			formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="min-h-screen ">
			{/* Hero Section */}
			<div className="relative bg-[url('/hero-bg.webp')] text-white py-20 px-4">
				<div className="relative max-w-5xl mx-auto text-center">
					<Image
						alt="nigerian logo"
						src={"/NIGERIA@65.png"}
						width={280}
						height={256}
						className="mx-auto w-40 md:w-70 h-auto"
						priority
					/>
					<h2 className="text-4xl md:text-7xl font-bold mt-10 md:mt-14">
						Business & Culture Exhibition
					</h2>
					<p className="text-2xl md:text-3xl mt-4">Celebrate Independence Day In Style!</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-16">
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column - Event Details & Tickets */}
					<div className="lg:col-span-2">
						{/* Event Details */}
						<div className="rounded-[18px] border border-[#00000096]">
							<div className="p-8">
								<div className="flex items-center gap-2 mb-4">
									<Calendar className="w-5 h-5 text-green-600" />
									<h3 className="text-xl font-tienne font-bold">Event Details</h3>
								</div>

								<div className="grid md:grid-cols-2 gap-6">
									<div className="space-y-3">
										<div className="flex items-center gap-3">
											<Calendar className="w-4 h-4 text-custom-gray" />
											<div>
												<p className="text-lg">October 4, 2025</p>
												<p className="text-sm text-gray-600">Independence Day</p>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<MapPin className="w-4 h-4 text-custom-gray" />
											<div>
												<p className="text-lg">Lions Woods, Des Plaines,</p>
												<p className="text-sm text-gray-600">IL 60016</p>
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<div className="flex items-center gap-3">
											<Clock className="w-4 h-4 text-custom-gray" />
											<div>
												<p className="text-lg">12:00pm - 6:00pm</p>
												<p className="text-sm text-gray-600">6 hours celebration</p>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-6 pt-4 border-t border-[#00000038] ">
									<p className="text-sm text-custom-gray">
										Celebrate Nigeria&apos;s 65th Independence with cultural performances, authentic
										cuisine, networking opportunities, and live entertainment. Join us for an
										unforgettable evening honoring our nation&apos;s heritage and future.
									</p>
								</div>
							</div>
						</div>

						{/* Choose Your Experience */}
						<div className="mt-12">
							<h3 className="text-2xl font-tienne font-bold mb-4">Choose Your Experience</h3>

							<div className="grid md:grid-cols-3 gap-4">
								{/* Regular Ticket */}
								<div
									className={`cursor-pointer transition-all rounded-[18px] ${
										selectedTicket === "regular"
											? "border-[3] border-custom-green-dark bg-green-50"
											: " border border-[#00000096]"
									}`}
									onClick={() => handleTicketSelect("regular")}>
									<div className="px-6 py-8">
										<div className="flex items-center justify-between mb-3">
											<div className="flex gap-2 items-center">
												<Ticket className="size-4 text-custom-green-dark" />
												<h4 className="text-lg">Regular Ticket</h4>
											</div>
											<span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
												FREE
											</span>
										</div>
										<p className="text-sm text-custom-gray mb-4">Free access to venue</p>
										<div className="space-y-1 text-custom-gray text-[13px]">
											<p className="font-semibold">Includes:</p>
											<ul>
												<li>• Free Access to Venue</li>
												<li>• Basic Seating</li>
												<li>• Performance Viewing</li>
											</ul>
										</div>
									</div>
								</div>

								{/* Vendor Ticket */}
								<div
									className={`cursor-pointer transition-all rounded-[18px] ${
										selectedTicket === "vendor"
											? "border-[3] border-custom-green-dark"
											: " border border-[#00000096]"
									}`}
									onClick={() => handleTicketSelect("vendor")}>
									<div className="px-6 py-8">
										<div className="flex items-center justify-between mb-3">
											<div className="flex gap-2 items-center">
												<Users className="size-4 text-custom-green-dark" />
												<h4 className="text-lg">Vendor Ticket</h4>
											</div>
											{/* <span className="badge">$250 / $150 / $100</span> */}
										</div>

										<p className="text-sm text-custom-gray mb-4">
											Choose your vendor experience. All options include 1 branded hoodie and access
											to the After Party at Mayensplace.
										</p>

										<div className="space-y-1 text-custom-gray text-[13px]">
											<p className="font-semibold">Includes:</p>
											<ul>
												<li>
													• <strong>$250</strong> – Exhibition tent, table & 2 chairs, 1 branded
													hoodie
												</li>
												<li>
													• <strong>$150</strong> – Exhibition table & chair, 1 branded hoodie
												</li>
												<li>
													• <strong>$100</strong> – Exhibition table only, 1 branded hoodie
												</li>
												<li>• Access to After Party at Mayensplace</li>
											</ul>
										</div>
									</div>
								</div>

								{/* VIP Ticket */}
								<div
									className={`relative cursor-pointer transition-all rounded-[18px] ${
										selectedTicket === "vip"
											? "border-[3] border-custom-green-dark"
											: " border border-[#00000096]"
									}`}
									onClick={() => handleTicketSelect("vip")}>
									<div className="bg-[#3F4341] text-white text-xs py-1 px-4 rounded-[5px]  absolute top-0 left-1/2 -translate-1/2">
										Most Popular
									</div>
									<div className="px-6 py-8">
										<div className="flex items-center justify-between mb-3">
											<div className="flex gap-2 items-center">
												<Star className="size-4 text-[#F4D10C]" />
												<h4 className="text-lg">VIP Ticket</h4>
											</div>
											<span className="badge">$50</span>
										</div>

										<p className="text-sm text-custom-gray mb-4">
											Premium Attendee Experience with Enhanced Networking Opportunities and
											Exclusive Access to the After-Party at Mayensplace.
										</p>

										<div className="space-y-1 text-custom-gray text-[13px]">
											<p className="font-semibold">Includes:</p>
											<ul>
												<li>• Premium Seating</li>
												<li>• Welcome Cocktail</li>
												<li>• Entertainment</li>
												<li>• Networking Lounge</li>
												<li>• After Party at Mayensplace</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Purchase Panel & Social */}
					<div className="space-y-6" ref={formRef}>
						{/* Registration Form */}
						{selectedTicket && (
							<div className="bg-white rounded-[18px] border shadow-sm">
								<div className="p-6">
									<h3 className="text-xl font-tienne font-semibold mb-4">Complete Registration</h3>
									<div className="w-full h-96 border rounded-[18px] overflow-y-auto">
										<iframe
											src={ticketIframes[selectedTicket].src}
											className="w-full h-full border-none"
											id={ticketIframes[selectedTicket].id}
											title={ticketIframes[selectedTicket].title}
											data-layout="{'id':'INLINE'}"
											data-trigger-type="alwaysShow"
											data-trigger-value=""
											data-activation-type="alwaysActivated"
											data-activation-value=""
											data-deactivation-type="neverDeactivate"
											data-deactivation-value=""
											data-form-name={ticketIframes[selectedTicket].title}
											data-height={ticketIframes[selectedTicket].height}
											data-layout-iframe-id={ticketIframes[selectedTicket].id}
											data-form-id={ticketIframes[selectedTicket].formId}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Follow Us */}
						<div className="bg-white rounded-[18px] border shadow-sm">
							<div className="p-6">
								<div className="flex items-start gap-5 mb-4">
									<Share2Icon className="size-6 mt-1 text-green-600" />
									<div>
										<h3 className="text-xl font-tienne font-semibold mb-5">Follow Us</h3>
										<div className="flex gap-3">
											<a
												href="https://www.facebook.com/profile.php?viewas=100000686899395&id=61579160920391"
												className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-transparent hover:bg-gray-50 cursor-pointer">
												<Facebook className="w-4 h-4" />
											</a>
											<a
												href="https://x.com/chicagoNGNS"
												className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-transparent hover:bg-gray-50 cursor-pointer">
												<Twitter className="w-4 h-4" />
											</a>
											<a
												href="https://www.linkedin.com/company/chicago-nigerians/about/?viewAsMember=true"
												className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-transparent hover:bg-gray-50 cursor-pointer">
												<Linkedin className="w-4 h-4" />
											</a>
											<a
												href="https://www.instagram.com/chicago9ja/"
												className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-transparent hover:bg-gray-50 cursor-pointer">
												<Instagram className="w-4 h-4" />
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Event Statistics */}
				<div className="mt-[70px]">
					<h3 className="text-2xl text-center font-tienne font-bold mb-8">Event Statistics</h3>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="bg-white rounded-[18px] border shadow-sm">
							<div className="px-6 py-9">
								<div className="flex gap-2 justify-between mb-3">
									<p className="">Total Attendees</p>
									<Users className="size-4 text-custom-green mb-2" />
								</div>
								<p className="text-4xl font-bold text-custom-green">1,247</p>
								<p className="text-sm mt-1.5 text-custom-gray">Registered for event</p>
							</div>
						</div>

						<div className="bg-white rounded-[18px] border shadow-sm">
							<div className="px-6 py-9">
								<div className="flex gap-2 justify-between mb-3">
									<p className="">Regular Tickets</p>
									<Ticket className="size-4 text-custom-green mb-2" />
								</div>
								<p className="text-4xl font-bold text-custom-green">892</p>
								<p className="text-sm mt-1.5 text-custom-gray">Free access tickets</p>
							</div>
						</div>

						<div className="bg-white rounded-[18px] border shadow-sm">
							<div className="px-6 py-9">
								<div className="flex gap-2 justify-between mb-3">
									<p className="">Vendor Tickets</p>
									<TrendingUp className="size-4 text-custom-green mb-2" />
								</div>
								<p className="text-4xl font-bold text-custom-green">245</p>
								<p className="text-sm mt-1.5 text-custom-gray">Enhanced experience</p>
							</div>
						</div>

						<div className="bg-white rounded-[18px] border shadow-sm">
							<div className="px-6 py-9">
								<div className="flex gap-2 justify-between mb-3">
									<p className="">VIP Tickets</p>
									<Star className="size-4 text-yellow-600 mb-2" />
								</div>
								<p className="text-4xl font-bold text-yellow-600">110</p>
								<p className="text-sm mt-1.5 text-custom-gray">Exclusive access</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Load external script for form functionality */}
			<script src="https://links.chicagonigerians.com/js/form_embed.js" async />
		</div>
	);
}
