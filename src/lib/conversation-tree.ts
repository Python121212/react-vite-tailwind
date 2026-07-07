/**
 * 会話ツリー管理システム
 * 「ここから別ルート」機能
 */

import { Message } from "../types";

export interface ConversationNode {
  id: string;
  message: Message;
  parentId: string | null;
  children: string[];
  timestamp: number;
}

export interface ConversationTree {
  rootId: string;
  nodes: Map<string, ConversationNode>;
  currentPath: string[];
}

export class ConversationTreeManager {
  private trees: Map<string, ConversationTree> = new Map();

  /**
   * 新しいツリーを作成
   */
  createTree(sessionId: string, rootMessage: Message): void {
    const rootNode: ConversationNode = {
      id: rootMessage.id,
      message: rootMessage,
      parentId: null,
      children: [],
      timestamp: Date.now(),
    };

    const tree: ConversationTree = {
      rootId: rootMessage.id,
      nodes: new Map([[rootMessage.id, rootNode]]),
      currentPath: [rootMessage.id],
    };

    this.trees.set(sessionId, tree);
  }

  /**
   * メッセージを追加
   */
  addMessage(sessionId: string, message: Message, parentId?: string): void {
    const tree = this.trees.get(sessionId);
    if (!tree) {
      this.createTree(sessionId, message);
      return;
    }

    const actualParentId = parentId || tree.currentPath[tree.currentPath.length - 1];
    const parentNode = tree.nodes.get(actualParentId);

    if (!parentNode) {
      console.error("親ノードが見つかりません:", actualParentId);
      return;
    }

    const newNode: ConversationNode = {
      id: message.id,
      message,
      parentId: actualParentId,
      children: [],
      timestamp: Date.now(),
    };

    tree.nodes.set(message.id, newNode);
    parentNode.children.push(message.id);
    tree.currentPath.push(message.id);
  }

  /**
   * 分岐を作成（特定メッセージから別ルート）
   */
  createBranch(sessionId: string, fromMessageId: string): string[] {
    const tree = this.trees.get(sessionId);
    if (!tree) return [];

    const node = tree.nodes.get(fromMessageId);
    if (!node) return [];

    // fromMessageIdまでのパスを再構築
    const newPath: string[] = [];
    let currentId: string | null = fromMessageId;

    while (currentId) {
      newPath.unshift(currentId);
      const currentNode = tree.nodes.get(currentId);
      currentId = currentNode?.parentId || null;
    }

    tree.currentPath = newPath;
    return newPath;
  }

  /**
   * 現在のパスのメッセージ一覧を取得
   */
  getCurrentMessages(sessionId: string): Message[] {
    const tree = this.trees.get(sessionId);
    if (!tree) return [];

    return tree.currentPath
      .map(id => tree.nodes.get(id)?.message)
      .filter((msg): msg is Message => msg !== undefined);
  }

  /**
   * 子ノード一覧を取得
   */
  getChildren(sessionId: string, messageId: string): ConversationNode[] {
    const tree = this.trees.get(sessionId);
    if (!tree) return [];

    const node = tree.nodes.get(messageId);
    if (!node) return [];

    return node.children
      .map(id => tree.nodes.get(id))
      .filter((node): node is ConversationNode => node !== undefined);
  }

  /**
   * ツリー全体を取得
   */
  getTree(sessionId: string): ConversationTree | undefined {
    return this.trees.get(sessionId);
  }

  /**
   * ノード削除
   */
  deleteNode(sessionId: string, messageId: string): void {
    const tree = this.trees.get(sessionId);
    if (!tree) return;

    const node = tree.nodes.get(messageId);
    if (!node || !node.parentId) return;

    // 親から削除
    const parent = tree.nodes.get(node.parentId);
    if (parent) {
      parent.children = parent.children.filter(id => id !== messageId);
    }

    // 子ノードも再帰的に削除
    const deleteRecursive = (id: string) => {
      const n = tree.nodes.get(id);
      if (n) {
        n.children.forEach(deleteRecursive);
        tree.nodes.delete(id);
      }
    };

    deleteRecursive(messageId);
  }

  /**
   * ツリー削除
   */
  deleteTree(sessionId: string): void {
    this.trees.delete(sessionId);
  }
}

export const conversationTreeManager = new ConversationTreeManager();
