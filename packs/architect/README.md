# System Architect Plugin

Production standards for system architecture and diagram-as-code.

## Installation

```bash
# Add Smicolon marketplace
/plugin marketplace add https://github.com/smicolon/ai-kit

# Install System Architecture plugin
/plugin install architect
```

## What's Included

### 1 Specialized Agent

- `@system-architect` - Eraser.io diagram-as-code specialist

### Supported Diagram Types

The agent can create:
- **Entity Relationship Diagrams (ERD)** - Database schema visualization
- **Flowcharts** - Process flows and decision trees
- **Cloud Architecture** - AWS, Azure, GCP infrastructure diagrams
- **Sequence Diagrams** - System interaction flows
- **BPMN Diagrams** - Business process modeling

All diagrams are generated as code using Eraser.io syntax.

## Usage

```bash
# Database schema
@system-architect "Create an ERD for our e-commerce database"

# Cloud infrastructure
@system-architect "Design AWS architecture for microservices platform"

# Process flow
@system-architect "Create a sequence diagram for user authentication flow"

# Business process
@system-architect "Create BPMN diagram for order fulfillment process"
```

## Output

The agent generates diagram-as-code that you can:
1. Copy to [Eraser.io](https://www.eraser.io/)
2. Edit and refine visually
3. Export as PNG, SVG, or PDF
4. Version control alongside your code

## Documentation

See the main [Smicolon Claude Infra repository](https://github.com/smicolon/ai-kit) for complete documentation.
