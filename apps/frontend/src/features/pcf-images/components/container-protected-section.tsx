import { PCFImageContent, PcfImage } from '..';

export function ProtectedSection({ pcfImages }: { pcfImages: PcfImage[] }) {
  const yLimit = 320;

  if (pcfImages.length <= 0) {
    return (
      <table
        className="border-full"
        style={{
          pageBreakInside: 'auto',
        }}
      >
        <tbody>
          <tr>
            <td className="border-r">
              <div className="image-container" style={{ height: '200px' }} />
            </td>
            <td className="border-r">
              <div className="image-container" style={{ height: '200px' }} />
            </td>
            <td>
              <div className="image-container" style={{ height: '200px' }} />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
  return (
    <table
      className="border-full"
      style={{
        pageBreakInside: 'auto',
      }}
    >
      <tbody>
        {Array.from(
          { length: Math.ceil(pcfImages.length / 3) },
          (_, i) => i,
        ).map((i) => (
          <tr key={i} className="pagebreak">
            <td className="border-r">
              <div className="image-container">
                <PCFImageContent
                  key={i * 3}
                  pcfImage={pcfImages[i * 3]}
                  maxWidth={yLimit}
                />
                <span />
              </div>
            </td>
            <td className="border-r">
              <div className="image-container">
                {pcfImages[i * 3 + 1] && (
                  <PCFImageContent
                    key={i * 3 + 1}
                    pcfImage={pcfImages[i * 3 + 1]}
                    maxWidth={yLimit}
                  />
                )}
                <span />
              </div>
            </td>
            <td>
              <div className="image-container">
                {pcfImages[i * 3 + 2] && (
                  <PCFImageContent
                    key={i * 3 + 2}
                    pcfImage={pcfImages[i * 3 + 2]}
                    maxWidth={yLimit}
                  />
                )}
                <span />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
