# Relative Diagrams — errors

This fence has two unplaced nodes. The preview shows an error card and the editor marks line 2 of the fence.

```reladraw
node a "A"
node b "B" right of a
edge a -> b
```

This fence is valid and renders below the broken one:

```reladraw
node a "A"
node b "B"  right of a
edge a -> b
```
