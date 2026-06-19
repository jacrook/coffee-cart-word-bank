interface TokenIconProps {
  icon?: string;
  className?: string;
  tokenId?: string;
}

function isImageIcon(icon: string): boolean {
  return icon.startsWith('/') || icon.endsWith('.png') || icon.endsWith('.svg');
}

function isCupIcon(tokenId?: string): boolean {
  return tokenId?.startsWith('cup_') ?? false;
}

export function TokenIcon({ icon, className = 'token-icon', tokenId }: TokenIconProps) {
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
        <img
          src={icon}
          alt=""
          className={`token-icon-img${isCupIcon(tokenId) ? ' token-icon-img--cup' : ''}`}
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      {icon}
    </span>
  );
}