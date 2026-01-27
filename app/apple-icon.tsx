import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 100,
                    background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C9A962',
                    fontWeight: 'bold',
                    fontFamily: 'Georgia, serif',
                    borderRadius: '20%',
                }}
            >
                H
            </div>
        ),
        {
            ...size,
        }
    );
}
