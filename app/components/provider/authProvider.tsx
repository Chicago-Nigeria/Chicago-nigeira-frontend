"use client";

import React, { ReactNode, Suspense, useEffect } from "react";
import { useSession } from "@/app/store/useSession";
import { Loader } from "../loader";

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const { getSession } = useSession((state) => state.actions);

	useEffect(() => {
		getSession(true);
	}, [getSession]);

	console.log(" <====  Auth provider ===> ");

	return (
		<Suspense fallback={<Loader className="h-full w-full" />}>
			{children}
		</Suspense>
	);
};

export default AuthProvider;
