import Image from "next/image";
import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { Nav } from "./components/Nav";

import "./styles/globals.css";
import styles from "./styles/layout.module.css";

interface Props {
  readonly children: ReactNode;
}
export const metadata = {
  title: 'Noah Rijkaard',
  description: 'A little portfolio site for Noah Rijkaard',
  openGraph: {
    title: 'Noah Rijkaard',
    description: 'A little portfolio site for Noah Rijkaard',
    images: [
      {
        url: '/portfolio showcase.gif', 
        width: 800,
        height: 600,
        alt: 'Noah Rijkaard Portfolio Preview',
      },
    ],
  },
}
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
          />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta
          property="og:image:width"
          content={metadata.openGraph.images[0].width.toString()}
          />
        <meta
          property="og:image:height"
          content={metadata.openGraph.images[0].height.toString()}
          />
        <meta
          property="og:image:alt"
          content={metadata.openGraph.images[0].alt}
          />
      </head>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
