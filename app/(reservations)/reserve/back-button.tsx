'use client';

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className="text-muted-foreground hover:text-foreground flex gap-x-2 items-center"
    >
      <ArrowLeft className="h-5 w-5" />
      <span>Back</span>
    </button>
  );
}
