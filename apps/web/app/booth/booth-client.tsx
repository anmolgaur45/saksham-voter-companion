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

const MAPS_API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY ?? "";

export default function BoothClient({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [data, setData] = useState<BoothData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booth | null>(null);

  async function search(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const result = await searchBooth(q.trim());
      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result);
      }
    } catch {
      setError("Failed to fetch booth data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) search(initialQuery);
  }, [initialQuery]);

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Polling Booth Finder</h1>

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
          placeholder="Enter constituency or city (e.g. Lucknow, New Delhi)"
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && (
        <>
          <p className="text-sm text-muted-foreground">
            {data.booths.length} booth{data.booths.length !== 1 ? "s" : ""} in{" "}
            <span className="font-medium text-foreground">
              {data.name}, {data.state}
            </span>
          </p>

          <div className="rounded-lg overflow-hidden border" style={{ height: 400 }}>
            <APIProvider apiKey={MAPS_API_KEY}>
              <Map
                defaultCenter={data.center}
                defaultZoom={14}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
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
          </div>

          <ul className="divide-y rounded-lg border">
            {data.booths.map((booth, i) => (
              <li
                key={booth.id}
                className="px-4 py-3 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelected(booth)}
              >
                <p className="font-medium">
                  {i + 1}. {booth.name}
                </p>
                <p className="text-muted-foreground mt-0.5">{booth.address}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
