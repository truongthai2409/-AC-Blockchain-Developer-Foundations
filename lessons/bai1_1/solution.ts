import crypto from "crypto";
import { CLIENT_RENEG_LIMIT } from "tls";

export type Block = {
  index: number;
  timestamp: string;
  transactions: any[];
  previous_hash: string;
  current_hash: string;
};

// ✍️ TODO: Viết hàm tại đây
export function isValidBlock(block: Block): boolean {
  const value = block.index + block.timestamp + JSON.stringify(block.transactions) + block.previous_hash;
  const hash = crypto.createHash('sha256').update(value).digest('hex');
  // console.log("hello")
  
  // console.log(hash);
  // console.log(block.current_hash === hash);
  return hash === block.current_hash;
  // return false; // Chỉnh lại logic
}
