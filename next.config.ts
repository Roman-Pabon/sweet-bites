import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sql.js", "bcryptjs"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/sql.js/dist/**/*"],
  },
};

export default nextConfig;
