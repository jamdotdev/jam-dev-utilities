interface PageHeader {
  logoSrc: string;
  title: string;
  description: string;
}

export default function PageHeader({
  logoSrc,
  title,
  description,
}: PageHeader) {
  return (
    <div className="container text-center">
      <div className="flex justify-center items-center mb-6">
        <img
          className="rounded-2xl"
          src={logoSrc}
          width="64"
          height="64"
          alt="Logo"
        />
      </div>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-lg text-muted-foreground mb-7 leading-6 font-light">
        {description}
      </p>
    </div>
  );
}
