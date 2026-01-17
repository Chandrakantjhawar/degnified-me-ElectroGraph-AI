
import { v4 as uuidv4 } from 'uuid';

const SECTIONS = {
    POWER: { id: 'power', label: 'Power Supply', x: 400, y: 50, color: '#ef4444' }, // Red
    INPUTS: { id: 'inputs', label: 'Inputs', x: 50, y: 300, color: '#3b82f6' }, // Blue
    CONTROL: { id: 'control', label: 'Control & Processing', x: 400, y: 300, color: '#8b5cf6' }, // Purple
    OUTPUTS: { id: 'outputs', label: 'Outputs', x: 750, y: 300, color: '#10b981' }, // Green
    OTHER: { id: 'other', label: 'Other Peripherals', x: 400, y: 550, color: '#f59e0b' } // Orange
};

const KEYWORDS = {
    POWER: ['battery', 'solar', 'mains', 'usb', 'power', 'vcc', 'charge', 'supply', 'voltage', 'regulator'],
    INPUTS: ['sensor', 'camera', 'microphone', 'mic', 'button', 'switch', 'keypad', 'touch', 'gps', 'scanner', 'detect'],
    CONTROL: ['arduino', 'esp32', 'pi', 'microcontroller', 'processor', 'cpu', 'fpga', 'stm32', 'chip', 'logic'],
    OUTPUTS: ['display', 'screen', 'lcd', 'oled', 'led', 'motor', 'servo', 'speaker', 'buzzer', 'printer', 'actuator', 'relay'],
    OTHER: ['wifi', 'bluetooth', 'ble', 'lora', 'zigbee', 'sd card', 'storage', 'memory', 'antenna', 'radio']
};

export const generateDiagramFromPrompt = (prompt) => {
    const text = prompt.toLowerCase();

    const nodes = [];
    const edges = [];

    // Helper to add node
    const addNode = (label, section, offset = 0) => {
        const id = uuidv4();
        nodes.push({
            id,
            type: 'default', // Using default for now, can be custom
            data: { label },
            position: {
                x: section.x + (section.id === 'inputs' || section.id === 'outputs' ? 0 : offset * 150 - 75),
                y: section.y + (section.id === 'inputs' || section.id === 'outputs' ? offset * 100 - 50 : 0)
            },
            style: {
                border: `2px solid ${section.color}`,
                background: '#141417',
                color: 'white',
                borderRadius: '8px',
                width: 140
            },
        });
        return id;
    };

    // 1. Identify Control Unit (Always needed)
    let controlLabel = 'Microcontroller';
    KEYWORDS.CONTROL.forEach(kw => {
        if (text.includes(kw)) controlLabel = kw.charAt(0).toUpperCase() + kw.slice(1);
    });
    const controlId = addNode(controlLabel, SECTIONS.CONTROL);

    // 2. Identify Power
    let powerLabel = 'Power Supply';
    let foundPower = false;
    KEYWORDS.POWER.forEach(kw => {
        if (text.includes(kw) && !foundPower) {
            powerLabel = kw.charAt(0).toUpperCase() + kw.slice(1) + ' Unit';
            foundPower = true;
        }
    });
    const powerId = addNode(powerLabel, SECTIONS.POWER);
    edges.push({ id: `e-${powerId}-${controlId}`, source: powerId, target: controlId, animated: true });

    // 3. Scan for Inputs
    let inputCount = 0;
    KEYWORDS.INPUTS.forEach(kw => {
        // If exact match or similar
        if (text.includes(kw)) {
            const id = addNode(kw.charAt(0).toUpperCase() + kw.slice(1), SECTIONS.INPUTS, inputCount++);
            edges.push({ id: `e-${id}-${controlId}`, source: id, target: controlId });
        }
    });
    // Default Input if none
    if (inputCount === 0) {
        const id = addNode('User Input', SECTIONS.INPUTS, 0);
        edges.push({ id: `e-${id}-${controlId}`, source: id, target: controlId });
    }

    // 4. Scan for Outputs
    let outputCount = 0;
    KEYWORDS.OUTPUTS.forEach(kw => {
        if (text.includes(kw)) {
            const id = addNode(kw.charAt(0).toUpperCase() + kw.slice(1), SECTIONS.OUTPUTS, outputCount++);
            edges.push({ id: `e-${controlId}-${id}`, source: controlId, target: id });
        }
    });
    // Default Output
    if (outputCount === 0) {
        const id = addNode('Status LED', SECTIONS.OUTPUTS, 0);
        edges.push({ id: `e-${controlId}-${id}`, source: controlId, target: id });
    }

    // 5. Scan for Other
    let otherCount = 0;
    KEYWORDS.OTHER.forEach(kw => {
        if (text.includes(kw)) {
            const id = addNode(kw.charAt(0).toUpperCase() + kw.slice(1), SECTIONS.OTHER, otherCount++);
            edges.push({ id: `e-${controlId}-${id}`, source: controlId, target: id });
        }
    });

    return { nodes, edges };
};
