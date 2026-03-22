"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { CampaignData, NPCData } from "@/lib/data";

// ── Types ──────────────────────────────────────────────────────────────

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  race: string | null;
  role: string | null;
  faction: string | null;
  disposition: string;
  status: string;
  connectionCount: number;
}

interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: "storyline" | "session" | "secret" | "faction";
  label: string;
}

// ── Colors ─────────────────────────────────────────────────────────────

const FACTION_COLORS: Record<string, string> = {
  "Black Wax Raven Guild": "#a78bfa",
  "Briani Crown & Glint Ministry": "#f59e0b",
  "Court of Veridian Tides": "#06b6d4",
  "Guild of the Graceful Sun": "#fbbf24",
  Independent: "#94a3b8",
  "Silver Scale Consortium": "#64748b",
};

const STATUS_COLORS: Record<string, string> = {
  alive: "#34d399",
  dead: "#6b7280",
  missing: "#f59e0b",
  hostile: "#ef4444",
};

const EDGE_COLORS: Record<string, string> = {
  storyline: "#818cf8",
  session: "#34d399",
  secret: "#f472b6",
  faction: "#fbbf2480",
};

function getFactionColor(faction: string | null): string {
  if (!faction) return "#6b7280";
  return FACTION_COLORS[faction] || "#6b7280";
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] || "#6b7280";
}

// ── Edge derivation ────────────────────────────────────────────────────

function deriveEdges(npcs: NPCData[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  function addEdge(a: string, b: string, type: GraphEdge["type"], label: string) {
    const key = [a, b].sort().join(":") + ":" + type;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source: a, target: b, type, label });
  }

  // Shared storylines
  const storylineToNPCs = new Map<string, string[]>();
  for (const npc of npcs) {
    for (const sl of npc.storylineLinks) {
      const arr = storylineToNPCs.get(sl.storylineId) || [];
      arr.push(npc.id);
      storylineToNPCs.set(sl.storylineId, arr);
    }
  }
  Array.from(storylineToNPCs.entries()).forEach(([, ids]) => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const sl = npcs.find((n) => n.id === ids[0])?.storylineLinks[0];
        const label = sl ? sl.storyline.title : "Storyline";
        addEdge(ids[i], ids[j], "storyline", label);
      }
    }
  });

  // Shared sessions
  const sessionToNPCs = new Map<string, string[]>();
  for (const npc of npcs) {
    for (const sl of npc.sessionLinks) {
      const arr = sessionToNPCs.get(sl.sessionId) || [];
      arr.push(npc.id);
      sessionToNPCs.set(sl.sessionId, arr);
    }
  }
  Array.from(sessionToNPCs.entries()).forEach(([, ids]) => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j], "session", "Co-appeared");
      }
    }
  });

  // Shared secrets
  const secretToNPCs = new Map<string, string[]>();
  for (const npc of npcs) {
    for (const sl of npc.secretLinks) {
      const arr = secretToNPCs.get(sl.secretId) || [];
      arr.push(npc.id);
      secretToNPCs.set(sl.secretId, arr);
    }
  }
  Array.from(secretToNPCs.entries()).forEach(([, ids]) => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j], "secret", "Shared secret");
      }
    }
  });

  // Same faction
  const factionToNPCs = new Map<string, string[]>();
  for (const npc of npcs) {
    if (npc.faction) {
      const arr = factionToNPCs.get(npc.faction) || [];
      arr.push(npc.id);
      factionToNPCs.set(npc.faction, arr);
    }
  }
  Array.from(factionToNPCs.entries()).forEach(([faction, ids]) => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        addEdge(ids[i], ids[j], "faction", faction);
      }
    }
  });

  return edges;
}

// ── Component ──────────────────────────────────────────────────────────

export function NPCWeb({ campaign }: { campaign: CampaignData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    npc: GraphNode;
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [activeEdgeFilters, setActiveEdgeFilters] = useState<Set<string>>(
    new Set(["storyline", "session", "secret", "faction"])
  );
  const [activeStatusFilters, setActiveStatusFilters] = useState<Set<string>>(
    new Set(["alive", "dead", "missing", "hostile"])
  );

  const toggleEdgeFilter = (type: string) => {
    setActiveEdgeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleStatusFilter = (status: string) => {
    setActiveStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  // Derive factions for legend
  const factions = React.useMemo(() => {
    const set = new Set<string>();
    campaign.npcs.forEach((npc) => {
      if (npc.faction) set.add(npc.faction);
    });
    return Array.from(set).sort();
  }, [campaign.npcs]);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setDimensions({
        width: entry.contentRect.width,
        height: Math.max(entry.contentRect.height, 500),
      });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Build + render graph
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const npcs = campaign.npcs;
    const allEdges = deriveEdges(npcs);

    // Filter edges by active filters
    const edges = allEdges.filter((e) => activeEdgeFilters.has(e.type));

    // Count connections per node
    const connCount = new Map<string, number>();
    for (const e of edges) {
      const s = typeof e.source === "string" ? e.source : e.source.id;
      const t = typeof e.target === "string" ? e.target : e.target.id;
      connCount.set(s, (connCount.get(s) || 0) + 1);
      connCount.set(t, (connCount.get(t) || 0) + 1);
    }

    // Filter nodes by status
    const filteredNPCs = npcs.filter((n) =>
      activeStatusFilters.has(n.status.toLowerCase())
    );
    const filteredIds = new Set(filteredNPCs.map((n) => n.id));

    const nodes: GraphNode[] = filteredNPCs.map((n) => ({
      id: n.id,
      name: n.name,
      race: n.race,
      role: n.role,
      faction: n.faction,
      disposition: n.disposition,
      status: n.status,
      connectionCount: connCount.get(n.id) || 0,
    }));

    // Filter edges to only include visible nodes
    const visibleEdges = edges.filter((e) => {
      const s = typeof e.source === "string" ? e.source : e.source.id;
      const t = typeof e.target === "string" ? e.target : e.target.id;
      return filteredIds.has(s) && filteredIds.has(t);
    });

    // ── Simulation ─────────────────────
    const NODE_RADIUS = 32;
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphEdge>(visibleEdges)
          .id((d) => d.id)
          .distance(200)
      )
      .force("charge", d3.forceManyBody().strength(-900))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(NODE_RADIUS + 30))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    // ── Zoom ───────────────────────────
    const g = svg.append("g");
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom as any);

    // ── Edges ──────────────────────────
    const linkGroup = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(visibleEdges)
      .join("line")
      .attr("stroke", (d) => EDGE_COLORS[d.type])
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", (d) =>
        d.type === "faction" ? "6 4" : d.type === "secret" ? "3 4" : "none"
      )
      .attr("stroke-opacity", 0.35);

    // ── Nodes ──────────────────────────
    const nodeGroup = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      );

    // Outer glow ring
    nodeGroup
      .append("circle")
      .attr("r", NODE_RADIUS + 4)
      .attr("fill", "none")
      .attr("stroke", (d) => getFactionColor(d.faction))
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.2);

    // Main circle — dark fill with thick faction border
    nodeGroup
      .append("circle")
      .attr("r", NODE_RADIUS)
      .attr("fill", "#141420")
      .attr("stroke", (d) => getFactionColor(d.faction))
      .attr("stroke-width", 2.5);

    // Bold initial letter
    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.38em")
      .attr("font-size", 22)
      .attr("font-weight", "600")
      .attr("font-family", "Inter, sans-serif")
      .attr("fill", "#e4e4e7")
      .attr("pointer-events", "none")
      .text((d) => d.name.charAt(0));

    // Node name below
    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", NODE_RADIUS + 16)
      .attr("font-size", 11)
      .attr("font-family", "Inter, sans-serif")
      .attr("fill", "#a1a1aa")
      .attr("pointer-events", "none")
      .text((d) => d.name);

    // Status dot
    nodeGroup
      .append("circle")
      .attr("cx", NODE_RADIUS - 2)
      .attr("cy", -(NODE_RADIUS - 2))
      .attr("r", 5)
      .attr("fill", (d) => getStatusColor(d.status))
      .attr("stroke", "#141420")
      .attr("stroke-width", 2);

    // ── Hover interactions ─────────────
    nodeGroup
      .on("mouseenter", (_event, d) => {
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        visibleEdges.forEach((e) => {
          const s =
            typeof e.source === "object"
              ? (e.source as GraphNode).id
              : e.source;
          const t =
            typeof e.target === "object"
              ? (e.target as GraphNode).id
              : e.target;
          if (s === d.id) connectedIds.add(t);
          if (t === d.id) connectedIds.add(s);
        });

        nodeGroup.attr("opacity", (n) =>
          connectedIds.has(n.id) ? 1 : 0.12
        );
        linkGroup
          .attr("stroke-opacity", (e) => {
            const s =
              typeof e.source === "object"
                ? (e.source as GraphNode).id
                : e.source;
            const t =
              typeof e.target === "object"
                ? (e.target as GraphNode).id
                : e.target;
            return s === d.id || t === d.id ? 0.8 : 0.03;
          })
          .attr("stroke-width", (e) => {
            const s =
              typeof e.source === "object"
                ? (e.source as GraphNode).id
                : e.source;
            const t =
              typeof e.target === "object"
                ? (e.target as GraphNode).id
                : e.target;
            return s === d.id || t === d.id ? 2.5 : 1;
          });
      })
      .on("mouseleave", () => {
        nodeGroup.attr("opacity", 1);
        linkGroup.attr("stroke-opacity", 0.35).attr("stroke-width", 1.5);
      });

    // ── Click for tooltip ──────────────
    nodeGroup.on("click", (event, d) => {
      event.stopPropagation();
      const [x, y] = d3.pointer(event, containerRef.current);
      setTooltip({ x, y, npc: d });
    });
    svg.on("click", () => setTooltip(null));

    // ── Tick ───────────────────────────
    simulation.on("tick", () => {
      linkGroup
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);
      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [campaign.npcs, dimensions, activeEdgeFilters, activeStatusFilters]);

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mr-1">
          Filter
        </span>
        {/* Edge type filters */}
        {(["storyline", "session", "secret", "faction"] as const).map(
          (type) => (
            <button
              key={type}
              onClick={() => toggleEdgeFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeEdgeFilters.has(type)
                  ? "border-white/20 text-white bg-white/[0.06]"
                  : "border-white/[0.06] text-zinc-600 bg-transparent"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: EDGE_COLORS[type] }}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          )
        )}

        <span className="w-px h-4 bg-white/10 mx-1" />

        {/* Status filters */}
        {(["alive", "dead", "missing", "hostile"] as const).map((status) => (
          <button
            key={status}
            onClick={() => toggleStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeStatusFilters.has(status)
                ? "border-white/20 text-white bg-white/[0.06]"
                : "border-white/[0.06] text-zinc-600 bg-transparent"
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Graph + Legend container */}
      <div
        ref={containerRef}
        className="relative w-full h-[calc(100vh-14rem)] rounded-xl border border-white/[0.06] bg-[#0d0d18] overflow-hidden"
      >
        {/* Factions legend — bottom left */}
        <div className="absolute bottom-4 left-4 z-10 p-3 rounded-lg bg-[#0d0d18]/80 backdrop-blur-sm border border-white/[0.08] text-[11px] space-y-1.5">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Factions
          </span>
          {factions.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getFactionColor(f) }}
              />
              <span className="text-zinc-400">{f}</span>
            </div>
          ))}
        </div>

        {/* SVG */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 p-4 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-white/[0.1] shadow-2xl min-w-[220px] animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: Math.min(tooltip.x, dimensions.width - 240),
              top: Math.min(tooltip.y, dimensions.height - 200),
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold"
                style={{
                  backgroundColor: "#141420",
                  color: getFactionColor(tooltip.npc.faction),
                  border: `2px solid ${getFactionColor(tooltip.npc.faction)}`,
                }}
              >
                {tooltip.npc.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {tooltip.npc.name}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {[tooltip.npc.race, tooltip.npc.role]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {tooltip.npc.faction && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Faction</span>
                  <span className="text-zinc-300">{tooltip.npc.faction}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <span className="text-zinc-300 capitalize">
                  {tooltip.npc.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Disposition</span>
                <span className="text-zinc-300 capitalize">
                  {tooltip.npc.disposition}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Connections</span>
                <span className="text-zinc-300">
                  {tooltip.npc.connectionCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
