export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-y-6 h-screen w-full items-center justify-center">
      {children}
    </div>
  );
}
