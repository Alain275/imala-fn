import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { agroDealerMarketplaceService, AgroDealerProduct } from "@/services/agroDealerMarketplace.service";
import { authService } from "@/services/auth";

export default function DealerMarketplacePage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [products, setProducts] = useState<AgroDealerProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AgroDealerProduct | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await agroDealerMarketplaceService.getMarketplaceProducts();
        setProducts(result);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load marketplace");
      }
    }

    loadProducts();
  }, []);

  async function startChat(product: AgroDealerProduct) {
    try {
      const conversation = await agroDealerMarketplaceService.startConversation({
        agroDealerId: product.agroDealerId,
        productId: product.id,
        initialMessage: `Hello, I am interested in ${product.name}. Is it available?`,
      });
      navigate(`/dashboard/dealer-messages?conversation=${conversation.id}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to start chat");
    }
  }

  if (currentUser?.role !== "farmer") {
    return <div className="p-6">This marketplace is currently for farmers to browse dealer uploads.</div>;
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Dealer Marketplace"
        subtitle="Browse uploaded manure, drugs, and other inputs from agro-dealers near you."
      />

      <div className="p-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Available dealer uploads</CardTitle>
            <CardDescription>Open a chat with the dealer when you need price clarification, quantity, or delivery details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const image = agroDealerMarketplaceService.getImageUrl(product.imageUrls?.[0]);
              const dealerName =
                product.agroDealer?.agroDealerProfile?.businessName ||
                product.agroDealer?.name ||
                "Agro-dealer";

              return (
                <div key={product.id} className="rounded-2xl border overflow-hidden bg-card">
                  <button type="button" className="block aspect-[4/3] w-full bg-muted" onClick={() => setSelectedProduct(product)}>
                    {image ? (
                      <img src={image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
                    )}
                  </button>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{dealerName}</p>
                      </div>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{product.description || "No description provided yet."}</p>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{product.price} {product.currency}</p>
                      <p className="text-muted-foreground">{product.quantity ? `${product.quantity} ${product.unit || "units"}` : "Quantity on request"}</p>
                      <p className="text-muted-foreground">{product.location || product.agroDealer?.location || "Location not provided"}</p>
                    </div>
                    <Button className="w-full" onClick={() => startChat(product)}>
                      Chat dealer
                    </Button>
                  </div>
                </div>
              );
            })}
            {products.length === 0 ? <p className="text-sm text-muted-foreground">{status || "No uploads available yet."}</p> : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProduct?.imageUrls?.[0] ? (
              <img
                src={agroDealerMarketplaceService.getImageUrl(selectedProduct.imageUrls[0])}
                alt={selectedProduct.name}
                className="max-h-[420px] w-full rounded-xl object-cover"
              />
            ) : null}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {selectedProduct?.imageUrls?.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={agroDealerMarketplaceService.getImageUrl(image)}
                  alt={`${selectedProduct.name} ${index + 1}`}
                  className="h-28 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
