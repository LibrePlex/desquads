"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { Desquadinator } from "@/components/desquadinator/Desquadinator";



export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div>
          <a
            href="https://libreplex.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/LibreL.png"
              alt="LibrePlex Logo"
              className={styles.vercelLogo}
              width={120}
              height={120}
              priority
            />
          </a>
        </div>
        <div>
          <a
            href="https://squads.so/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/Squads_logotype_black.png"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={180}
              height={36}
              priority
            />
          </a>
        </div>
      </div>

          <Desquadinator/>
    </main>
  );
}
