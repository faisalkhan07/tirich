import type { Metadata } from "next";
import JamCard from "@/components/shop/JamCard";
import { catalog } from "@/lib/content";
import { getJams } from "@/lib/products";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Jams",
  description: "Chitrali apricot, mulberry and apple jam. Order online, pay cash on delivery.",
};

export default async function JamsPage() {
  const jams = await getJams();
  return (
    <div className="container">
      <h1 className="page-title">{catalog.jamsTitle}</h1>
      <p className="page-lead">{catalog.jamsLead}</p>
      {jams.length ? (
        <div className="card-grid">
          {jams.map((jam) => (
            <JamCard key={jam.id} jam={jam} />
          ))}
        </div>
      ) : (
        <p className="empty">{catalog.jamsEmpty}</p>
      )}
    </div>
  );
}
