/**
 * Use case: completion de membros (application — sem vscode).
 */

import {
  membersAfterDot,
  parseMemberAccess,
  type MemberSuggestion,
} from "../domain/members";

export function completeMembersAt(
  source: string,
  linePrefix: string
): MemberSuggestion[] {
  const access = parseMemberAccess(linePrefix);
  if (!access) return [];
  return membersAfterDot(source, access.receiver, access.memberPrefix);
}
