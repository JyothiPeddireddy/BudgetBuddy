export default function WalletIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 320 320" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="160" cy="160" r="120" fill="currentColor" className="text-emerald/10" />

      {/* Cards peeking out */}
      <rect x="150" y="70" width="90" height="58" rx="10" fill="#7DD3C0" transform="rotate(-8 150 70)" />
      <rect x="160" y="80" width="90" height="58" rx="10" fill="#4FBFA8" transform="rotate(-4 160 80)" />

      {/* Wallet body */}
      <rect x="70" y="120" width="180" height="130" rx="22" fill="#10B981" />
      <rect x="70" y="150" width="180" height="14" fill="#0D9C6F" />

      {/* Wallet flap / clasp */}
      <rect x="205" y="185" width="46" height="34" rx="10" fill="#0D9C6F" />
      <circle cx="228" cy="202" r="6" fill="#FBBF24" />

      {/* Coins */}
      <circle cx="105" cy="235" r="16" fill="#FBBF24" />
      <circle cx="105" cy="235" r="16" fill="#FBBF24" />
      <text x="105" y="240" fontSize="14" textAnchor="middle" fill="#B45309" fontFamily="sans-serif" fontWeight="700">$</text>

      <circle cx="255" cy="245" r="12" fill="#FCD34D" />
      <text x="255" y="249" fontSize="11" textAnchor="middle" fill="#B45309" fontFamily="sans-serif" fontWeight="700">$</text>

      {/* Sparkles */}
      <path d="M60 90 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#7DD3C0" opacity="0.7" />
      <path d="M250 100 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#7DD3C0" opacity="0.6" />
      <circle cx="90" cy="200" r="3" fill="#A7F3D0" />
    </svg>
  );
}