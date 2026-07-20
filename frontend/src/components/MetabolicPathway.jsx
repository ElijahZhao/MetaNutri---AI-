'use client';
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Dna, ArrowRight, Leaf } from 'lucide-react';

export default function MetabolicPathway({ selectedPathway = 'glycolysis', userGenes = [] }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [activeNode, setActiveNode] = useState(null);

  const pathways = {
    glycolysis: {
      name: '糖酵解途径',
      description: '葡萄糖分解为丙酮酸的代谢途径，产生ATP和NADH',
      nodes: [
        { id: 'glucose', name: '葡萄糖', x: 50, y: 150, category: 'substrate', color: '#ef4444' },
        { id: 'g6p', name: '葡萄糖-6-磷酸', x: 150, y: 150, category: 'intermediate' },
        { id: 'f6p', name: '果糖-6-磷酸', x: 250, y: 150, category: 'intermediate' },
        { id: 'f16bp', name: '果糖-1,6-二磷酸', x: 350, y: 150, category: 'intermediate' },
        { id: 'dhap', name: '二羟丙酮磷酸', x: 450, y: 80, category: 'intermediate' },
        { id: 'g3p', name: '甘油醛-3-磷酸', x: 450, y: 220, category: 'intermediate' },
        { id: '13bpg', name: '1,3-二磷酸甘油酸', x: 550, y: 150, category: 'intermediate' },
        { id: '3pg', name: '3-磷酸甘油酸', x: 650, y: 150, category: 'intermediate' },
        { id: '2pg', name: '2-磷酸甘油酸', x: 750, y: 150, category: 'intermediate' },
        { id: 'pep', name: '磷酸烯醇式丙酮酸', x: 850, y: 150, category: 'intermediate' },
        { id: 'pyruvate', name: '丙酮酸', x: 950, y: 150, category: 'product', color: '#10b981' },
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
      name: '三羧酸循环',
      description: '有氧呼吸的核心，将乙酰-CoA氧化为CO2，产生大量能量',
      nodes: [
        { id: 'acetylcoa', name: '乙酰-CoA', x: 100, y: 200, category: 'substrate', color: '#ef4444' },
        { id: 'citrate', name: '柠檬酸', x: 250, y: 100, category: 'intermediate' },
        { id: 'aconitate', name: '顺乌头酸', x: 400, y: 100, category: 'intermediate' },
        { id: 'isocitrate', name: '异柠檬酸', x: 550, y: 100, category: 'intermediate' },
        { id: 'akg', name: 'α-酮戊二酸', x: 700, y: 200, category: 'intermediate' },
        { id: 'succinylcoa', name: '琥珀酰-CoA', x: 700, y: 300, category: 'intermediate' },
        { id: 'succinate', name: '琥珀酸', x: 550, y: 400, category: 'intermediate' },
        { id: 'fumarate', name: '延胡索酸', x: 400, y: 400, category: 'intermediate' },
        { id: 'malate', name: '苹果酸', x: 250, y: 400, category: 'intermediate' },
        { id: 'oxaloacetate', name: '草酰乙酸', x: 100, y: 300, category: 'product', color: '#10b981' },
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
      name: '脂肪酸氧化',
      description: '脂肪酸分解产生乙酰-CoA，进入TCA循环供能',
      nodes: [
        { id: 'fattyacid', name: '脂肪酸', x: 50, y: 150, category: 'substrate', color: '#ef4444' },
        { id: 'acylcoa', name: '脂酰-CoA', x: 150, y: 150, category: 'intermediate' },
        { id: 'enoylcoa', name: '烯酰-CoA', x: 250, y: 150, category: 'intermediate' },
        { id: 'hydoxyacylcoa', name: '羟脂酰-CoA', x: 350, y: 150, category: 'intermediate' },
        { id: 'ketoacylcoa', name: '酮脂酰-CoA', x: 450, y: 150, category: 'intermediate' },
        { id: 'acetylcoa_out', name: '乙酰-CoA', x: 550, y: 150, category: 'product', color: '#10b981' },
        { id: 'short_fa', name: '缩短脂肪酸', x: 550, y: 250, category: 'intermediate' },
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

  const pathway = pathways[selectedPathway] || pathways.glycolysis;

  const isUserGene = (geneStr) => {
    if (!userGenes.length) return false;
    return userGenes.some(g => 
      geneStr.split('/').some(gene => g.toLowerCase().includes(g.toLowerCase()))
    );
  };

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const nodes = pathway.nodes.map(node => ({
      id: node.id,
      name: node.name,
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

    const links = pathway.edges.map((edge, index) => {
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

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'node') {
            const nodeData = pathway.nodes.find(n => n.id === params.data.id);
            return `<strong>${params.name}</strong><br/>类别: ${nodeData?.category === 'substrate' ? '底物' : nodeData?.category === 'product' ? '产物' : '中间产物'}`;
          } else if (params.dataType === 'edge') {
            const edgeData = params.data.data;
            const highlighted = isUserGene(edgeData.gene) ? '<br/><span style="color:#f59e0b">★ 用户基因相关</span>' : '';
            return `<strong>${edgeData.enzyme}</strong><br/>基因: ${edgeData.gene}${highlighted}`;
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

    chartInstance.current.setOption(option);

    chartInstance.current.on('click', (params) => {
      if (params.dataType === 'node') {
        setActiveNode(params.data);
      } else if (params.dataType === 'edge') {
        setActiveNode(null);
      }
    });

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [selectedPathway, userGenes, pathway]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">代谢路径可视化</h2>
        </div>
        <select
          value={selectedPathway}
          onChange={(e) => setActiveNode(null)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="glycolysis">糖酵解途径</option>
          <option value="tca">三羧酸循环</option>
          <option value="fatty_acid">脂肪酸氧化</option>
        </select>
      </div>

      <p className="text-sm text-slate-600 mb-4">{pathway.description}</p>

      <div className="flex gap-4">
        <div className="flex-1 bg-slate-50 rounded-lg p-2" style={{ height: 400 }}>
          <div ref={chartRef} className="w-full h-full" />
        </div>

        <div className="w-64 space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
              <ArrowRight className="w-4 h-4" />
              图例说明
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-slate-600">底物</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <span className="text-slate-600">产物</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-400" />
                <span className="text-slate-600">中间产物</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500" />
                <span className="text-slate-600">用户基因相关</span>
              </div>
            </div>
          </div>

          {activeNode && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">节点详情</h3>
              <p className="text-xs text-slate-600">
                <span className="font-medium">名称:</span> {activeNode.name}
              </p>
            </div>
          )}

          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
              <Leaf className="w-4 h-4" />
              营养关联
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• 葡萄糖: 主要能量来源</li>
              <li>• 丙酮酸: 乳酸发酵底物</li>
              <li>• ATP: 细胞能量货币</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}