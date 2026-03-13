import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { t } from '../data/translations';
import { Language } from '../App';

interface MapComponentProps {
  onRegionClick: (regionName: string) => void;
  selectedRegionId?: string;
  regionMapping: Record<string, string[]>;
  currentLanguage: Language;
}

export const MapComponent: React.FC<MapComponentProps> = ({ onRegionClick, selectedRegionId, regionMapping, currentLanguage }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isRegionSelected = (name: string) => {
    if (!selectedRegionId) return false;
    const mappedIds = regionMapping[name];
    if (mappedIds && mappedIds.includes(selectedRegionId)) return true;
    return false;
  };

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/gazraim-png/qazaqgeo-learn/main/src/data/kazakhstan-regions.json')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading GeoJSON:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;
    console.log('MapComponent: Rendering map for', selectedRegionId || 'all regions');

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    if (width === 0 || height === 0) return;

    // Initialize defs for filters and gradients
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) {
      defs = svg.append('defs');
      
      const filter = defs.append('filter')
        .attr('id', 'shadow')
        .attr('x', '-20%')
        .attr('y', '-20%')
        .attr('width', '140%')
        .attr('height', '140%');
        
      filter.append('feDropShadow')
        .attr('dx', '0')
        .attr('dy', '8')
        .attr('stdDeviation', '8')
        .attr('flood-color', '#000000')
        .attr('flood-opacity', '0.3');

      const gradient = defs.append('linearGradient')
        .attr('id', 'selected-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6');
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#1d4ed8');
    }

    // Initialize or select the main group
    let g = svg.select<SVGGElement>('g.map-content');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'map-content');
      g.append('g').attr('class', 'paths');
      g.append('g').attr('class', 'labels');
      
      // Add a background rect to catch clicks on empty space if needed
      svg.on('click', (event) => {
        if (event.target === svg.node()) {
          console.log('SVG background clicked');
        }
      });
    }

    const gPaths = g.select<SVGGElement>('g.paths');
    const gLabels = g.select<SVGGElement>('g.labels');

    const projection = d3.geoMercator();
    
    // Always fit the whole country to provide context
    const fitTarget = geoData;
    
    // Use fitExtent to ensure padding so the contour is never cut off
    const padding = Math.min(width, height) * 0.05;
    projection.fitExtent([[padding, padding], [width - padding, height - padding]], fitTarget);

    const pathGenerator = d3.geoPath().projection(projection);

    // Update paths
    const paths = gPaths.selectAll<SVGPathElement, any>('path')
      .data(geoData.features, (d: any) => d.properties.NAME_2 || d.properties.NAME_1);

    // Enter
    const pathsEnter = paths.enter()
      .append('path')
      .attr('class', 'cursor-pointer transition-all duration-300')
      .attr('stroke', '#d4d4d8')
      .attr('stroke-width', 1)
      .attr('fill', '#f4f4f5');

    // Merge and Transition
    const mergedPaths = paths.merge(pathsEnter);
    
    // Raise selected path immediately so it transitions on top
    mergedPaths.filter((d: any) => {
      const name = d.properties.NAME_2 || d.properties.NAME_1;
      return isRegionSelected(name);
    }).raise();

    mergedPaths
      .on('click', (event, d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        console.log('Region clicked:', name);
        onRegionClick(name);
      })
      .on('mousemove', (event) => {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseenter', function(event, d: any) {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        setHoveredRegion(name);
        if (!isRegionSelected(name)) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', '#e4e4e7')
            .attr('stroke', '#a1a1aa')
            .attr('stroke-width', 1.5);
        }
      })
      .on('mouseleave', function(event, d: any) {
        setHoveredRegion(null);
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        if (!isRegionSelected(name)) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', '#f4f4f5')
            .attr('stroke', '#d4d4d8')
            .attr('stroke-width', 1);
        }
      });

    mergedPaths
      .transition()
      .duration(750)
      .ease(d3.easeCubicInOut)
      .attr('d', (d: any) => pathGenerator(d))
      .attr('fill', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        return isRegionSelected(name) ? 'url(#selected-gradient)' : '#f4f4f5';
      })
      .attr('stroke', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        return isRegionSelected(name) ? '#ffffff' : '#d4d4d8';
      })
      .attr('stroke-width', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        return isRegionSelected(name) ? 3 : 1;
      })
      .style('filter', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        return isRegionSelected(name) ? 'url(#shadow)' : 'none';
      });

    // Exit
    paths.exit().remove();

    // Update labels
    const labels = gLabels.selectAll<SVGTextElement, any>('text')
      .data(geoData.features, (d: any) => d.properties.NAME_2 || d.properties.NAME_1);

    // Enter
    const labelsEnter = labels.enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .style('opacity', 0);

    // Merge and Transition
    labels.merge(labelsEnter)
      .transition()
      .duration(750)
      .ease(d3.easeCubicInOut)
      .attr('x', (d: any) => {
        const centroid = pathGenerator.centroid(d);
        return isNaN(centroid[0]) ? 0 : centroid[0];
      })
      .attr('y', (d: any) => {
        const centroid = pathGenerator.centroid(d);
        return isNaN(centroid[1]) ? 0 : centroid[1];
      })
      .attr('font-size', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        return isRegionSelected(name) ? '16px' : '8px';
      })
      .attr('fill', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        return isRegionSelected(name) ? '#ffffff' : '#71717a';
      })
      .style('text-shadow', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        return isRegionSelected(name) ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none';
      })
      .style('opacity', (d: any) => {
        const name = d.properties.NAME_2 || d.properties.NAME_1;
        if (isRegionSelected(name)) return 1;
        if (selectedRegionId) return 0;
        return name.length > 15 ? 0 : 1;
      })
      .text((d: any) => d.properties.NAME_2 || d.properties.NAME_1);

    // Exit
    labels.exit().remove();

  }, [geoData, selectedRegionId, regionMapping]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded-3xl border border-zinc-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">{t[currentLanguage].loadingMap}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <svg 
        ref={svgRef} 
        className="w-full h-full bg-zinc-50 rounded-3xl border border-zinc-200"
      />
      {hoveredRegion && (
        <div 
          className="fixed pointer-events-none z-[100] px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg shadow-xl"
          style={{ 
            left: mousePos.x + 15, 
            top: mousePos.y - 15 
          }}
        >
          {hoveredRegion}
        </div>
      )}
    </div>
  );
};
