interface ConditionalShellProps extends React.PropsWithChildren {
  condition?: boolean;
}

export function ConditionalShell({
  children,
  condition: visible,
}: ConditionalShellProps) {
  return visible ? <>{children}</> : null;
}
