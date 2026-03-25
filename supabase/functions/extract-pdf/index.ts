import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No PDF file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Extract text from PDF using raw parsing (no external deps needed)
    const text = extractTextFromPDF(bytes);
    
    // Split into chapters based on common patterns
    const chapters = splitIntoChapters(text);

    return new Response(JSON.stringify({ 
      success: true, 
      rawText: text,
      chapters,
      fileName: file.name 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to extract PDF content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractTextFromPDF(bytes: Uint8Array): string {
  const content = new TextDecoder('latin1').decode(bytes);
  const textBlocks: string[] = [];

  // Extract text from PDF stream objects
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;

  while ((match = streamRegex.exec(content)) !== null) {
    const streamContent = match[1];
    // Look for text operators in PDF content streams
    const textOps = extractTextOperators(streamContent);
    if (textOps) textBlocks.push(textOps);
  }

  // Also try extracting from BT/ET blocks directly
  const btRegex = /BT\s([\s\S]*?)ET/g;
  while ((match = btRegex.exec(content)) !== null) {
    const blockText = extractTextFromBlock(match[1]);
    if (blockText.trim()) textBlocks.push(blockText);
  }

  // If raw extraction didn't work well, try simple string extraction
  if (textBlocks.join('').trim().length < 50) {
    return extractSimpleText(content);
  }

  return textBlocks.join('\n').replace(/\s+/g, ' ').trim();
}

function extractTextOperators(stream: string): string {
  const parts: string[] = [];
  // Match text show operators: Tj, TJ, ', "
  const tjRegex = /\(([^)]*)\)\s*Tj/g;
  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  
  let m;
  while ((m = tjRegex.exec(stream)) !== null) {
    parts.push(decodeEscapes(m[1]));
  }
  while ((m = tjArrayRegex.exec(stream)) !== null) {
    const inner = m[1];
    const strings = inner.match(/\(([^)]*)\)/g);
    if (strings) {
      parts.push(strings.map(s => decodeEscapes(s.slice(1, -1))).join(''));
    }
  }
  return parts.join(' ');
}

function extractTextFromBlock(block: string): string {
  return extractTextOperators(block);
}

function decodeEscapes(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\([()])/g, '$1');
}

function extractSimpleText(content: string): string {
  // Fallback: extract readable strings from PDF
  const readable: string[] = [];
  const regex = /\(([^\\)]{2,})\)/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const text = m[1].trim();
    if (text.length > 3 && /[a-zA-Z\u0600-\u06FF]/.test(text)) {
      readable.push(text);
    }
  }
  return readable.join('\n');
}

function splitIntoChapters(text: string): Array<{ title: string; content: string[] }> {
  if (!text.trim()) {
    return [{ title: "Babi Na 1", content: ["(Ba a iya fitar da rubutu daga wannan PDF)"] }];
  }

  // Try splitting by common chapter patterns
  const lines = text.split('\n').filter(l => l.trim());
  const chapters: Array<{ title: string; content: string[] }> = [];
  
  // Patterns for chapter headings
  const chapterPattern = /^(babi|chapter|sura|fasali|kashi)\s*(na\s*)?\d+/i;
  
  let currentChapter: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    if (chapterPattern.test(line.trim()) || (line.length < 80 && line === line.toUpperCase() && line.length > 5)) {
      if (currentChapter && currentChapter.content.length > 0) {
        chapters.push(currentChapter);
      }
      currentChapter = { title: line.trim(), content: [] };
    } else {
      if (!currentChapter) {
        currentChapter = { title: "Babi Na 1", content: [] };
      }
      currentChapter.content.push(line.trim());
    }
  }

  if (currentChapter && currentChapter.content.length > 0) {
    chapters.push(currentChapter);
  }

  if (chapters.length === 0) {
    // Split by paragraphs if no chapters detected
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const chunkSize = Math.ceil(paragraphs.length / Math.max(1, Math.floor(paragraphs.length / 5)));
    
    for (let i = 0; i < paragraphs.length; i += chunkSize) {
      const chunk = paragraphs.slice(i, i + chunkSize);
      chapters.push({
        title: `Babi Na ${chapters.length + 1}`,
        content: chunk.map(p => p.trim()),
      });
    }
  }

  return chapters.length > 0 ? chapters : [{ title: "Babi Na 1", content: [text] }];
}
