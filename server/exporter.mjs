import { Document, Packer, Paragraph, TextRun } from "docx";

const markdownToPlainText = (content) =>
  String(content || "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1");

export const buildTxtExport = ({ project, chapters }) =>
  [
    project.title,
    "",
    ...chapters.flatMap((chapter) => [
      chapter.title,
      "",
      markdownToPlainText(chapter.content),
      "",
    ]),
  ].join("\n");

export const buildMarkdownExport = ({ project, chapters }) =>
  [
    `# ${project.title}`,
    "",
    ...chapters.flatMap((chapter) => [
      `## ${chapter.title}`,
      "",
      chapter.content || chapter.summary || "",
      "",
    ]),
  ].join("\n");

export const buildDocxExport = async ({ project, chapters }) => {
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: project.title, bold: true, size: 36 })],
          }),
          ...chapters.flatMap((chapter) => [
            new Paragraph({
              spacing: { before: 320, after: 160 },
              children: [new TextRun({ text: chapter.title, bold: true, size: 28 })],
            }),
            ...String(chapter.content || chapter.summary || "")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map(
                (paragraph) =>
                  new Paragraph({
                    spacing: { after: 160 },
                    children: [new TextRun(markdownToPlainText(paragraph))],
                  }),
              ),
          ]),
        ],
      },
    ],
  });

  return Packer.toBuffer(document);
};
