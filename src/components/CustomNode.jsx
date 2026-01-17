
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Cpu, Zap, Radio, Boxes, Activity, Settings } from 'lucide-react';

const ICONS = {
    power: Zap,
    inputs: Boxes,
    control: Cpu,
    outputs: Activity,
    other: Radio,
    default: Settings
};

export default memo(({ data, selected }) => {
    const Icon = ICONS[data.type] || ICONS.default;

    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`} style={{
            padding: '10px',
            borderRadius: '8px',
            background: '#141417',
            border: `2px solid ${data.color || '#555'}`,
            minWidth: '150px',
            color: 'white',
            boxShadow: selected ? `0 0 0 2px #fff, 0 0 15px ${data.color}` : 'none',
            transition: 'all 0.2s ease',
            position: 'relative'
        }}>
            <Handle type="target" position={Position.Top} style={{ background: '#fff' }} />
            <Handle type="target" position={Position.Left} style={{ background: '#fff' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    background: data.color || '#555',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={16} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {data.sublabel || 'Component'}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {data.label}
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Right} style={{ background: '#fff' }} />
            <Handle type="source" position={Position.Bottom} style={{ background: '#fff' }} />
        </div>
    );
});
