"use client";

import { use } from "react";

import PageErrorView from "@/components/PageErrorView";

function fixError(error: string | string[] | undefined) {
  return Array.isArray(error) ? error[0] : error;
}

export default function Error({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const fixedError = fixError(resolvedSearchParams.error);
  return <PageErrorView error={fixedError} />;
}
