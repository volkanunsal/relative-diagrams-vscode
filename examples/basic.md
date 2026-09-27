# Relative Diagrams — basic

A diagram with no theme follows the editor theme:

```reladraw
node app "Web app"
node app.ui  "Interface"
node app.api "API"  below app.ui

node store "Database"  right of app  level with app

edge app.api -> store  "queries"  from: right  to: left
```

A diagram that names its own theme keeps it:

```reladraw
diagram theme: nord
node web "Web app"
node api "API server"  right of web  gap: wide
edge web -> api "HTTPS"
```
