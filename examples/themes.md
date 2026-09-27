# Relative Diagrams — themes

Follows the editor theme:

```reladraw
style quiet  text: (color: muted, size: small)

node web     "Web app"  badge: laptop
node api     "API server"                          right of web  gap: wide
node cluster "Workers"                             below api
node cluster.a "worker a"
node cluster.b "worker b"                          right of cluster.a
node db      "Records"  icon: database             right of api  gap: wide
node note    "Backed up nightly / to cold storage"  below db  shape: none  style: quiet

edge web -> api "HTTPS"
edge api -> cluster "jobs"
edge api -> db "queries"
```

Pinned to its own theme:

```reladraw
diagram theme: gruvbox-light
node a "Pinned"
node b "theme"  right of a
edge a -> b
```
