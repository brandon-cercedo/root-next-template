import Link, { type LinkProps } from "next/link";

interface NullableLinkProps extends Omit<LinkProps, "href"> {
  href?: string | null;
  children: React.ReactNode;
  className?: string;
}

export default function NullableLink({
  href,
  children,
  ...props
}: NullableLinkProps) {
  if (!href) {
    return <span {...props}>{children}</span>;
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
