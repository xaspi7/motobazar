/** @type {import('next').NextConfig} */
const config={
  output:'export',
  basePath:'/motobazar',
  trailingSlash:true,
  images:{unoptimized:true},
  experimental:{cpus:2},
  poweredByHeader:false,
};
export default config;
