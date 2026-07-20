export default function MaterialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="material-page-shell">{children}</div>;
}
