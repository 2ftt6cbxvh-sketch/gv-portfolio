/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/unity/:path*.br",
        headers: [{ key: "Content-Encoding", value: "br" }],
      },
      {
        source: "/unity/:path*.wasm.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
      {
        source: "/unity/:path*.gz",
        headers: [{ key: "Content-Encoding", value: "gzip" }],
      },
    ];
  },
};

export default nextConfig;
