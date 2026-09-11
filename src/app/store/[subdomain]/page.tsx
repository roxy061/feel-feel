import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import StorefrontClient from "./StorefrontClient";

export default async function StorePage({
  params,
}: {
  params: { subdomain: string };
}) {
  const { subdomain } = params;

  const store = await db.store.findUnique({
    where: { subdomain },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) {
    notFound();
  }

  return <StorefrontClient store={store} />;
}
