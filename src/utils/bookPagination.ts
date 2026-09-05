import type { ChatMessage, JournalEntry } from '../types/index';

/**
 * Splits journal entry body text into natural book pages respecting
 * paragraphs, sentences, and readable line lengths.
 */
export function paginateText(
  text: string,
  firstPageWords: number = 130,
  nextPageWords: number = 170,
): string[] {
  if (!text || text.trim().length === 0) {
    return [''];
  }

  const cleanText = text.trim();
  const paragraphs = cleanText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  if (paragraphs.length === 0) {
    return [cleanText];
  }

  const pages: string[] = [];
  let currentPageParagraphs: string[] = [];
  let currentWordCount = 0;

  const getLimit = (pageIndex: number) =>
    pageIndex === 0 ? firstPageWords : nextPageWords;

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).filter(Boolean).length;
    const limit = getLimit(pages.length);

    if (currentWordCount + paraWords <= limit) {
      currentPageParagraphs.push(para);
      currentWordCount += paraWords;
      continue;
    }

    if (currentPageParagraphs.length > 0) {
      pages.push(currentPageParagraphs.join('\n\n'));
      currentPageParagraphs = [];
      currentWordCount = 0;
    }

    const currentLimit = getLimit(pages.length);

    if (paraWords > currentLimit) {
      const sentenceRegex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
      const sentences = para.match(sentenceRegex) || [para];

      for (const rawSentence of sentences) {
        const sentence = rawSentence.trim();
        if (!sentence) continue;

        const sentenceWords = sentence.split(/\s+/).filter(Boolean).length;
        const pageLimit = getLimit(pages.length);

        if (currentWordCount + sentenceWords > pageLimit && currentPageParagraphs.length > 0) {
          pages.push(currentPageParagraphs.join('\n\n'));
          currentPageParagraphs = [];
          currentWordCount = 0;
        }

        currentPageParagraphs.push(sentence);
        currentWordCount += sentenceWords;
      }
    } else {
      currentPageParagraphs.push(para);
      currentWordCount += paraWords;
    }
  }

  if (currentPageParagraphs.length > 0) {
    pages.push(currentPageParagraphs.join('\n\n'));
  }

  return pages.length > 0 ? pages : [cleanText];
}

/**
 * Splits conversation transcript into natural pages.
 */
export function paginateConversation(
  messages: ChatMessage[],
  firstPageCount: number = 2,
  nextPageCount: number = 3,
): ChatMessage[][] {
  if (!messages || messages.length === 0) {
    return [[]];
  }

  const pages: ChatMessage[][] = [];
  let remaining = [...messages];

  pages.push(remaining.slice(0, firstPageCount));
  remaining = remaining.slice(firstPageCount);

  while (remaining.length > 0) {
    pages.push(remaining.slice(0, nextPageCount));
    remaining = remaining.slice(nextPageCount);
  }

  return pages;
}

/**
 * Calculates total internal pages for a given journal entry.
 */
export function getEntryPageCount(entry: JournalEntry | undefined): number {
  if (!entry) return 1;

  if (entry.mode === 'conversation' && entry.conversation && entry.conversation.length > 0) {
    const pages = paginateConversation(entry.conversation);
    return Math.max(1, pages.length);
  }

  const pages = paginateText(entry.originalContent || '');
  return Math.max(1, pages.length);
}
