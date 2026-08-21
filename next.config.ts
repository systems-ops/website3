import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its standard-font .afm files from disk relative to its own
  // __dirname at runtime; bundling it rewrites __dirname to a path that
  // doesn't exist. Keeping it external makes Node require() it straight
  // from node_modules instead, where those files actually are.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
