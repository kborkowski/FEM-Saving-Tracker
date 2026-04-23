import { interBase64 } from './fonts/inter-base64';
import { bricolageBase64 } from './fonts/bricolage-base64';

function base64ToBlobUrl(base64: string, mimeType: string): string {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function loadFonts(): void {
  try {
    const interUrl = base64ToBlobUrl(interBase64, 'font/woff2');
    const bricolageUrl = base64ToBlobUrl(bricolageBase64, 'font/woff2');

    const inter = new FontFace('Inter', `url(${interUrl})`, {
      weight: '100 900',
      style: 'normal',
    });

    const bricolage = new FontFace('Bricolage Grotesque', `url(${bricolageUrl})`, {
      weight: '200 800',
      style: 'normal',
    });

    Promise.all([inter.load(), bricolage.load()])
      .then(([interLoaded, bricolageLoaded]) => {
        document.fonts.add(interLoaded);
        document.fonts.add(bricolageLoaded);
      })
      .catch((err) => {
        console.error('[Fonts] Failed to load via blob URL:', err);
        // Fallback: inject @font-face data: URI (may be blocked by CSP but worth trying)
        injectFontFaceDataUri(interBase64, 'Inter', '100 900', bricolageBase64);
      });
  } catch (err) {
    console.error('[Fonts] Font loader error:', err);
  }
}

function injectFontFaceDataUri(interB64: string, _family: string, _weight: string, brigB64: string): void {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      src: url('data:font/woff2;base64,${interB64}') format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Bricolage Grotesque';
      src: url('data:font/woff2;base64,${brigB64}') format('woff2');
      font-weight: 200 800;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}
