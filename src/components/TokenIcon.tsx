interface TokenIconProps {
  icon?: string;
  className?: string;
}

function isImageIcon(icon: string): boolean {
  return icon.startsWith('/') || icon.endsWith('.png') || icon.endsWith('.svg');
}

export function TokenIcon({ icon, className = 'token-icon' }: TokenIconProps) {
  if (!icon) {
    return (
      <span className={className} aria-hidden="true">
        •
      </span>
    );
  }

  if (isImageIcon(icon)) {
    return (
      <span className={className} aria-hidden="true">
        <img src={icon} alt="" className="token-icon-img" draggable={false} />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      {icon}
    </span>
  );
}