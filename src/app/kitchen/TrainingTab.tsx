"use client";

import { useEffect, useState } from "react";
import { fetchTrainingResources } from "./api-client";
import type { TrainingResourceRecord } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";
import LoadingScreen from "./LoadingScreen";

export default function TrainingTab({ locationId, lang }: { locationId: string; lang: Lang }) {
  const t = strings[lang];
  const [resources, setResources] = useState<TrainingResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingResources(locationId)
      .then((r) => setResources(r.resources))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (resources.length === 0) {
    return (
      <div style={{ paddingTop: 40, textAlign: "center", color: "var(--color-muted)", fontSize: 15 }}>
        {t.trainingNothingHere}
      </div>
    );
  }

  const categories = Array.from(new Set(resources.map((r) => r.category)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingTop: 20 }}>
      {categories.map((category) => (
        <div key={category} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              padding: "6px 10px",
              background: "var(--color-surface-sunken)",
              borderLeft: "3px solid var(--color-accent)",
            }}
          >
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13.5, letterSpacing: ".08em", color: "var(--color-accent-900)" }}>
              {category.toUpperCase()}
            </span>
          </div>
          {resources
            .filter((r) => r.category === category)
            .map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minHeight: 58,
                  padding: "12px 14px",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 15.5, fontWeight: 600 }}>{resource.title}</span>
                  {resource.description && (
                    <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{resource.description}</span>
                  )}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            ))}
        </div>
      ))}
    </div>
  );
}
