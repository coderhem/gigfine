"use client";

import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import { useEffect } from "react";

export default function Fancybox({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    NativeFancybox.bind("[data-fancybox]", {});

    return () => {
      NativeFancybox.unbind("[data-fancybox]");
      NativeFancybox.close();
    };
  }, []);

  return <>{children}</>;
}