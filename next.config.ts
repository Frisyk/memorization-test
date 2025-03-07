module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/audio/:path*",
        destination: "https://equran.nos.wjv-1.neo.id/audio-partial/:path*",
      },
    ];
  },
};
