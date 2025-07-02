import { PCFImageContent, PcfImage } from '..';

export function ProductSection({ pcfImages }: { pcfImages: PcfImage[] }) {
  const yLimit = 450;

  if (pcfImages.length <= 0) {
    return (
      <table className="border-full">
        <tbody>
          <tr>
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
          { length: Math.ceil(pcfImages.length / 2) },
          (_, i) => i,
        ).map((i) => (
          <tr key={i} className="pagebreak">
            <td className="border-r">
              <div className="image-container">
                <PCFImageContent
                  key={i * 2}
                  pcfImage={pcfImages[i * 2]}
                  maxWidth={yLimit}
                />
                <span />
              </div>
            </td>
            <td>
              <div className="image-container">
                {pcfImages[i * 2 + 1] && (
                  <PCFImageContent
                    key={i * 2 + 1}
                    pcfImage={pcfImages[i * 2 + 1]}
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
