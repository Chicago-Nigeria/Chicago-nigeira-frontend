"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

const reviews = [
  {
    reviewerName: "James Adewale",
    reviewerJobDescription: "Business Owner",
    reviewerImage: "/reviewer-image-1.png",
    reviewText:
      "This platform helped me grow my network in Chicago! I've connected with amazing professionals and found new clients for my consulting business.",
    reviewRating: 1,
  },
  {
    reviewerName: "David Mensah ",
    reviewerJobDescription: "E-commerce Seller",
    reviewerImage: "/reviewer-image-2.png",
    reviewText:
      "The marketplace feature has been a game-changer for my Nigerian restaurant. I've reached so many customers in the Nigerian community here.",
    reviewRating: 1,
  },
  {
    reviewerName: "Sandra Okonkwo",
    reviewerJobDescription: "Restaurant Owner",
    reviewerImage: "/reviewer-image-3.png",
    reviewText:
      "This platform helped me grow my network in Chicago! I've connected with amazing professionals and found new clients for my consulting business.",
    reviewRating: 1,
  },
];

export default function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [value, setValue] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setValue(3); // show 3 reviews at once on md+
      } else {
        setValue(1); // show 1 review on mobile
      }
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(reviews.length / value); // total "groups"

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  return (
    <section className="container-custom py-20">
      <div className="text-center">
        <h2 className="font-semibold text-4xl md:text-5xl">
          What Our
          <span className="text-[var(--primary-color)]"> Community</span> Says
        </h2>
        <p className="mt-4 text-sm md:text-base">
          Join hundreds of Nigerians who have found their community in Chicago
        </p>
      </div>

      {/* Slider container */}
      <div className="relative mt-16 flex items-center justify-center">
        {/* Left button */}
        <button
          onClick={prevSlide}
          className="absolute z-50 left-0 md:-left-10 p-2 bg-white border border-green-700 shadow rounded-full hover:bg-green-100 cursor-pointer"
        >
          <ArrowLeft size={24} className="text-green-700" />
        </button>

        {/* Slides */}
        <div className="overflow-hidden w-full max-w-5xl">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reviews.map((item, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 px-4 py-2 md:w-1/2 lg:w-1/3"
              >
                <div className="flex flex-col gap-8 max-w-md mx-auto p-6 rounded-lg shadow-[0_4px_46px_-14px_#00000040] bg-white">
                  {/* star rating */}
                  <div>
                    <Image
                      src={"/rating.png"}
                      alt="rating image"
                      height={30}
                      width={116}
                    />
                  </div>

                  {/* review text */}
                  <p className="text-sm text-gray-500 font-light">
                    {item.reviewText}
                  </p>

                  {/* reviewer profile */}
                  <div className="flex gap-4 items-center">
                    <div className="rounded-full bg-gray-200 w-14 h-14 overflow-hidden">
                      <Image
                        className="object-cover"
                        src={item.reviewerImage}
                        height={56}
                        width={56}
                        alt={item.reviewerName}
                      />
                    </div>
                    <div>
                      <p className="font-bold">{item.reviewerName}</p>
                      <p className="text-sm text-gray-600">
                        {item.reviewerJobDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right button */}
        <button
          onClick={nextSlide}
          className="absolute z-50 right-0 md:-right-10 p-2 bg-white shadow rounded-full  border border-green-700 cursor-pointer hover:bg-green-100"
        >
          <ArrowRight size={24} className="text-green-700" />
        </button>
      </div>
    </section>
  );
}
