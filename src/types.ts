// The six categories the assistant may choose from. Keeping them in one list means
// the AI prompt, the filter chips and the TypeScript type can never drift apart.
export const CATEGORIES = ['shopping', 'study', 'travel', 'payment', 'chat', 'general'] as const;
export type Category = (typeof CATEGORIES)[number];

// One row of the `screenshots` table. This is the "Model" in MVVM.
export type Screenshot = {
  id: string;              // primary key = image uri
  assetId: string | null;  // MediaLibrary id (null when imported through the picker)
  createdAt: number;       // epoch ms, used for sorting newest first
  ocrText: string | null;  // null = not analysed yet
  category: Category | null;
  summary: string | null;
  isFavorite: boolean;
  reminderAt: number | null;
  notificationId: string | null;
};

// What the AI returns for one image.
export type Analysis = {
  text: string;
  category: Category;
  summary: string;
};

export type Filter = 'all' | 'favorites' | 'reminders';
