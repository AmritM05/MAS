"use client";

import React from "react";

function stripHtml(input: string) {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function convertPlanToEnglish(plan: any): string[] {
  if (!plan) return ["No plan available."];

  if (typeof plan === "string") {
    return [stripHtml(plan)];
  }

  if (Array.isArray(plan)) {
    return plan.map((p, i) => {
      if (typeof p === "string") return stripHtml(p);
      if (typeof p === "object") {
        const keys = Object.keys(p);
        if (keys.length === 1) return `${keys[0]}: ${stripHtml(String(p[keys[0]]))}`;
        return keys.map(k => `${k}: ${stripHtml(String(p[k]))}`).join(" — ");
      }
      return String(p);
    });
  }

  if (typeof plan === "object") {
    // If it has steps or actions, prefer that
    if (plan.steps && Array.isArray(plan.steps)) {
      return plan.steps.map((s: any, i: number) => {
        if (typeof s === "string") return `${i + 1}. ${stripHtml(s)}`;
        if (s.title || s.description) return `${i + 1}. ${stripHtml(String(s.title || ""))} ${stripHtml(String(s.description || ""))}`.trim();
        return `${i + 1}. ${stripHtml(JSON.stringify(s))}`;
      });
    }

    return Object.entries(plan).map(([k, v]) => `${k}: ${stripHtml(String(v))}`);
  }

  return [String(plan)];
}

export default function RecommendedPlan({ plan }: { plan: any }) {
  const lines = convertPlanToEnglish(plan);

  return (
    <div className="futuristic-card p-4 mt-4">
      <h3 className="text-lg font-semibold mb-2 accent-text">Recommended Plan</h3>
      <div className="space-y-2">
        {lines.map((line, idx) => (
          <p key={idx} className="text-sm text-slate-100">{line}</p>
        ))}
      </div>
    </div>
  );
}
