import React, { useState } from 'react';
import { SPECIALTY_PATHWAYS } from '../../data/pathwayData';
import { PathwayNode } from '../../types/clinical';

interface PathwayExplorerViewProps {
  onOpenProvenance: (provenanceId: string) => void;
  onLaunchTwin: () => void;
}

export const PathwayExplorerView: React.FC<PathwayExplorerViewProps> = ({
  onOpenProvenance,
  onLaunchTwin
}) => {
  const [activeSpecialty, setActiveSpecialty] = useState<'cardiometabolic' | 'oncology' | 'neurology'>('cardiometabolic');
  const [selectedNode, setSelectedNode] = useState<PathwayNode | null>(null);

  const currentPathway = SPECIALTY_PATHWAYS[activeSpecialty];

  const handleNodeClick = (node: PathwayNode) => {
    setSelectedNode(node);
  };

  const getNodeColor = (type: PathwayNode['type']) => {
    switch (type) {
      case 'drug':
        return {
          fill: '#0f2b38',
          border: '#006a61',
          text: '#ffffff',
          badge: 'Therapeutic Agent'
        };
      case 'target':
        return {
          fill: '#ffffff',
          border: '#0284c7',
          text: '#0369a1',
          badge: 'Molecular Target / Enzyme'
        };
      case 'pathway':
        return {
          fill: '#ffffff',
          border: '#6366f1',
          text: '#4338ca',
          badge: 'Biochemical Cascade'
        };
      case 'effect':
        return {
          fill: '#ffffff',
          border: '#059669',
          text: '#047857',
          badge: 'Clinical Outcome'
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#0d1c32] text-white rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#86f2e4] font-bold">
              MECHANISTIC PHARMACOTHERAPY NETWORK
            </span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold">
            Drug–Target–Pathway Explorer
          </h2>
          <p className="text-xs text-[#76849f]">
            Interactive topological tracing from small molecule binding to downstream organ-level clinical outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLaunchTwin}
            className="px-3 py-1.5 rounded bg-[#006a61] hover:bg-[#006f66] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>Simulate in Patient Twin</span>
          </button>
        </div>
      </div>

      {/* Specialty Filter Bar & Description */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'cardiometabolic', label: 'Cardiometabolic & Renal' },
              { id: 'oncology', label: 'Targeted Oncology (TKIs)' },
              { id: 'neurology', label: 'Neuropsychiatry (Monoamines)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSpecialty(tab.id as any);
                  setSelectedNode(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeSpecialty === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {currentPathway.nodes.length} Active Nodes · {currentPathway.edges.length} Directional Traces
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <strong>{currentPathway.tagline}: </strong>
          {currentPathway.description}
        </div>
      </div>

      {/* Main Interactive Stage & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Interactive SVG Network Stage (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Network Topology (Click any node to inspect evidence)
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f2b38]"></span> Drug
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span> Target
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span> Cascade
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span> Clinical Effect
              </span>
            </div>
          </div>

          <div className="relative w-full h-[460px] bg-[#f8fafc] rounded-lg border border-slate-200 overflow-x-auto overflow-y-hidden">
            <svg
              className="min-w-[960px] w-full h-full"
              viewBox="0 0 980 460"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Arrow markers */}
                <marker
                  id="arrow-teal"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#0d9488" />
                </marker>
                <marker
                  id="arrow-indigo"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
                </marker>
              </defs>

              {/* Directional Edges */}
              {currentPathway.edges.map((edge) => {
                const sourceNode = currentPathway.nodes.find((n) => n.id === edge.source);
                const targetNode = currentPathway.nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.x + 140;
                const startY = sourceNode.y + 35;
                const endX = targetNode.x;
                const endY = targetNode.y + 35;
                const midX = (startX + endX) / 2;

                const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

                return (
                  <g key={edge.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2"
                      strokeDasharray="5,4"
                      markerEnd="url(#arrow-teal)"
                    />
                  </g>
                );
              })}

              {/* Render Nodes */}
              {currentPathway.nodes.map((node) => {
                const style = getNodeColor(node.type);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => handleNodeClick(node)}
                    className="cursor-pointer group"
                  >
                    {/* Node Container Card */}
                    <rect
                      x="0"
                      y="0"
                      width="155"
                      height="70"
                      rx="8"
                      fill={style.fill}
                      stroke={isSelected ? '#0d9488' : style.border}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-all filter drop-shadow-xs group-hover:brightness-95"
                    />

                    {/* Node Type Tiny Kicker */}
                    <text
                      x="10"
                      y="18"
                      fill={node.type === 'drug' ? '#86f2e4' : style.text}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="Inter, sans-serif"
                      letterSpacing="0.05em"
                    >
                      {node.type.toUpperCase()}
                    </text>

                    {/* Node Label */}
                    <text
                      x="10"
                      y="36"
                      fill={node.type === 'drug' ? '#ffffff' : '#0f172a'}
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                    </text>

                    {/* Node Sublabel */}
                    {node.sublabel && (
                      <text
                        x="10"
                        y="52"
                        fill={node.type === 'drug' ? '#94a3b8' : '#64748b'}
                        fontSize="9.5"
                        fontFamily="Inter, sans-serif"
                      >
                        {node.sublabel.length > 22 ? node.sublabel.substring(0, 20) + '...' : node.sublabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Node Inspector Side Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Scientific Node Inspector
            </span>
            {selectedNode && (
              <span className="text-[10px] font-mono text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded font-bold">
                {selectedNode.type.toUpperCase()}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs animate-fade-in">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">
                  {selectedNode.label}
                </h3>
                {selectedNode.sublabel && (
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    {selectedNode.sublabel}
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Biochemical Rationale
                </span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {selectedNode.description}
                </p>
              </div>

              {selectedNode.provenanceId && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenProvenance(selectedNode.provenanceId!)}
                    className="w-full py-2 px-3 rounded-lg bg-[#0F766E] hover:bg-[#0F766E] text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Audit Provenance &amp; PubMed Citation</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="material-symbols-outlined text-[36px] text-slate-300">
                touch_app
              </span>
              <p className="text-xs max-w-[200px] mx-auto">
                Select any node on the pathway canvas to inspect target kinetics, mechanism of action, and citation trails.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
