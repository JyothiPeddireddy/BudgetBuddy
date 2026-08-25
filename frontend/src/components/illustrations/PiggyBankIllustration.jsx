export default function PiggyBankIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 320 320" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="160" cy="160" r="120" fill="currentColor" className="text-emerald/10" />

      {/* Falling coins */}
      <circle cx="235" cy="70" r="13" fill="#FBBF24" />
      <text x="235" y="75" fontSize="12" textAnchor="middle" fill="#B45309" fontFamily="sans-serif" fontWeight="700">$</text>
      <circle cx="195" cy="55" r="10" fill="#FCD34D" />
      <circle cx="255" cy="115" r="9" fill="#FCD34D" />
      <circle cx="215" cy="100" r="7" fill="#FDE68A" />

      {/* Piggy body */}
      <ellipse cx="150" cy="200" rx="95" ry="72" fill="#34D399" />
      {/* Legs */}
      <rect x="95" y="255" width="22" height="30" rx="8" fill="#10B981" />
      <rect x="185" y="255" width="22" height="30" rx="8" fill="#10B981" />

      {/* Snout */}
      <ellipse cx="235" cy="205" rx="26" ry="20" fill="#6EE7B7" />
      <ellipse cx="228" cy="205" rx="4.5" ry="6" fill="#0D9C6F" />
      <ellipse cx="244" cy="205" rx="4.5" ry="6" fill="#0D9C6F" />

      {/* Ear */}
      <path d="M120 140 Q108 110 140 118 Q135 135 120 140Z" fill="#10B981" />

      {/* Eye */}
      <circle cx="170" cy="180" r="6" fill="#064E3B" />

      {/* Coin slot */}
      <rect x="140" y="130" width="34" height="6" rx="3" fill="#0D9C6F" />

      {/* Tail */}
      <path d="M60 190 q-16 -6 -10 -20 q10 6 14 18Z" fill="#10B981" />

      <circle cx="80" cy="90" r="3" fill="#A7F3D0" />
      <circle cx="270" cy="180" r="3" fill="#A7F3D0" />
    </svg>
  );
}