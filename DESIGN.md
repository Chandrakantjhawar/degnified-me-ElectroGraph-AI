
# ElectroGraph AI - Technical Design Document

## 1. Overview
ElectroGraph AI is a web-based tool effectively prototyping the generation of electronics block diagrams from natural language. It uses a heuristic-based engine to parse user prompts and map them to a standard 5-block system architecture common in embedded systems.

## 2. Architecture
- **Frontend Framework**: React 18 (via Vite) used for state management and rendering.
- **Canvas Engine**: React Flow (Node-based UI library) handles the interactive canvas, zooming, panning, and object manipulation.
- **Styling**: Vanilla CSS with comprehensive CSS Variables for a "Premium Dark Mode" aesthetic, including glassmorphism effects.
- **Export**: `html-to-image` for PNG generation and native Blob API for JSON state export.

## 3. Diagram Generation Logic
The `generator.js` utility implements a deterministic heuristic algorithm:

1.  **Input Parsing**: The user's text is normalized and scanned for specific keywords mapped to 5 functional domains.
2.  **Domain Mapping**:
    *   **Power**: Keywords like `battery`, `solar`, `mains`. Default: `Power Supply`.
    *   **Inputs**: Keywords like `sensor`, `camera`, `button`. Default: `User Input` if none found.
    *   **Control**: Keywords like `ESP32`, `Arduino`, `Processor`. Default: `Microcontroller`.
    *   **Outputs**: Keywords like `display`, `motor`, `led`. Default: `Status LED` if none found.
    *   **Other**: Comm modules like `wifi`, `bluetooth`.
3.  **Graph Construction**:
    *   A central "Control" node is always created.
    *   Found components are instantiated as Nodes.
    *   Edges are automatically created to link Peripherals <-> Control Unit.

## 4. Component Placement Strategy
To ensure a clean, "schematic-like" layout without complex force-directed chaos, we use a **Star Topology** layout strategy with fixed regions:

*   **Center (x:400, y:300)**: The **Control/Processing** Unit. This is the heart of the system.
*   **Top (x:400, y:50)**: **Power Supply**. Following the convention that power flows "down" or is a high-level dependency.
*   **Left (x:50, y:300)**: **Inputs**. Signals flow Left -> Right.
*   **Right (x:750, y:300)**: **Outputs**. Resulting actions flow out to the right.
*   **Bottom (x:400, y:550)**: **Other Peripherals**. Communication modules or external storage usually sit "below" or to the side; here we place them below to balance the vertical axis.

Multiple items in the same category (e.g., 3 sensors) are offset vertically (for Inputs/Outputs) or horizontally (for Power/Other) to prevent overlap.

## 5. Technical Constraints & Features
*   **Web-Based**: Runs entirely in browser (Client-side).
*   **Editable**: Users can drag nodes (React Flow default), add new nodes via the toolbar, and delete selection.
*   **Data Structure**: The diagram is stored as `nodes` and `edges` JSON arrays, making it easily serializable and compatible with other graph tools.
