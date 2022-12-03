import { UploadFileResponse } from "../../pages/api/upload";
import { CopyBlock, dracula } from "react-code-blocks";

export interface ResultsProps {
  results: UploadFileResponse[];
}

export default function Results({ results }: ResultsProps) {
  const code = JSON.stringify(results.map((r) => r.fileUrl));
  return (
    <>
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: "4px",
          maxWidth: "80vw",
          display: "flex",
          overflowX: "auto",
          padding: "16px",
          marginBottom: 8,
        }}
      >
        {results.map((result) => (
          <img src={result.fileUrl} />
        ))}
      </div>
      <CopyBlock
        text={code}
        theme={dracula}
        language="javascript"
        showLineNumbers
        wrapLines
      />
    </>
  );
}
