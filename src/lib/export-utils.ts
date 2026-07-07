import { ChatSession } from "../types";

export const exportChatToMarkdown = (session: ChatSession): string => {
  let markdown = `# ${session.title}\n\n`;
  markdown += `**作成日時:** ${new Date(session.timestamp).toLocaleString("ja-JP")}\n\n`;
  markdown += `---\n\n`;

  session.messages.forEach((message, index) => {
    const role = message.role === "user" ? "👤 あなた" : "🤖 AI";
    markdown += `## ${role}\n\n`;
    markdown += `${message.content}\n\n`;

    if (message.artifacts && message.artifacts.length > 0) {
      message.artifacts.forEach((artifact) => {
        markdown += `### 📁 ${artifact.filename}\n\n`;
        markdown += `\`\`\`${artifact.language || "text"}\n`;
        markdown += `${artifact.content}\n`;
        markdown += `\`\`\`\n\n`;
      });
    }

    if (index < session.messages.length - 1) {
      markdown += `---\n\n`;
    }
  });

  return markdown;
};

export const exportChatToJSON = (session: ChatSession): string => {
  return JSON.stringify(session, null, 2);
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
