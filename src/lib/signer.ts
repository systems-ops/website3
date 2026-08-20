import { getCurrentCook } from "@/lib/session";
import { getCurrentManager } from "@/lib/manager-session";

// Most forms are signed by whichever cook is on shift; a few (Receiving Log
// intake) can also be signed by a named manager. This resolves whichever
// identity is currently signed in, cook first, so call sites that don't care
// which kind of account it is can treat them uniformly.
export type Signer =
  | { kind: "cook"; id: string; name: string; locationIds: string[] }
  | { kind: "manager"; id: string; name: string; role: string };

export async function getCurrentSigner(): Promise<Signer | null> {
  const cook = await getCurrentCook();
  if (cook) {
    return { kind: "cook", id: cook.id, name: cook.name, locationIds: cook.locations.map((l) => l.locationId) };
  }
  const manager = await getCurrentManager();
  if (manager) {
    return { kind: "manager", id: manager.id, name: manager.name, role: manager.role };
  }
  return null;
}
