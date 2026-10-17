import type { StaticPage } from "@/lib/content";

export default function StaticPageView({
  page,
  children,
}: {
  page: StaticPage;
  children?: React.ReactNode;
}) {
  return (
    <article className="container" style={{ maxWidth: "70ch" }}>
      <h1 className="page-title">{page.title}</h1>
      {page.sections.map((s, i) => (
        <section key={i}>
          {s.heading ? <h2>{s.heading}</h2> : null}
          <p>{s.body}</p>
        </section>
      ))}
      {children}
    </article>
  );
}
