// Metro turns an imported image into an asset id that <Image source={…}> accepts.
declare module '*.png' {
  const asset: number;
  export default asset;
}
