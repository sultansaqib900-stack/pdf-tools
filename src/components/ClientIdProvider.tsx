"use client";

import { useEffect } from "react";

export default function ClientIdProvider() {
  useEffect(() => {
    const key = "pdftools_client_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
  }, []);

  return null;
}
