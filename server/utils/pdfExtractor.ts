/**
 * PDF Text Extractor
 * Extracts text content from PDF files
 */

/**
 * 从 Base64 编码的 PDF 中提取文本
 * 注意：这是一个简化版本，实际生产环境应该使用专业的 PDF 解析库
 */
export async function extractTextFromPDF(base64Content: string): Promise<string> {
  try {
    // 移除 data URL 前缀（如果有）
    const base64Data = base64Content.replace(/^data:application\/pdf;base64,/, '');
    
    // 在实际生产环境中，这里应该使用 pdf-parse 或类似库
    // 由于当前环境限制，我们返回一个提示信息
    console.log('[PDF] PDF text extraction is not fully implemented yet');
    console.log('[PDF] File size:', base64Data.length, 'characters');
    
    // 临时方案：返回提示信息
    return `[PDF 文本提取功能开发中]\n\n由于技术限制，当前无法自动提取 PDF 文本内容。\n请在上传时手动输入论文的引言部分，或提供论文的主要内容摘要。\n\n建议包含：\n1. 研究背景和动机\n2. 主要贡献\n3. 方法概述\n4. 实验结果\n5. 结论`;
  } catch (error) {
    console.error('[PDF] Error extracting text:', error);
    return '';
  }
}

/**
 * 从 URL 下载 PDF 并提取文本
 */
export async function extractTextFromPDFUrl(url: string): Promise<string> {
  try {
    console.log('[PDF] Downloading PDF from:', url);
    
    // 下载 PDF
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // 提取文本
    return await extractTextFromPDF(`data:application/pdf;base64,${base64}`);
  } catch (error) {
    console.error('[PDF] Error downloading/extracting PDF:', error);
    return '';
  }
}

/**
 * 智能提取论文关键部分
 * 尝试提取摘要、引言、方法、结果等关键章节
 */
export function extractKeySection(fullText: string, maxLength: number = 8000): string {
  if (!fullText || fullText.length === 0) {
    return '';
  }
  
  // 如果文本较短，直接返回
  if (fullText.length <= maxLength) {
    return fullText;
  }
  
  // 尝试提取关键章节
  const sections = [
    'abstract',
    'introduction',
    'method',
    'methodology',
    'approach',
    'results',
    'conclusion',
  ];
  
  let extractedText = '';
  const lowerText = fullText.toLowerCase();
  
  for (const section of sections) {
    const sectionIndex = lowerText.indexOf(section);
    if (sectionIndex !== -1) {
      // 提取该章节及其后续内容（最多 2000 字符）
      const sectionText = fullText.substring(sectionIndex, sectionIndex + 2000);
      extractedText += sectionText + '\n\n';
      
      if (extractedText.length >= maxLength) {
        break;
      }
    }
  }
  
  // 如果没有找到章节，返回前 maxLength 字符
  if (extractedText.length === 0) {
    extractedText = fullText.substring(0, maxLength);
  }
  
  return extractedText.substring(0, maxLength);
}
