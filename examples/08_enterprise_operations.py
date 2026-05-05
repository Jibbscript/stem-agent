"""
08 — Enterprise Operations

Demonstrates the enterprise-ops controls that ship with STEM Agent:

  1. Authenticated request (X-API-Key) — requires the gateway started with
     an API key provider configured.
  2. Request correlation via X-Request-Id — the ID is stable across logs,
     audit events, and metrics labels.
  3. Forbidden call handling — an unauthorized principal hitting a
     permission-guarded endpoint gets 403 and the error is audited.
  4. Prometheus /metrics scrape — reads the histogram + counter block.

Prerequisites
-------------
Start the server with:

    SECURITY_HELMET=true \\
    AUDIT_LOG_ENABLED=true \\
    METRICS_ENABLED=true \\
    # Auth config is loaded from config.yaml — set up an API key principal there.
    npm start

Then run:

    STEM_API_KEY=your-dev-key python 08_enterprise_operations.py

If the server isn't hardened yet, the script falls back to a best-effort demo
and skips the checks that require real auth. This keeps it useful as a smoke
test during incremental rollout.
"""
from __future__ import annotations

import os
import sys

import httpx

from stem_client import StemAgentClient, print_response


def header(title: str) -> None:
    print()
    print("=" * 70)
    print(f"  {title}")
    print("=" * 70)


def check_auth_enabled(client: StemAgentClient) -> bool:
    """Detect whether the server is running with auth enabled.

    We probe a protected endpoint *without* credentials and expect 401 when
    auth is active. When auth is off we still demo the non-auth bits.
    """
    try:
        r = httpx.get(f"{client.base_url}/api/v1/behavior", timeout=10)
        return r.status_code == 401
    except httpx.HTTPError:
        return False


def step_1_authenticated_call(client: StemAgentClient, auth_on: bool) -> str | None:
    header("1. Authenticated request (X-API-Key)")
    if not client.api_key and auth_on:
        print("[!] STEM_API_KEY not set but the server requires auth — skipping.")
        print("    Re-run with:  STEM_API_KEY=... python 08_enterprise_operations.py")
        return None

    if not auth_on:
        print("[i] Server auth appears to be OFF. Running the request anyway")
        print("    to demonstrate the request-id + metrics plumbing.")

    response, headers = client.chat_with_meta(
        "Summarize the current operational posture in one sentence.",
        caller_id="enterprise-ops-demo",
    )
    request_id = headers.get("x-request-id") or headers.get("X-Request-Id")
    print(f"[OK] status={response.get('status', '?')}  X-Request-Id={request_id}")
    print_response(response, show_trace=False, max_content=240)
    return request_id


def step_2_correlation(request_id: str | None) -> None:
    header("2. Log / audit correlation")
    if not request_id:
        print("[!] No request id recorded — skipping.")
        return
    print(f"Correlate this request across signals using X-Request-Id={request_id}:")
    print()
    print(f'  # Server logs (pino JSONL on stderr):')
    print(f'  grep "{request_id}" server.log')
    print()
    print(f'  # Audit events (name == "audit", AUDIT_LOG_ENABLED=true):')
    print(f'  grep "{request_id}" server.log | jq \'select(.name=="audit")\'')


def step_3_forbidden_call(client: StemAgentClient, auth_on: bool) -> None:
    header("3. Forbidden call (RBAC)")
    if not auth_on:
        print("[i] Server auth is OFF — RBAC demo doesn't apply. Skipping.")
        return

    # /api/v1/admin/* is the documented placeholder for RBAC-gated routes
    # (see docs/security.md). With a low-privilege API key this should 403.
    url = f"{client.base_url}/api/v1/admin/mcp/reload"
    try:
        r = httpx.post(url, headers=client._auth_headers, timeout=10)
        if r.status_code == 404:
            print(f"[i] {url} is not wired as a protected route in your build.")
            print("    The requirePermission middleware is available — wire it")
            print("    into any route you want to guard. See docs/security.md.")
        elif r.status_code in (401, 403):
            print(f"[OK] server rejected unauthenticated/unauthorized call "
                  f"(status={r.status_code}) — RBAC is doing its job.")
        elif r.status_code == 200:
            print("[!] Call succeeded — your API key has admin:* permissions.")
        else:
            print(f"[?] unexpected status={r.status_code}: {r.text[:200]}")
    except httpx.HTTPError as exc:
        print(f"[!] probe failed: {exc}")


def step_4_metrics(client: StemAgentClient) -> None:
    header("4. Prometheus /metrics")
    try:
        body = client.metrics()
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            print("[i] /metrics returns 404 — METRICS_ENABLED is not set.")
            print("    Start the server with METRICS_ENABLED=true.")
            return
        raise
    except httpx.HTTPError as exc:
        print(f"[!] /metrics fetch failed: {exc}")
        return

    lines = [line for line in body.splitlines() if line and not line.startswith("#")]
    sample = [line for line in lines if line.startswith("stem_agent_http_requests_total")][:5]
    histogram_count = sum(1 for line in lines if line.startswith("stem_agent_http_request_duration_seconds_bucket"))
    print(f"[OK] /metrics returned {len(lines)} sample lines "
          f"({histogram_count} histogram buckets)")
    print()
    print("Sample counter rows:")
    for line in sample:
        print(f"  {line}")


def main() -> int:
    client = StemAgentClient()
    if not client.ensure_running():
        return 1

    auth_on = check_auth_enabled(client)
    print(f"[i] Auth detected: {'ENABLED' if auth_on else 'disabled'}")
    if auth_on and not client.api_key:
        print("[i] Set STEM_API_KEY to run authenticated steps.")

    request_id = step_1_authenticated_call(client, auth_on)
    step_2_correlation(request_id)
    step_3_forbidden_call(client, auth_on)
    step_4_metrics(client)

    header("Done")
    print("Next steps:")
    print("  • docs/security.md — enable helmet + audit log + redaction")
    print("  • docs/observability.md — wire /metrics into Prometheus")
    print("  • docs/deployment.md — production topology + scaling caveats")
    return 0


if __name__ == "__main__":
    sys.exit(main())
