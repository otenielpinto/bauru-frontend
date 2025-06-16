import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-9 w-80 mb-2" />
        <Skeleton className="h-5 w-60" />
      </div>

      <div className="space-y-6">
        {/* Status do Envio */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Resumo do MDFe */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <div className="space-y-3">
                    <div>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totalizadores */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
