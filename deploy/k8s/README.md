# Kubernetes deployment — example manifests

These manifests are a **starting point**, not a turnkey deployment. They
illustrate the shape of a production STEM Agent rollout; adapt namespace,
image registry, resource requests, probe paths, and ingress to your cluster.

## Apply order

```bash
kubectl apply -f configmap.yaml
kubectl apply -f secret.example.yaml   # AFTER replacing values
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
```

## What's here

| File | Purpose |
|------|---------|
| `deployment.yaml` | Rolling deployment, 2 replicas, non-root, readOnly FS, probes. |
| `service.yaml` | ClusterIP service on port 80 → container 8000. |
| `configmap.yaml` | Non-secret envs (opt-in hardening + observability flags). |
| `secret.example.yaml` | Template for DB/LLM/embedding secrets. Replace values. |
| `hpa.yaml` | Horizontal pod autoscaler on CPU + memory. |

## Caveats (read before running replicas > 1)

- The in-memory rate limiter (`packages/standard-interface/src/middleware/rate-limit.ts`)
  is per-pod. Either pin clients to a pod via sticky sessions at the ingress,
  or accept per-pod quotas. A Redis-backed limiter is documented as follow-up
  work in `docs/deployment.md`.
- `ap2-handler.ts` keeps payment-intent history in memory; for production
  payment flows, route mandates to a single primary and replicate out-of-band.
- Session memory (episodic/semantic) is external (Postgres + Redis), so those
  are safe to scale.

## What's not here (intentionally)

- Ingress / cert-manager: cluster-specific; pair with nginx-ingress or ALB.
- ServiceAccount + RBAC: minimal; add if you use IRSA / Workload Identity for
  cloud-provider auth instead of static secrets.
- NetworkPolicy: strongly recommended; not shipped because selectors depend
  on your namespace layout.
- PodDisruptionBudget: add `minAvailable: 1` alongside the HPA.
