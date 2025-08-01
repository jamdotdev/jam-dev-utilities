import Head from "next/head";

interface MetaProps {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  ogImage?: string;
  ogUrl?: string;
}

const Meta = (props: MetaProps) => {
  const ogImage = props.ogImage ?? "/images/utils-og-image.png";

  return (
    <Head>
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />
      <meta property="og:image" content={ogImage} />
      {props.keywords && <meta name="keywords" content={props.keywords} />}
      {props.author && <meta name="author" content={props.author} />}
      {props.ogUrl && <meta property="og:url" content={props.ogUrl} />}
      <link rel="manifest" href="../manifest.json" />
    </Head>
  );
};

export default Meta;
