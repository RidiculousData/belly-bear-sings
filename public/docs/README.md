# Domain Model Diagrams

This directory contains Mermaid diagram files that are served to the Domain Model page in the application.

## Keeping Diagrams in Sync

The diagrams in this directory are copies of the source files in `/docs/`. To update the diagrams shown in the application:

```bash
# Copy all mermaid files from docs to public/docs
cp docs/*.mermaid public/docs/
```

Or manually copy the files you've updated.

## Files

- `uml-class-diagram.mermaid` - Complete UML class diagram
- `uml-relationships.mermaid` - Entity relationships diagram
- `uml-package-diagram.mermaid` - Package structure diagram
- `uml-sequence-diagrams.mermaid` - Sequence diagrams for key operations
- `logical-data-model.mermaid` - Entity-relationship diagram
- `aggregate-boundaries.mermaid` - Aggregate boundaries visualization
- `state-machines.mermaid` - State machine diagrams

## Note

These files are served statically from the `public/` directory. After updating source files in `/docs/`, remember to copy them here for the changes to appear in the application.

