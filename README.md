
# ElectroGraph AI

**An Interactive Web-Based Electronics Block Diagram Generator**

## Deliverables Status
- [x] **Working Prototype**: Fully functional React application with interactive canvas.
- [x] **Diagram Generation**: Heuristic engine mapping text to 5-block system architecture.
- [x] **Documentation**: Usage guide and technical design details below.

## Quick Start
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Locally**:
    ```bash
    npm run dev
    ```
3.  **Open in Browser**: Navigate to `http://localhost:5174` (or port shown in terminal).

## Features
- **AI-Assisted Generation**: Type "Smart Doorbell with camera and wifi" to instantly generate a schematic.
- **Interactive Editing**:
    - **Add**: Use the Left Sidebar to drop in Power, Input, Control, Output, or Other blocks.
    - **Edit**: Click any node to rename it in the Right Properties Panel.
    - **Connect**: Drag wires between white handles on nodes.
    - **Delete**: Remove selected nodes or wires via the panel or Backspace key.
- **Export**: Save your work as a JSON file (for later editing) or PNG image (for presentation).

## Technical Documentation
For a deep dive into the **Diagram Generation Logic**, **Component Placement Strategy**, and system architecture, please refer to [DESIGN.md](./DESIGN.md).

### Summary of Placement Logic
We use a **Star Topology** where:
- **Control Unit (Center)**: The brain of the system.
- **Power (Top)**: Feeds down to the rest.
- **Inputs (Left)**: Flow into the control unit.
- **Outputs (Right)**: Flow out from the control unit.
- **Peripherals (Bottom)**: Support modules.

This precise geometric layout ensures diagrams are always clean, readable, and professional, avoiding the "spaghetti" mess of random generation.
