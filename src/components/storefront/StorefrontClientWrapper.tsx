"use client";

import { useState } from "react";
import { CartProvider, useCart } from "@/context/CartContext";
import StoreNavbar from "./StoreNavbar";
import HeroSection from "./HeroSection";
import ProductGrid from "./ProductGrid";
import StoreFooter from "./StoreFooter";
import CartDrawer from "./CartDrawer";
import OrderModal from "./OrderModal";

interface StorefrontClientWrapperProps {
  store: {
    id: number | string;
    subdomain: string;
    name: string;
    description: string | null;
    tagline: string | null;
    decorative_text: string | null;
    video_url: string | null;
    banner_url: string | null;
  };
  products: any[];
}

function StorefrontInner({ store, products }: StorefrontClientWrapperProps) {
  const { items, totalItems, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [isCartCheckoutOpen, setIsCartCheckoutOpen] = useState(false);

  const handleStartCartCheckout = () => {
    setIsCartOpen(false);
    setIsCartCheckoutOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Storefront Navbar with Live Cart Count */}
      <StoreNavbar
        storeName={store.name}
        subdomain={store.subdomain}
        cartCount={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection
        storeName={store.name}
        description={store.description}
        tagline={store.tagline}
        decorativeText={store.decorative_text}
        videoUrl={store.video_url}
        bannerUrl={store.banner_url}
      />

      {/* Products Grid */}
      <main className="flex-1 w-full">
        <ProductGrid
          products={products}
          storeName={store.name}
          storeId={store.id}
          subdomain={store.subdomain}
        />
      </main>

      {/* Store Footer */}
      <StoreFooter storeName={store.name} subdomain={store.subdomain} />

      {/* Slide-out Cart Drawer */}
      <CartDrawer onCheckout={handleStartCartCheckout} />

      {/* Cart Checkout Modal (Unified Multi-Item Order) */}
      {isCartCheckoutOpen && items.length > 0 && (
        <OrderModal
          cartItems={items}
          storeName={store.name}
          storeId={store.id}
          subdomain={store.subdomain}
          onClose={() => setIsCartCheckoutOpen(false)}
          onOrderSuccess={() => {
            clearCart();
          }}
        />
      )}
    </div>
  );
}

export default function StorefrontClientWrapper({
  store,
  products,
}: StorefrontClientWrapperProps) {
  return (
    <CartProvider subdomain={store.subdomain}>
      <StorefrontInner store={store} products={products} />
    </CartProvider>
  );
}
