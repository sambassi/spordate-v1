'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCardSkeleton() {
  return (
    <Card className="relative bg-card border-border/20 shadow-lg rounded-2xl overflow-hidden">
      <div className="relative h-96 w-full">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute bottom-4 left-4 space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <Skeleton className="h-6 w-20 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="mb-4">
          <Skeleton className="h-6 w-12 mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PartnerCardSkeleton() {
  return (
    <Card className="bg-card/50 border-border/20">
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-4" />
      </CardContent>
    </Card>
  );
}
