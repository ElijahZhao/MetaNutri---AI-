import { ImageResponse } from 'next/og';

export const alt = 'MetaNutri - Precision Nutrition';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #eff6ff 100%)',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '66px',
              height: '66px',
              borderRadius: '18px',
              background: '#059669',
              color: '#ffffff',
              fontSize: '38px',
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div style={{ display: 'flex', fontSize: '36px', fontWeight: 700, color: '#065f46' }}>
            MetaNutri
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={{ display: 'flex', fontSize: '72px', fontWeight: 700, color: '#0f172a' }}>
            Precision Nutrition
          </div>
          <div style={{ display: 'flex', fontSize: '32px', color: '#475569' }}>
            Metabolic Digital Twin Platform
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          {['Genomics', 'Microbiome', 'Metabolomics'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '12px 22px',
                borderRadius: '9999px',
                background: '#d1fae5',
                color: '#065f46',
                fontSize: '24px',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
