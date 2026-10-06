'use client';
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Dna, ArrowRight, Leaf } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface PathwayNode {
  id: string;
  x: number;
  y: number;
  category: 'substrate' | 'intermediate' | 'product';
  color?: string;
}

interface PathwayEdge {
  source: string;
  target: string;
  enzyme: string;
  gene: string;
}

interface Pathway {
  nodes: PathwayNode[];
  edges: PathwayEdge[];
}

type PathwayKey = 'glycolysis' | 'tca' | 'fatty_acid';

const PATHWAY_KEYS: PathwayKey[] = ['glycolysis', 'tca', 'fatty_acid'];

/** Minimal shape of the echarts tooltip / click callback payload we consume. */
interface TooltipParams {
  dataType?: string;
  name?: string;
  data?: { id?: string; data?: PathwayEdge };
}

interface ChartClickParams {
  dataType?: string;
  name?: string;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (str: string | number | null | undefined): string =>
  String(str ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

// Static pathway topology lives at module scope (node ids are translated at
// render time from `t.pathway.metabolites`). They used to be rebuilt on every
// render inside the component, and the render effect depended on that object, so
// the ECharts instance was disposed and re-initialised on every render (losing
// zoom/pan state and burning CPU). A module constant keeps the reference stable.
const PATHWAYS: Record<PathwayKey, Pathway> = {
  glycolysis: {
    nodes: [
      { id: 'glucose', x: 50, y: 150, category: 'substrate', color: '#ef4444' },
      { id: 'g6p', x: 150, y: 150, category: 'intermediate' },
      { id: 'f6p', x: 250, y: 150, category: 'intermediate' },
      { id: 'f16bp', x: 350, y: 150, category: 'intermediate' },
      { id: 'dhap', x: 450, y: 80, category: 'intermediate' },
      { id: 'g3p', x: 450, y: 220, category: 'intermediate' },
      { id: '13bpg', x: 550, y: 150, category: 'intermediate' },
      { id: '3pg', x: 650, y: 150, category: 'intermediate' },
      { id: '2pg', x: 750, y: 150, category: 'intermediate' },
      { id: 'pep', x: 850, y: 150, category: 'intermediate' },
      { id: 'pyruvate', x: 950, y: 150, category: 'product', color: '#10b981' },
    ],
    edges: [
      { source: 'glucose', target: 'g6p', enzyme: 'HK', gene: 'HK1/HK2' },
      { source: 'g6p', target: 'f6p', enzyme: 'PGI', gene: 'GPI' },
      { source: 'f6p', target: 'f16bp', enzyme: 'PFK', gene: 'PFKL/PFKP' },
      { source: 'f16bp', target: 'dhap', enzyme: 'ALD', gene: 'ALDOA' },
      { source: 'f16bp', target: 'g3p', enzyme: 'ALD', gene: 'ALDOA' },
      { source: 'dhap', target: 'g3p', enzyme: 'TPI', gene: 'TPI1' },
      { source: 'g3p', target: '13bpg', enzyme: 'GAPDH', gene: 'GAPDH' },
      { source: '13bpg', target: '3pg', enzyme: 'PGK', gene: 'PGK1' },
      { source: '3pg', target: '2pg', enzyme: 'PGM', gene: 'PGAM1' },
      { source: '2pg', target: 'pep', enzyme: 'ENO', gene: 'ENO1' },
      { source: 'pep', target: 'pyruvate', enzyme: 'PK', gene: 'PKM2' },
    ],
  },
  tca: {
    nodes: [
      { id: 'acetylcoa', x: 100, y: 200, category: 'substrate', color: '#ef4444' },
      { id: 'citrate', x: 250, y: 100, category: 'intermediate' },
      { id: 'aconitate', x: 400, y: 100, category: 'intermediate' },
      { id: 'isocitrate', x: 550, y: 100, category: 'intermediate' },
      { id: 'akg', x: 700, y: 200, category: 'intermediate' },
      { id: 'succinylcoa', x: 700, y: 300, category: 'intermediate' },
      { id: 'succinate', x: 550, y: 400, category: 'intermediate' },
      { id: 'fumarate', x: 400, y: 400, category: 'intermediate' },
      { id: 'malate', x: 250, y: 400, category: 'intermediate' },
      { id: 'oxaloacetate', x: 100, y: 300, category: 'product', color: '#10b981' },
    ],
    edges: [
      { source: 'acetylcoa', target: 'citrate', enzyme: 'CS', gene: 'CS' },
      { source: 'citrate', target: 'aconitate', enzyme: 'ACO', gene: 'ACO2' },
      { source: 'aconitate', target: 'isocitrate', enzyme: 'ACO', gene: 'ACO2' },
      { source: 'isocitrate', target: 'akg', enzyme: 'IDH', gene: 'IDH2' },
      { source: 'akg', target: 'succinylcoa', enzyme: 'OGDH', gene: 'OGDH' },
      { source: 'succinylcoa', target: 'succinate', enzyme: 'SCS', gene: 'SUCLG1' },
      { source: 'succinate', target: 'fumarate', enzyme: 'SDH', gene: 'SDHA' },
      { source: 'fumarate', target: 'malate', enzyme: 'FH', gene: 'FH' },
      { source: 'malate', target: 'oxaloacetate', enzyme: 'MDH', gene: 'MDH2' },
      { source: 'oxaloacetate', target: 'citrate', enzyme: 'CS', gene: 'CS' },
    ],
  },
  fatty_acid: {
    nodes: [
      { id: 'fattyacid', x: 50, y: 150, category: 'substrate', color: '#ef4444' },
      { id: 'acylcoa', x: 150, y: 150, category: 'intermediate' },
      { id: 'enoylcoa', x: 250, y: 150, category: 'intermediate' },
      { id: 'hydoxyacylcoa', x: 350, y: 150, category: 'intermediate' },
      { id: 'ketoacylcoa', x: 450, y: 150, category: 'intermediate' },
      { id: 'acetylcoa_out', x: 550, y: 150, category: 'product', color: '#10b981' },
      { id: 'short_fa', x: 550, y: 250, category: 'intermediate' },
    ],
    edges: [
      { source: 'fattyacid', target: 'acylcoa', enzyme: 'ACS', gene: 'ACSL' },
      { source: 'acylcoa', target: 'enoylcoa', enzyme: 'ACAD', gene: 'ACADVL' },
      { source: 'enoylcoa', target: 'hydoxyacylcoa', enzyme: 'ECH', gene: 'ECHS1' },
      { source: 'hydoxyacylcoa', target: 'ketoacylcoa', enzyme: 'HADH', gene: 'HADHA' },
      { source: 'ketoacylcoa', target: 'acetylcoa_out', enzyme: 'THL', gene: 'ACAT1' },
      { source: 'ketoacylcoa', target: 'short_fa', enzyme: 'THL', gene: 'ACAT1' },
      { source: 'short_fa', target: 'acylcoa', enzyme: 'ACSL', gene: 'ACSL' },
    ],
  },
};

// Stable empty default: a fresh `[]` on every render would change the effect
// dependency identity and retrigger the chart setup each time.
const EMPTY_GENES: string[] = [];

export default function MetabolicPathway({
  selectedPathway = 'glycolysis',
  userGenes = EMPTY_GENES,
}: {
  selectedPathway?: PathwayKey;
  userGenes?: string[];
}) {
  const { t } = useLanguage();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [activeNode, setActiveNode] = useState<{ name: string } | null>(null);
  // The dropdown owns the active pathway through local state. Previously the
  // <select> was bound to the read-only `selectedPathway` prop and its onChange only
  // cleared the selected node, so picking another pathway did nothing.
  const [pathwayKey, setPathwayKey] = useState<PathwayKey>(selectedPathway);

  const pathway = PATHWAYS[pathwayKey] ?? PATHWAYS.glycolysis;

  useEffect(() => {
    if (!chartRef.current) return;

    const metabolites = t.pathway.metabolites as Record<string, string>;
    const categoryLabel = (category?: PathwayNode['category']) =>
      category === 'substrate'
        ? t.pathway.substrate
        : category === 'product'
          ? t.pathway.product
          : t.pathway.intermediate;

    const isUserGene = (geneStr: string): boolean => {
      if (!userGenes.length) return false;
      return userGenes.some((g) =>
        geneStr.split('/').some((gene) => gene.toLowerCase().includes(g.toLowerCase()))
      );
    };

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const nodes = pathway.nodes.map((node) => ({
      id: node.id,
      name: metabolites[node.id] ?? node.id,
      x: node.x,
      y: node.y,
      symbolSize: node.category === 'substrate' || node.category === 'product' ? 45 : 35,
      itemStyle: {
        color: node.color || '#60a5fa',
        borderColor: node.category === 'substrate' || node.category === 'product' ? '#3b82f6' : '#93c5fd',
        borderWidth: 2,
      },
      label: {
        show: true,
        fontSize: 11,
        color: '#1e293b',
      },
    }));

    const links = pathway.edges.map((edge) => {
      const isHighlighted = isUserGene(edge.gene);
      return {
        source: edge.source,
        target: edge.target,
        symbol: ['none', 'arrow'],
        symbolSize: [0, 8],
        lineStyle: {
          width: isHighlighted ? 4 : 2,
          color: isHighlighted ? '#f59e0b' : '#cbd5e1',
          curveness: 0.1,
        },
        label: {
          show: true,
          formatter: edge.enzyme,
          fontSize: 10,
          color: isHighlighted ? '#d97706' : '#64748b',
        },
        emphasis: {
          lineStyle: {
            width: 5,
            color: '#f59e0b',
          },
        },
        data: edge,
      };
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (rawParams) => {
          const params = rawParams as unknown as TooltipParams;
          if (params.dataType === 'node') {
            const nodeData = pathway.nodes.find((n) => n.id === params.data?.id);
            return `<strong>${escapeHtml(params.name)}</strong><br/>${escapeHtml(t.pathway.categoryLabel)}: ${escapeHtml(categoryLabel(nodeData?.category))}`;
          } else if (params.dataType === 'edge') {
            const edgeData = params.data?.data;
            if (!edgeData) return '';
            const highlighted = isUserGene(edgeData.gene)
              ? `<br/><span style="color:#f59e0b">${escapeHtml(t.pathway.userGeneBadge)}</span>`
              : '';
            return `<strong>${escapeHtml(edgeData.enzyme)}</strong><br/>${escapeHtml(t.pathway.geneLabel)}: ${escapeHtml(edgeData.gene)}${highlighted}`;
          }
          return '';
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          data: nodes,
          links: links,
          roam: true,
          draggable: true,
          emphasis: {
            focus: 'adjacency',
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          label: {
            position: 'bottom',
          },
        },
      ],
      xAxis: {
        type: 'value',
        show: false,
        min: 0,
        max: 1000,
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 0,
        max: 450,
      },
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    };

    chart.setOption(option);

    chart.on('click', (params: ChartClickParams) => {
      if (params.dataType === 'node') {
        setActiveNode({ name: String(params.name ?? '') });
      } else if (params.dataType === 'edge') {
        setActiveNode(null);
      }
    });

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, [pathway, userGenes, t]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">{t.pathway.title}</h2>
        </div>
        <select
          value={pathwayKey}
          onChange={(e) => {
            setPathwayKey(e.target.value as PathwayKey);
            setActiveNode(null);
          }}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {PATHWAY_KEYS.map((key) => (
            <option key={key} value={key}>
              {t.pathway.names[key]}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-600 mb-4">{t.pathway.descriptions[pathwayKey]}</p>

      <div className="flex gap-4">
        <div className="flex-1 bg-slate-50 rounded-lg p-2" style={{ height: 400 }}>
          <div ref={chartRef} className="w-full h-full" />
        </div>

        <div className="w-64 space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
              <ArrowRight className="w-4 h-4" />
              {t.pathway.legend}
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-slate-600">{t.pathway.substrate}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <span className="text-slate-600">{t.pathway.product}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-400" />
                <span className="text-slate-600">{t.pathway.intermediate}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500" />
                <span className="text-slate-600">{t.pathway.userGeneRelated}</span>
              </div>
            </div>
          </div>

          {activeNode && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">{t.pathway.nodeDetails}</h3>
              <p className="text-xs text-slate-600">
                <span className="font-medium">{t.pathway.nameLabel}:</span> {activeNode.name}
              </p>
            </div>
          )}

          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
              <Leaf className="w-4 h-4" />
              {t.pathway.nutritionLinks}
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• {t.pathway.nutritionGlucose}</li>
              <li>• {t.pathway.nutritionPyruvate}</li>
              <li>• {t.pathway.nutritionAtp}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
