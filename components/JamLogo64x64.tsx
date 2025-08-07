export const JamLogo64x64 = () => {
  const logoUrl = "https://storage.googleapis.com/jam-assets/jam-logo.webp";

  return (
    <img
      src={logoUrl}
      className="rounded-xl overflow-hidden ring-1 ring-gray-400/10 shadow-md"
      alt="Jam Logo"
      width={64}
      height={64}
    />
  );
};
