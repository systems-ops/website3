"use client";

import { useEffect, useState } from "react";
import { fetchTrainingResources } from "./api-client";
import type { TrainingResourceRecord } from "./types";
import type { Lang } from "./strings";
import { strings } from "./strings";

export default function TrainingTab({ locationId, lang }: { locationId: string; lang: Lang }) {
  const t = strings[lang];
  const [resources, setResources] = useState<TrainingResourceRecord[]>([]);

  useEffect(() => {
    fetchTrainingResources(locationId)
      .then((r) => setResources(r.resources))
      .catch(() => setResources([]));
  }, [locationId]);

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
        <div key={category} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, color: "var(--color-muted)" }}>
            {category}
          </span>
          {resources
            .filter((r) => r.category === category)
            .map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  minHeight: 58,
                  padding: "12px 14px",
                  border: "1px solid var(--color-divider)",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 15.5, fontWeight: 600 }}>{resource.title}</span>
                {resource.description && (
                  <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{resource.description}</span>
                )}
              </a>
            ))}
        </div>
      ))}
    </div>
  );
}
