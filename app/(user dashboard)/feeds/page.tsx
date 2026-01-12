import {
	ArrowRight,
	BriefcaseConveyorBelt,
	Calendar,
	Camera,
	ChartNoAxesColumnIncreasing,
	Clock,
	EllipsisVertical,
	Filter,
	MapPin,
	MessageCircle,
	SendIcon,
	Share2Icon,
	UsersRound,
	Video,
} from "lucide-react";
import Image from "next/image";
import LikePost from "../components/likePostContent";
import SavePost from "../components/saveButton";
import Link from "next/link";
import { VerifiedIcon } from "@/app/components/icons";
import PageInConstruction from "../components/construction";

type PostItem = {
	postType: "sponsored-post" | "post";
	author: string;
	authorImage: string;
	postText: string;
	postImage?: string;
	jobDescription: string;
	location: string;
	time: string;
	jobCategory: string;
	likeCount: number;
	commentCount: number;
	shareCount: number;
	verified: boolean;
};
const postItems: PostItem[] = [
	{
		postType: "sponsored-post",
		author: "Adebayo Ogundimu",
		authorImage: "/reviewer-image-1.webp",
		postText:
			"Excited to announce that our fintech startup just secured Series A funding! 🚀Looking to hire Nigerian talent in Chicago. DM me if you're interested in joining our team. #NigerianTech #ChicagoStartups",
		postImage: "/post-img-1.webp",
		jobDescription: "Tech Entrepreneur",
		location: "Chicago",
		time: "2h",
		jobCategory: "Business",
		likeCount: 8,
		commentCount: 27,
		shareCount: 8,
		verified: false,
	},
	{
		postType: "post",
		author: "Adebayo Ogundimu",
		authorImage: "/reviewer-image-1.webp",
		postText:
			"Excited to announce that our fintech startup just secured Series A funding! 🚀Looking to hire Nigerian talent in Chicago. DM me if you're interested in joining our team. #NigerianTech #ChicagoStartups",
		postImage: "/post-img-1.webp",
		jobDescription: "Tech Entrepreneur",
		location: "Chicago",
		time: "2h",
		jobCategory: "Business",
		likeCount: 8,
		commentCount: 27,
		shareCount: 8,
		verified: true,
	},
	{
		postType: "post",
		author: "Adebayo Ogundimu",
		authorImage: "/reviewer-image-1.webp",
		postText:
			"Excited to announce that our fintech startup just secured Series A funding! 🚀Looking to hire Nigerian talent in Chicago. DM me if you're interested in joining our team. #NigerianTech #ChicagoStartups",

		jobDescription: "Tech Entrepreneur",
		location: "Chicago",
		time: "2h",
		jobCategory: "Business",
		likeCount: 8,
		commentCount: 27,
		shareCount: 8,
		verified: true,
	},
];
export default function Feed() {
	return (
		<PageInConstruction/>
		// <section className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-12">
		// 	<section className="space-y-8 pt-4">
		// 		<div className="flex overflow-auto gap-2 items-center bg-white p-8 md:rounded-lg space-y-4 user-page-top button-hover-effect">
		// 			<button className="text-white bg-[var(--primary-color)]">All Posts</button>
		// 			<button>Following</button>
		// 			<button>My Networks</button>
		// 			<button className="ml-auto px-4 py-2">
		// 				{" "}
		// 				<Filter className="w-4 h-4" /> Filters
		// 			</button>
		// 		</div>
		// 		<div className="md:p-8 py-2 bg-white md:rounded-xl">
		// 			<div className="flex">
		// 				<div className="w-14 h-14 rounded-full bg-gray-100 mr-4 ">
		// 					{" "}
		// 					<Image
		// 						className="object-cover"
		// 						src="/reviewer-image-1.webp"
		// 						height={56}
		// 						width={56}
		// 						alt="user"
		// 					/>
		// 				</div>
		// 				<form action="" className="bg-red flex-1">
		// 					<label htmlFor="post" className="hidden">
		// 						Post
		// 					</label>
		// 					<textarea
		// 						className="min-h-17 w-full resize-none bg-gray-100 p-2 rounded-xl text-sm "
		// 						draggable="false"
		// 						name="post"
		// 						id="post"
		// 						placeholder="What's on your mind? Share with the community"></textarea>
		// 				</form>
		// 			</div>

		// 			<div className="overflow-x-auto mt-12 border-t border-t-gray-200 flex gap-2 items-center bg-white py-4 space-y-4 user-page-top button-hover-effect">
		// 				<button>
		// 					<Camera className="w-5 h-5" />
		// 					<span>Photo</span>
		// 				</button>
		// 				<button>
		// 					<Video className="w-5 h-5" /> <span>Video</span>
		// 				</button>
		// 				<button>
		// 					<Calendar className="w-5 h-5" /> <span>Event</span>
		// 				</button>
		// 				<button className="ml-auto px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">
		// 					<SendIcon className="w-5 h-5" /> <span>Post</span>
		// 				</button>
		// 			</div>
		// 		</div>
		// 		<div className="space-y-4">
		// 			{postItems.map(
		// 				(
		// 					{
		// 						postType,
		// 						author,
		// 						authorImage,
		// 						postText,
		// 						postImage,
		// 						jobDescription,
		// 						location,
		// 						time,
		// 						jobCategory,
		// 						likeCount,
		// 						commentCount,
		// 						shareCount,
		// 						verified,
		// 					},
		// 					index
		// 				) => {
		// 					if (postType === "sponsored-post") {
		// 						return (
		// 							<div key={index} className="md:p-8 py-6 px-4 md:rounded-lg bg-white">
		// 								<div className="flex">
		// 									<div className="w-14 h-14 rounded-full bg-gray-100 mr-4 ">
		// 										{" "}
		// 										<Image
		// 											className="object-cover"
		// 											src={authorImage}
		// 											height={56}
		// 											width={56}
		// 											alt="user"
		// 										/>
		// 									</div>
		// 									<div>
		// 										{verified ? (
		// 											<div className="flex items-center gap-0.5">
		// 												<VerifiedIcon />
		// 											</div>
		// 										) : (
		// 											<p>{author}</p>
		// 										)}

		// 										<p className="text-sm text-gray-400">Events</p>
		// 									</div>
		// 									<p className="ml-auto text-xs h-fit px-2 py-0.5  border rounded-md cursor-pointer">
		// 										sponsored
		// 									</p>
		// 								</div>
		// 								<article className="mt-8 text-sm">
		// 									<p>{postText}</p>
		// 									{postImage && (
		// 										<div className="md:min-h-80 max-h-80 w-full bg-gray-200 mt-4 rounded-xl overflow-clip">
		// 											<Image
		// 												src={postImage ?? "/"}
		// 												alt="post-image"
		// 												height={589}
		// 												width={285}
		// 												className="w-full object-cover object-center"
		// 											/>
		// 										</div>
		// 									)}
		// 								</article>

		// 								<Link
		// 									href={"#"}
		// 									className="mt-8 py-2 rounded-lg w-full bg-[var(--primary-color)] text-white flex gap-2 items-center justify-center">
		// 									Get Tickets <ArrowRight className="w-4 h-4 mt-1" />
		// 								</Link>
		// 							</div>
		// 						);
		// 					} else {
		// 						return (
		// 							<div key={index} className="md:p-8 py-6 px-4 md:rounded-lg bg-white">
		// 								<div className="flex">
		// 									<div className="w-14 h-14 rounded-full bg-gray-100 mr-4 ">
		// 										{" "}
		// 										<Image
		// 											className="object-cover"
		// 											src={authorImage}
		// 											height={56}
		// 											width={56}
		// 											alt="user"
		// 										/>
		// 									</div>
		// 									<div>
		// 										{verified ? (
		// 											<div className="flex items-center gap-0.5">
		// 												<p>{author}</p>
		// 												<VerifiedIcon />
		// 											</div>
		// 										) : (
		// 											<p>{author}</p>
		// 										)}
		// 										<p className="text-sm space-x-1 text-gray-400 font-light">
		// 											<span>{jobDescription}</span> <span>{location}</span>
		// 										</p>
		// 										<p className="text-xs mt-1 text-gray-400 font-light flex items-center gap-2">
		// 											<span className="inline-flex items-center gap-0.5">
		// 												<Clock className="w-4 h-4" /> {time}
		// 											</span>{" "}
		// 											<span className="py-1 px-2 rounded-md border border-gray-400 text-black">
		// 												{jobCategory}
		// 											</span>
		// 										</p>
		// 									</div>
		// 									<div className="ml-auto p-4 cursor-pointer">
		// 										<EllipsisVertical className="w-4 h-4 " />
		// 									</div>
		// 								</div>
		// 								<article className="mt-8 text-sm">
		// 									<p>{postText}</p>
		// 									{postImage && (
		// 										<div className="md:min-h-80 max-h-80 w-full bg-gray-200 mt-4 rounded-xl overflow-clip">
		// 											<Image
		// 												src={postImage}
		// 												alt="post-image"
		// 												height={589}
		// 												width={285}
		// 												className="w-full object-cover object-center"
		// 											/>
		// 										</div>
		// 									)}
		// 								</article>

		// 								<div className=" mt-8 border-t border-t-gray-200 flex gap-4 items-center bg-white py-4 space-y-4  text-gray-400 feed-post-actions font-light text-sm">
		// 									<div>
		// 										<LikePost className="w-5 h-5" />
		// 										<span>{likeCount}</span>
		// 									</div>
		// 									<div>
		// 										<button>
		// 											<MessageCircle className="w-4 h-4" />
		// 										</button>{" "}
		// 										<span>{commentCount}</span>
		// 									</div>
		// 									<div>
		// 										<button>
		// 											<Share2Icon className="w-4 h-4" />
		// 										</button>{" "}
		// 										<span>{shareCount}</span>
		// 									</div>
		// 									<SavePost className="ml-auto" />
		// 								</div>
		// 							</div>
		// 						);
		// 					}
		// 				}
		// 			)}
		// 		</div>
		// 	</section>
		// 	<section className="space-y-8 sticky top-0 h-screen pt-4 hidden md:block">
		// 		<div className=" bg-white p-4 rounded-lg space-y-4">
		// 			<h2 className="flex items-center gap-1">
		// 				<span>Community stats</span>{" "}
		// 				<ChartNoAxesColumnIncreasing className="w-6 h-6 text-[var(--primary-color)]" />
		// 			</h2>
		// 			<div className="space-y-3 community-stats-items">
		// 				<div>
		// 					<p>Active Members</p>
		// 					<p>2,847</p>
		// 				</div>
		// 				<div>
		// 					<p>Posts today</p>
		// 					<p>127</p>
		// 				</div>
		// 				<div>
		// 					<p>Events This Week</p>
		// 					<p>8</p>
		// 				</div>
		// 			</div>
		// 		</div>
		// 		<div className=" bg-white p-4 rounded-lg space-y-4">
		// 			<h2>Popular Categories</h2>
		// 			<div className="space-y-3 community-stats-items">
		// 				<div>
		// 					<p>Fashion</p>
		// 					<p>28</p>
		// 				</div>
		// 				<div>
		// 					<p>Services</p>
		// 					<p>34</p>
		// 				</div>
		// 				<div>
		// 					<p>Food </p>
		// 					<p>23</p>
		// 				</div>
		// 				<div>
		// 					<p>Housing </p>
		// 					<p>8</p>
		// 				</div>
		// 			</div>
		// 			<hr className="border border-gray-200 my-4" />

		// 			<div className="space-y-3 ">
		// 				<h2>Quick Links</h2>
		// 				<div className="ml-4 space-y-3 community-stats-items quick-actions">
		// 					<div>
		// 						<MapPin className="w-4 h-4" />
		// 						<p>Find Local Events</p>
		// 					</div>
		// 					<div>
		// 						<UsersRound className="w-4 h-4" />
		// 						<p>Join Groups</p>
		// 					</div>
		// 					<div>
		// 						<BriefcaseConveyorBelt className="w-4 h-4" />
		// 						<p>Browse Jobs</p>
		// 					</div>
		// 				</div>
		// 			</div>
		// 		</div>
		// 	</section>
		// </section>
	);
}
