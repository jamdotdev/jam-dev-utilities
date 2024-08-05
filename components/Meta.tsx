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
  return (
    <Head>
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />
      {props.keywords && <meta name="keywords" content={props.keywords} />}
      {props.author && <meta name="author" content={props.author} />}
      {props.ogImage && <meta property="og:image" content={props.ogImage} />}
      {props.ogUrl && <meta property="og:url" content={props.ogUrl} />}
    </Head>
  );
};

export default Meta;
