export default function WalletIllustration({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="12" width="40" height="28" rx="6" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="4" y="12" width="40" height="10" rx="5" fill="#FFFFFF" />
      <circle cx="34" cy="27" r="5" fill="#14B8A6" />
      <circle cx="34" cy="27" r="2.2" fill="#FFFFFF" fillOpacity="0.7" />
      <path d="M4 18 L44 18" stroke="#0D9488" strokeOpacity="0.15" strokeWidth="1.5" />
    </svg>
  );
}