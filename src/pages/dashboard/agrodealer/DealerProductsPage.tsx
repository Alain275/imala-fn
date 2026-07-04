import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { agroDealerMarketplaceService, AgroDealerProduct, CreateProductInput } from "@/services/agroDealerMarketplace.service";
import agroDealerProfileService, { AgroDealerProfileData } from "@/services/agroDealerProfile.service";
import { authService } from "@/services/auth";

const initialForm: CreateProductInput = {
  name: "",
  category: "manure",
  description: "",
  price: "",
  quantity: "",
  unit: "",
  location: "",
  district: "",
  isAvailable: true,
  principalImage: null,
  images: [],
};

const CATEGORY_LABELS: Record<string, string> = {
  manure: "Manure",
  fertilizer: "Fertilizer",
  pesticide: "Pesticide / Drug",
  seed: "Seed",
  veterinary: "Veterinary",
  other: "Other",
};

export default function DealerProductsPage() {
  const currentUser = authService.getCurrentUser();
  const [products, setProducts] = useState<AgroDealerProduct[]>([]);
  const [form, setForm] = useState<CreateProductInput>(initialForm);
  const [profile, setProfile] = useState<AgroDealerProfileData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AgroDealerProduct | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    try {
      const [myProducts, profileResponse] = await Promise.all([
        agroDealerMarketplaceService.getMyProducts(),
        agroDealerProfileService.getProfile(),
      ]);
      setProducts(myProducts);
      const profile = profileResponse.data;
      setProfile(profile);
      setForm((prev) => ({
        ...prev,
        category:
          (profile.categories?.[0] as CreateProductInput["category"] | undefined) ||
          prev.category,
        location: prev.location || profile.physicalAddress || currentUser?.location || "",
        district: prev.district || profile.district || "",
      }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load your products");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit() {
    setSaving(true);
    setStatus(null);
    try {
      const created = await agroDealerMarketplaceService.createProduct(form);
      setProducts((prev) => [created, ...prev]);
      setForm((prev) => ({
        ...initialForm,
        location: prev.location,
        district: prev.district,
      }));
      setStatus("Product uploaded successfully");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to upload product");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(product: AgroDealerProduct) {
    try {
      const updated = await agroDealerMarketplaceService.updateProduct(product.id, {
        isAvailable: !product.isAvailable,
      });
      setProducts((prev) => prev.map((item) => (item.id === product.id ? updated : item)));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update product");
    }
  }

  const availableCategories = (profile?.categories || []).filter(
    (category): category is CreateProductInput["category"] =>
      Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, category)
  );

  if (currentUser?.role !== "agro-dealer") {
    return <div className="p-6">Only agro-dealers can manage product uploads.</div>;
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Input Catalog"
        subtitle="Upload manure, drugs, seeds, and other inputs with price, photos, and location."
      />

      <div className="p-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Add a new product</CardTitle>
            <CardDescription>
              Location defaults to your dealer profile so farmers can find you quickly. Product categories follow the ones you selected on your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Product name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as CreateProductInput["category"] }))}
            >
              {(availableCategories.length > 0 ? availableCategories : (Object.keys(CATEGORY_LABELS) as CreateProductInput["category"][])).map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
            <Textarea placeholder="Describe the product and its use." value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Price (RWF)" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
              <Input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))} />
              <Input placeholder="Unit e.g. bag, kg, litre" value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} />
              <Input placeholder="District" value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} />
            </div>
            <Input placeholder="Location / address" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
            <div className="space-y-2">
              <label className="text-sm font-medium">Principal image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((prev) => ({ ...prev, principalImage: e.target.files?.[0] || null }))}
                className="block w-full text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Other images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setForm((prev) => ({ ...prev, images: Array.from(e.target.files || []) }))}
                className="block w-full text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Uploading..." : "Upload product"}
              </Button>
              {status && <p className="text-sm text-muted-foreground">{status}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Your uploaded products</CardTitle>
            <CardDescription>Farmers will see these products in the marketplace and can open a chat directly from them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet. Upload your first manure or drug to start selling.</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="rounded-xl border p-4 space-y-3">
                  {product.imageUrls?.[0] ? (
                    <button type="button" className="block w-full overflow-hidden rounded-xl" onClick={() => setSelectedProduct(product)}>
                      <img
                        src={agroDealerMarketplaceService.getImageUrl(product.imageUrls[0])}
                        alt={product.name}
                        className="h-44 w-full object-cover"
                      />
                    </button>
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.location || "No location"} · {product.district || "No district"}</p>
                    </div>
                    <Badge variant={product.isAvailable ? "default" : "secondary"}>
                      {product.isAvailable ? "Available" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="text-sm">{product.description || "No description yet."}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{product.category}</span>
                    <span>{product.price} {product.currency}</span>
                    {product.quantity ? <span>{product.quantity} {product.unit || "units"}</span> : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                      View images
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleAvailability(product)}>
                      {product.isAvailable ? "Hide product" : "Make available"}
                    </Button>
                  </div>
                </div>
              ))
            )}
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
