import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, ImageOff, Trash2 } from "lucide-react";
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

type SortOption = "newest" | "name" | "priceLow" | "priceHigh" | "stockLow";
type AvailabilityFilter = "all" | "available" | "hidden";

export default function DealerProductsPage() {
  const currentUser = authService.getCurrentUser();
  const [products, setProducts] = useState<AgroDealerProduct[]>([]);
  const [profile, setProfile] = useState<AgroDealerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  // Toolbar state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AgroDealerProduct | null>(null);
  const [form, setForm] = useState<CreateProductInput>(initialForm);
  const [saving, setSaving] = useState(false);

  // Image viewer modal
  const [selectedProduct, setSelectedProduct] = useState<AgroDealerProduct | null>(null);

  // Delete confirmation
  const [productToDelete, setProductToDelete] = useState<AgroDealerProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

 async function loadProducts() {
  setLoading(true);
  setStatus(null);

  const [productsResult, profileResult] = await Promise.allSettled([
    agroDealerMarketplaceService.getMyProducts(),
    agroDealerProfileService.getProfile(),
  ]);

  if (productsResult.status === "fulfilled") {
    setProducts(productsResult.value);
  } else {
    setStatus(productsResult.reason instanceof Error ? productsResult.reason.message : "Failed to load your products");
  }

  if (profileResult.status === "fulfilled") {
    setProfile(profileResult.value.data);
  }
  // profile load failing silently is fine here — it only affects the default
  // category/location prefill on the Add Product form, not the products grid.

  setLoading(false);
}

  useEffect(() => {
    loadProducts();
  }, []);

  const availableCategories = (profile?.categories || []).filter(
    (category): category is CreateProductInput["category"] =>
      Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, category)
  );
  const categoryOptions = availableCategories.length > 0 ? availableCategories : (Object.keys(CATEGORY_LABELS) as CreateProductInput["category"][]);

  function openAddForm() {
    setEditingProduct(null);
    setForm({
      ...initialForm,
      category: categoryOptions[0] || "manure",
      location: profile?.physicalAddress || currentUser?.location || "",
      district: profile?.district || "",
    });
    setFormOpen(true);
  }

  function openEditForm(product: AgroDealerProduct) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category as CreateProductInput["category"],
      description: product.description || "",
      price: String(product.price ?? ""),
      quantity: product.quantity !== undefined && product.quantity !== null ? String(product.quantity) : "",
      unit: product.unit || "",
      location: product.location || "",
      district: product.district || "",
      isAvailable: product.isAvailable,
      principalImage: null,
      images: [],
    });
    setFormOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setStatus(null);
    try {
      if (editingProduct) {
        const updated = await agroDealerMarketplaceService.updateProduct(editingProduct.id, {
          name: form.name,
          category: form.category,
          description: form.description,
          price: Number(form.price),
          quantity: form.quantity !== "" ? Number(form.quantity) : undefined,
          unit: form.unit,
          location: form.location,
          district: form.district,
          isAvailable: form.isAvailable,
        });
        setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setStatus("Product updated successfully");
      } else {
        const created = await agroDealerMarketplaceService.createProduct(form);
        setProducts((prev) => [created, ...prev]);
        setStatus("Product uploaded successfully");
      }
      setFormOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save product");
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

  async function handleDelete() {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await agroDealerMarketplaceService.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((item) => item.id !== productToDelete.id));
      setStatus("Product deleted successfully");
      setProductToDelete(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  }

  const visibleProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (availabilityFilter !== "all") {
      list = list.filter((p) => (availabilityFilter === "available" ? p.isAvailable : !p.isAvailable));
    }

    switch (sortBy) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "priceLow":
        list.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        list.sort((a, b) => b.price - a.price);
        break;
      case "stockLow":
        list.sort((a, b) => (a.quantity ?? Infinity) - (b.quantity ?? Infinity));
        break;
      case "newest":
      default:
        list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
    }

    return list;
  }, [products, search, categoryFilter, availabilityFilter, sortBy]);

  if (currentUser?.role !== "agro-dealer") {
    return <div className="p-6">Only agro-dealers can manage product uploads.</div>;
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Input Catalog"
        subtitle="Upload manure, drugs, seeds, and other inputs with price, photos, and location."
      />

      <div className="p-3 sm:p-6 space-y-6">
        {status && (
          <Card className="border-0 shadow-sm bg-muted/50 p-12">
            <CardContent className="p-4 text-sm text-muted-foreground">{status}</CardContent>
          </Card>
        )}

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as AvailabilityFilter)}
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="newest">Newest first</option>
            <option value="name">Name (A-Z)</option>
            <option value="priceLow">Price: low to high</option>
            <option value="priceHigh">Price: high to low</option>
            <option value="stockLow">Stock: low to high</option>
          </select>

          <Button onClick={openAddForm} className="gap-2 lg:flex-shrink-0">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Product Cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm h-48 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center text-sm text-muted-foreground">
              {products.length === 0
                ? "No products yet. Click \"Add Product\" to upload your first item."
                : "No products match your search or filters."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl bg-gradient-to-br from-amber-700/70 via-amber-400/40 to-stone-100 p-[1.5px]"
              >
                <Card className="rounded-[10px] border-0 shadow-sm overflow-hidden bg-card h-full">
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.imageUrls?.[0] ? (
                      <img
                        src={agroDealerMarketplaceService.getImageUrl(product.imageUrls[0])}
                        alt={product.name}
                        className="h-28 w-full object-cover"
                      />
                    ) : (
                      <div className="h-28 w-full flex items-center justify-center bg-muted text-muted-foreground">
                        <ImageOff className="h-6 w-6" />
                      </div>
                    )}
                  </button>
                  <CardContent className="p-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-tight truncate flex-1">{product.name}</p>
                      <Badge
                        variant={product.isAvailable ? "default" : "secondary"}
                        className="flex-shrink-0 text-[9px] px-1.5 py-0 h-4 leading-4"
                      >
                        {product.isAvailable ? "Live" : "Hidden"}
                      </Badge>
                    </div>

                    <p className="text-[10px] text-muted-foreground truncate">
                      {product.location || "No location"}{product.district ? ` · ${product.district}` : ""}
                    </p>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground capitalize truncate">
                        {CATEGORY_LABELS[product.category] || product.category}
                      </span>
                      <span className="font-bold text-foreground flex-shrink-0">
                        {product.price.toLocaleString()} {product.currency}
                      </span>
                    </div>
                    {product.quantity !== undefined && product.quantity !== null && (
                      <p className="text-[10px] text-muted-foreground">
                        {product.quantity} {product.unit || "units"} in stock
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 pt-1">
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-[11px] px-2" onClick={() => openEditForm(product)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-[11px] px-2" onClick={() => toggleAvailability(product)}>
                        {product.isAvailable ? "Hide" : "Show"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setProductToDelete(product)}
                        aria-label="Delete product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit product" : "Add a new product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as CreateProductInput["category"] }))}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
              ))}
            </select>
            <Textarea
              placeholder="Describe the product and its use."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Price (RWF)" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
              <Input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))} />
              <Input placeholder="Unit e.g. bag, kg, litre" value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} />
              <Input placeholder="District" value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} />
            </div>
            <Input placeholder="Location / address" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />

            {!editingProduct && (
              <>
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
              </>
            )}
            {editingProduct && (
              <p className="text-xs text-muted-foreground">
                Images can only be set when a product is first created. To change photos, delete and re-add this product.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : editingProduct ? "Save changes" : "Upload product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Modal */}
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete <span className="font-semibold text-foreground">{productToDelete?.name}</span>.
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setProductToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}