"use client";

import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchBooth } from "@/app/chat/actions";
import type { Booth, BoothData } from "@/lib/api";
import { useI18n } from "@/lib/useI18n";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY ?? "";

export default function BoothClient({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [data, setData] = useState<BoothData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booth | null>(null);

  const t = useI18n({
    heading: "Polling Booth Finder",
    placeholder: "Constituency or city",
    search: "Search",
    searching: "…",
    errorMsg: "Failed to fetch booth data. Please try again.",
    noResults: "Search for a constituency to see polling booths.",
    mapPlaceholder: "Map will appear after search.",
  });

  async function search(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      setData(await searchBooth(q.trim()));
    } catch {
      setError(t.errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialQuery) void search(initialQuery);
  }, [initialQuery]);

  return (
    <div className="h-full flex flex-col md:flex-row gap-0 md:gap-px">
      {/* Sidebar */}
      <div className="md:w-80 shrink-0 flex flex-col border-b md:border-b-0 md:border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-base font-semibold mb-3">{t.heading}</h1>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              search(query);
            }}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 text-sm"
            />
            <Button type="submit" disabled={loading} size="sm">
              {loading ? t.searching : t.search}
            </Button>
          </form>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>

        {data && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            <p className="text-xs text-muted-foreground px-4 py-2 border-b">
              {data.booths.length} booth{data.booths.length !== 1 ? "s" : ""} in{" "}
              <span className="font-medium text-foreground">
                {data.name}, {data.state}
              </span>
            </p>
            <ul className="divide-y">
              {data.booths.map((booth, i) => (
                <li key={booth.id}>
                  <button
                    type="button"
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      selected?.id === booth.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                    onClick={() => setSelected(booth)}
                    aria-label={`${booth.name} · ${booth.address}`}
                  >
                    <p className="text-xs font-medium leading-snug">
                      {i + 1}. {booth.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {booth.address}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!data && !loading && (
          <p className="text-xs text-muted-foreground p-4">
            {t.noResults}
          </p>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[400px] md:min-h-0 bg-muted/20">
        {data ? (
          <APIProvider apiKey={MAPS_API_KEY}>
            <Map
              defaultCenter={data.center}
              defaultZoom={14}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              className="w-full h-full"
            >
              {data.booths.map((booth) => (
                <AdvancedMarker
                  key={booth.id}
                  position={{ lat: booth.lat, lng: booth.lng }}
                  onClick={() => setSelected(booth)}
                />
              ))}
              {selected && (
                <InfoWindow
                  position={{ lat: selected.lat, lng: selected.lng }}
                  onCloseClick={() => setSelected(null)}
                  pixelOffset={[0, -40]}
                >
                  <div className="text-sm max-w-[200px]">
                    <p className="font-medium">{selected.name}</p>
                    <p className="text-muted-foreground mt-0.5">{selected.address}</p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            {t.mapPlaceholder}
          </div>
        )}
      </div>
    </div>
  );
}
