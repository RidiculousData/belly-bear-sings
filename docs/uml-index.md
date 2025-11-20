# UML Diagrams Index

This document provides an overview of all UML and domain model diagrams available for the Belly Bear Sings application.

## Overview

All diagrams use **Mermaid** syntax, which renders natively in GitHub, GitLab, and most modern markdown viewers. No additional tooling is required.

## Diagram Types

### 1. UML Class Diagram
**File**: [`uml-class-diagram.mermaid`](./uml-class-diagram.mermaid)

Complete UML class diagram showing:
- All domain entities (User, Party, PartyGuest, QueueSong, FavoriteSong)
- Value objects (RequestedBy, Praise, PartyCode)
- Enumerations (PartyStatus, QueueSongStatus, PraiseType)
- Base model abstract class
- Domain services
- Inheritance relationships
- Associations and compositions
- Class attributes and methods with visibility modifiers

**Use Cases**:
- Understanding the complete class structure
- Seeing all available methods and properties
- Understanding inheritance hierarchy
- Reference for implementation

### 2. UML Relationships Diagram
**File**: [`uml-relationships.mermaid`](./uml-relationships.mermaid)

Detailed relationship view showing:
- Aggregate roots (marked with `<<Aggregate Root>>`)
- Entity relationships with multiplicities (1..*, 1, *)
- Foreign key relationships
- Composition vs aggregation
- Primary keys (PK) and unique keys (UK)
- Subcollection relationships

**Use Cases**:
- Understanding entity relationships
- Database design reference
- Understanding aggregate boundaries
- Foreign key dependencies

### 3. UML Package Diagram
**File**: [`uml-package-diagram.mermaid`](./uml-package-diagram.mermaid)

Domain layer organization showing:
- Aggregate boundaries
- Entity hierarchy
- Value objects
- Enumerations
- Domain services
- Base classes
- Persistence layer mapping
- External dependencies

**Use Cases**:
- Understanding domain layer structure
- Package organization
- Dependency relationships
- Architecture overview

### 4. UML Sequence Diagrams
**File**: [`uml-sequence-diagrams.mermaid`](./uml-sequence-diagrams.mermaid)

Interaction diagrams for key operations:
1. **Create Party** - Party creation flow with code generation
2. **Add Song to Queue** - Adding a song to party queue
3. **Boost Song** - Guest boosting a song with validation
4. **Play Song** - Song playback lifecycle (playing → played)
5. **Join Party** - Guest joining a party flow

**Use Cases**:
- Understanding operation flows
- Debugging business logic
- API design reference
- Integration testing scenarios

### 5. Entity Relationship Diagram
**File**: [`logical-data-model.mermaid`](./logical-data-model.mermaid)

Database-level ER diagram showing:
- All entities with attributes
- Primary keys and foreign keys
- Relationship cardinalities
- Data types
- Optional vs required fields

**Use Cases**:
- Database schema reference
- Understanding data model
- Migration planning
- Query optimization

### 6. Aggregate Boundaries Diagram
**File**: [`aggregate-boundaries.mermaid`](./aggregate-boundaries.mermaid)

Visual representation of DDD aggregates:
- Party Aggregate (Party, PartyGuest, QueueSong)
- User Aggregate (User, FavoriteSong)
- Aggregate root identification
- Subcollection relationships

**Use Cases**:
- Understanding aggregate boundaries
- Transaction boundaries
- Consistency rules
- Domain-driven design reference

### 7. State Machine Diagrams
**File**: [`state-machines.mermaid`](./state-machines.mermaid)

State transition diagrams for:
- **Party Status**: created → active → paused/ended
- **QueueSong Status**: queued → playing → played/skipped

**Use Cases**:
- Understanding valid state transitions
- Business rule validation
- State management
- Workflow design

## How to View

### In GitHub/GitLab
Diagrams render automatically when viewing `.mermaid` files in the repository.

### In VS Code
Install the "Markdown Preview Mermaid Support" extension.

### Online
Copy the mermaid code and paste into:
- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid.ink](https://mermaid.ink/)

### In Documentation
Include diagrams in markdown using:
````markdown
```mermaid
...diagram code...
```
````

## Diagram Relationships

```
Domain Model (domain-model.md)
    ├── UML Class Diagram (uml-class-diagram.mermaid)
    ├── UML Relationships (uml-relationships.mermaid)
    ├── UML Package Diagram (uml-package-diagram.mermaid)
    ├── UML Sequence Diagrams (uml-sequence-diagrams.mermaid)
    ├── ER Diagram (logical-data-model.mermaid)
    ├── Aggregate Boundaries (aggregate-boundaries.mermaid)
    └── State Machines (state-machines.mermaid)
```

## Technology Choice: Mermaid

**Why Mermaid over PlantUML?**

✅ **Already in use** - Project already uses Mermaid for diagrams  
✅ **Native rendering** - Renders in GitHub, GitLab, VS Code, and most markdown viewers  
✅ **No dependencies** - No additional tooling or rendering services needed  
✅ **Version control friendly** - Text-based format works great with Git  
✅ **Good UML support** - Supports class diagrams, sequence diagrams, state machines  
✅ **Easy to maintain** - Simple syntax, easy to update  

**PlantUML advantages** (not chosen):
- More comprehensive UML features
- Better diagram styling options
- Requires additional rendering tooling
- Not natively supported in GitHub

## Quick Reference

| Diagram Type | File | Primary Use |
|-------------|------|-------------|
| Class Diagram | `uml-class-diagram.mermaid` | Complete class structure |
| Relationships | `uml-relationships.mermaid` | Entity relationships |
| Package Diagram | `uml-package-diagram.mermaid` | Domain organization |
| Sequence Diagrams | `uml-sequence-diagrams.mermaid` | Operation flows |
| ER Diagram | `logical-data-model.mermaid` | Database schema |
| Aggregates | `aggregate-boundaries.mermaid` | DDD aggregates |
| State Machines | `state-machines.mermaid` | State transitions |

## Maintenance

When updating the domain model:
1. Update the main domain model document (`domain-model.md`)
2. Update relevant UML diagrams
3. Ensure consistency across all diagrams
4. Update this index if adding new diagrams

