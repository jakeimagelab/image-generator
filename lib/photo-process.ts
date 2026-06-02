import sharp from "sharp";

export async function addFilmTexture(base64: string): Promise<string> {
  const input = Buffer.from(base64, "base64");
  const { width = 1792, height = 1024 } = await sharp(input).metadata();

  // 1. 필름 그레인 (노이즈 레이어 SVG)
  const grainSvg = `
    <svg width="${width}" height="${height}">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feBlend in="SourceGraphic" mode="overlay" result="blend"/>
        <feComposite in="blend" in2="SourceGraphic" operator="in"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" opacity="0.08"/>
    </svg>`;

  // 2. 비네팅 (주변부 어둡게)
  const vignetteSvg = `
    <svg width="${width}" height="${height}">
      <defs>
        <radialGradient id="v" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stop-color="black" stop-opacity="0"/>
          <stop offset="100%" stop-color="black" stop-opacity="0.35"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#v)"/>
    </svg>`;

  const processed = await sharp(input)
    // 약간의 웜톤 (실제 사진 느낌)
    .modulate({ brightness: 0.97, saturation: 0.92 })
    // 약간의 언샤프 마스크 (렌즈 해상도 느낌)
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.3 })
    // 그레인 + 비네팅 합성
    .composite([
      { input: Buffer.from(grainSvg), blend: "overlay" },
      { input: Buffer.from(vignetteSvg), blend: "multiply" },
    ])
    // JPEG 저장 (PNG보다 사진 느낌)
    .jpeg({ quality: 88, chromaSubsampling: "4:2:0" })
    .toBuffer();

  return processed.toString("base64");
}
