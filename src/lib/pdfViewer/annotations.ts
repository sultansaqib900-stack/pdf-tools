export interface Highlight {
  type: "highlight";
  id: string;
  pageIndex: number;
  rects: { x: number; y: number; width: number; height: number }[];
  color: string;
}

export interface StickyNote {
  type: "sticky";
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface Drawing {
  type: "drawing";
  id: string;
  pageIndex: number;
  paths: { x: number; y: number }[][];
  color: string;
  width: number;
}

export type Annotation = Highlight | StickyNote | Drawing;

export type ToolType = "cursor" | "highlight" | "sticky" | "draw";

export class AnnotationStore {
  private annotations: Annotation[] = [];
  private undoStack: Annotation[][] = [];
  private redoStack: Annotation[][] = [];
  private maxHistory = 50;

  getAll(): Annotation[] {
    return this.annotations;
  }

  getByPage(pageIndex: number): Annotation[] {
    return this.annotations.filter((a) => a.pageIndex === pageIndex);
  }

  add(annotation: Annotation): void {
    this.undoStack.push([...this.annotations]);
    if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
    this.redoStack = [];
    this.annotations.push(annotation);
  }

  update(id: string, updates: Partial<Annotation>): void {
    this.undoStack.push([...this.annotations]);
    if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
    this.redoStack = [];
    this.annotations = this.annotations.map((a) =>
      a.id === id ? ({ ...a, ...updates } as Annotation) : a
    );
  }

  remove(id: string): void {
    this.undoStack.push([...this.annotations]);
    if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
    this.redoStack = [];
    this.annotations = this.annotations.filter((a) => a.id !== id);
  }

  undo(): void {
    if (this.undoStack.length === 0) return;
    this.redoStack.push([...this.annotations]);
    this.annotations = this.undoStack.pop()!;
  }

  redo(): void {
    if (this.redoStack.length === 0) return;
    this.undoStack.push([...this.annotations]);
    this.annotations = this.redoStack.pop()!;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack.push([...this.annotations]);
    this.annotations = [];
    this.redoStack = [];
  }

  toJSON(): string {
    return JSON.stringify(this.annotations);
  }

  fromJSON(json: string): void {
    try {
      this.annotations = JSON.parse(json);
      this.undoStack = [];
      this.redoStack = [];
    } catch {}
  }
}

let idCounter = 0;
export function generateAnnotationId(): string {
  return `ann_${Date.now()}_${++idCounter}`;
}

export const ANNOTATION_COLORS = {
  yellow: "rgba(255, 255, 0, 0.3)",
  green: "rgba(0, 255, 0, 0.2)",
  blue: "rgba(0, 150, 255, 0.2)",
  pink: "rgba(255, 100, 150, 0.2)",
  orange: "rgba(255, 165, 0, 0.2)",
};
