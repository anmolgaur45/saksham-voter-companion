import { GoogleAuth } from "google-auth-library";

let _auth: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (!_auth) _auth = new GoogleAuth();
  return _auth;
}

export async function getBackendAuthHeader(): Promise<string | undefined> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl || backendUrl.startsWith("http://localhost")) {
    return undefined;
  }
  const client = await getAuth().getIdTokenClient(backendUrl);
  const headers = await client.getRequestHeaders();
  return headers.get("Authorization") ?? undefined;
}
